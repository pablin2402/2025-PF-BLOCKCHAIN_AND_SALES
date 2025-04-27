const diacriticsMap = {
    'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u',
    'à': 'a', 'è': 'e', 'ì': 'i', 'ò': 'o', 'ù': 'u',
    'ä': 'a', 'ë': 'e', 'ï': 'i', 'ö': 'o', 'ü': 'u',
    'â': 'a', 'ê': 'e', 'î': 'i', 'ô': 'o', 'û': 'u',
    'ñ': 'n', 'ç': 'c',
};

function removeDiacritics(text) {
    return text.replace(/[áéíóúàèìòùäëïöüâêîôûñç]/g, match => diacriticsMap[match]);
}
module.exports = {
    removeDiacritics
};
