const textToSearchQuery = (text, keywords) => encodeURI(
  keywords
    .reduce((str, keyword) => str.replace(keyword, ''), text)
    .trim()
    .replace(/\s/g, '+')
);

const formatHelpResponse = o =>
  Object.keys(o).map(key => `*${key}*` + ':\n  ' + `_${o[key]}_`).join('\n\n');


module.exports = {
  textToSearchQuery,
  formatHelpResponse
};
