const fs = require('fs');
const glob = require('glob');

const files = glob.sync('components/**/*.tsx');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Replace text-[9px] and text-[10px]
  content = content.replace(/text-\[9px\]/g, 'text-[11px]');
  content = content.replace(/text-\[10px\]/g, 'text-xs');

  // Specific font-black replacements based on size context
  // Size + font-black
  content = content.replace(/text-(xl|2xl|3xl|4xl|5xl)(\s+)font-black/g, 'text-$1$2font-bold');
  content = content.replace(/font-black(\s+)text-(xl|2xl|3xl|4xl|5xl)/g, 'font-bold$1text-$2');
  
  content = content.replace(/text-(lg)(\s+)font-black/g, 'text-$1$2font-semibold');
  content = content.replace(/font-black(\s+)text-(lg)/g, 'font-semibold$1text-$2');
  
  // Catch remaining font-black (buttons, labels) -> font-semibold by default, except numbers
  content = content.replace(/font-black/g, 'font-semibold');
  
  // Button text: font-semibold
  // Replace <button className="... font-bold ..."> -> font-semibold
  // This is a bit tricky with regex, we can just replace font-bold -> font-semibold in general where it feels like a button or small text.
  content = content.replace(/text-(xs|sm)(\s+)font-bold/g, 'text-$1$2font-semibold');
  content = content.replace(/font-bold(\s+)text-(xs|sm)/g, 'font-semibold$1text-$2');
  
  // For page titles (usually text-xl or 2xl), they should be font-bold.
  // The above keeps text-xl font-bold as is because they were font-black or already font-bold.
  
  fs.writeFileSync(file, content, 'utf8');
});
