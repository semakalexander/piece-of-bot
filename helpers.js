const textToSearchQuery = (text, keywords) => encodeURI(
  keywords
    .reduce((str, keyword) => str.replace(keyword, ''), text)
    .trim()
    .replace(/\s/g, '+')
);

module.exports = {
  textToSearchQuery
};
