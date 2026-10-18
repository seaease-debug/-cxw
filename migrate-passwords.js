import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, 'assets.db');
console.log('正在连接 SQLite 数据库:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('⚠️ 无法连接数据库:', err.message);
    process.exit(1);
  }
  console.log('✅ 数据库连接成功');
  runMigration();
});

function runMigration() {
  db.all('SELECT id, username, password FROM accounts', [], (err, rows) => {
    if (err) {
      console.error('⚠️ 读取账号表失败:', err.message);
      db.close();
      process.exit(1);
    }

    console.log(`📊 发现 ${rows.length} 个账号记录`);

    let alreadyHashedCount = 0;
    let migratedCount = 0;
    let failedCount = 0;

    if (rows.length === 0) {
      console.log('✅ 无需迁移任何账号。');
      db.close();
      return;
    }

    db.serialize(() => {
      db.run('BEGIN TRANSACTION');

      rows.forEach((row) => {
        const { id, username, password } = row;
        
        // Check if password looks like bcrypt hash (starts with $2y$, $2b$, $2a$ etc.)
        const isBcrypt = password && password.startsWith('$2') && password.length >= 50;

        if (isBcrypt) {
          alreadyHashedCount++;
          console.log(`[-] 账号: ${username} (ID: ${id}) 已经是 bcrypt 哈希，跳过。`);
        } else {
          try {
            const hashedPassword = bcrypt.hashSync(password, 10);
            db.run('UPDATE accounts SET password = ? WHERE id = ?', [hashedPassword, id], (updateErr) => {
              if (updateErr) {
                failedCount++;
                console.error(`❌ 更新账号 ${username} (ID: ${id}) 失败:`, updateErr.message);
              }
            });
            migratedCount++;
            console.log(`[+] 账号: ${username} (ID: ${id}) 明文密码已成功迁移为 bcrypt 哈希`);
          } catch (hashErr) {
            failedCount++;
            console.error(`❌ 哈希账号 ${username} (ID: ${id}) 密码时出错:`, hashErr.message);
          }
        }
      });

      db.run('COMMIT', (commitErr) => {
        if (commitErr) {
          console.error('⚠️ 提交事务失败:', commitErr.message);
          db.close();
          process.exit(1);
        }

        console.log('\n=======================================');
        console.log('🎉 密码哈希迁移完成！统计结果如下：');
        console.log('---------------------------------------');
        console.log(`  总计账号数:   ${rows.length}`);
        console.log(`  跳过已哈希:   ${alreadyHashedCount}`);
        console.log(`  成功迁移数:   ${migratedCount}`);
        console.log(`  失败记录数:   ${failedCount}`);
        console.log('=======================================\n');

        db.close(() => {
          console.log('✅ 数据库连接已安全关闭');
          process.exit(0);
        });
      });
    });
  });
}
