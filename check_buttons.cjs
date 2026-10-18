const fs = require('fs');
const glob = require('glob');

const files = glob.sync('components/**/*.tsx');
files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  // Match <button ... > where it doesn't contain onClick or type="submit"
  // Since attributes can contain >, we need a more robust regex or just check the whole tag.
  const buttonRegex = /<button\s+([^>]*?)>/gs;
  let match;
  while ((match = buttonRegex.exec(content)) !== null) {
    const attrs = match[1];
    if (!attrs.includes('onClick') && !attrs.includes('type="submit"')) {
      console.log(`${file}: Line ${content.substring(0, match.index).split('\n').length}`);
      console.log(match[0]);
    }
  }
});
