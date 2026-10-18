const fs = require('fs');
const glob = require('glob');

const files = glob.sync('components/**/*.tsx');
files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const buttonRegex = /<button[\s>]/g;
  let match;
  while ((match = buttonRegex.exec(content)) !== null) {
    // extract until closing >
    let closingIndex = content.indexOf('>', match.index);
    let attrs = content.substring(match.index, closingIndex + 1);
    if (!attrs.includes('onClick') && !attrs.includes('type="submit"')) {
      console.log(`${file}: Line ${content.substring(0, match.index).split('\n').length}`);
      console.log(attrs);
    }
  }
});
