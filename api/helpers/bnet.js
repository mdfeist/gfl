/*
Regex for battle net tag:
(^([A-zÀ-ú][A-zÀ-ú0-9]{2,11})|(^([а-яёА-ЯЁÀ-ú][а-яёА-ЯЁ0-9À-ú]{2,11})))(#[0-9]{4,})$

Created by: https://eu.forums.blizzard.com/en/blizzard/t/battle-tag-regex-expression/444

Rules:
 - Numbers allowed, except for the first Letter
 - Latin Alphabet or Cyrillic alphabet, but not a mixture
 - Accented Letters are allowed in both situations
 - No spaces or punctuations
 - No Special Characters e.g. #, -, …
 - 3-12 Characters
 - The tag is a 4-5 numbers

Explanation:
 - 2 Groups: 1 for Latin Alphabet and 1 for Cyrillic Alphabet
 - The first character can't be a number
 - The Latin used A-z and À-ú
 - The Cyrillic alphabet used а-я, А-Я, ё, Ё, and À-ú.
*/
const BNET_PATTERN = /(^([A-zÀ-ú][A-zÀ-ú0-9]{2,11})|(^([а-яёА-ЯЁÀ-ú][а-яёА-ЯЁ0-9À-ú]{2,11})))(#[0-9]{4,})$/;
const BNET_REGEX = new RegExp(BNET_PATTERN);

module.exports.checkValidBnet = (bnet) => {
    return BNET_REGEX.test(bnet);
};

module.exports.getBnetName = (bnet) => {
    let results = BNET_REGEX.exec(bnet);
    return results[1];
};

module.exports.getBnetTag = (bnet) => {
    let results = BNET_REGEX.exec(bnet);
    return results[5].substr(1);
};

module.exports.BNET_PATTERN = BNET_PATTERN;