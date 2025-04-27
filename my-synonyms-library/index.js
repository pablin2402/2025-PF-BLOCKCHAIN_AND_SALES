const synonymsData = require('./data');

function getSynonyms(word) {
    const lowerWord = word.toLowerCase();
    return synonymsData[lowerWord] || [];
}

module.exports = {
    getSynonyms
};
