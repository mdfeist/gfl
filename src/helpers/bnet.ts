import fetch from 'node-fetch';
import DOMParser from 'dom-parser';

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
export const BNET_PATTERN = /(^([A-zÀ-ú][A-zÀ-ú0-9]{2,11})|(^([а-яёА-ЯЁÀ-ú][а-яёА-ЯЁ0-9À-ú]{2,11})))(#[0-9]{4,})$/;
const BNET_REGEX = new RegExp(BNET_PATTERN);

export function checkValidBnet(bnet : string) {
    return BNET_REGEX.test(bnet);
};

export function getBnetName(bnet : string) {
    const results = BNET_REGEX.exec(bnet);
    return results[1];
};

export function getBnetTag(bnet : string) {
    const results = BNET_REGEX.exec(bnet);
    return results[5].substr(1);
};

export async function getSR(bnet : string) {
    const results = BNET_REGEX.exec(bnet);
    
    const name = results[1];
    const tag = results[5].substr(1);

    const url = 'https://playoverwatch.com/en-us/career/pc/' + name + '-' + tag;
    
    let response = await fetch(url);

    if (response.ok) {
        let html = await response.text();

        // Convert the HTML string into a document object
        let parser = new DOMParser();
        let doc = parser.parseFromString(html);

        let sr_divs = doc.getElementsByClassName('competitive-rank-level');

        let roles = [
            {
                role: 'tank',
                sr: 0
            },
            {
                role: 'damage',
                sr: 0
            },
            {
                role: 'support',
                sr: 0
            }
        ];

        for (let i = 0, len = sr_divs.length | 0; i < Math.min(len, 3); i = i + 1 | 0) {
            roles[i].sr = parseInt(sr_divs[i].textContent);
        }

        return roles;

    } else {
        throw new Error("HTTP-Error: " + response.status);
    }
};