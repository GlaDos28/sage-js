/**
 * ==========================
 * @description Regular expression implementation. Used for defining templated identifiers in constrains, as well as in pushing trie algorithm.
 * ==========================
 *
 * @author  Evgeny Savelyev
 * @since   19.01.18
 * @version 1.0.0
 * @license See the LICENCE file in the project root.
 */

"use strict";

/* TODO real implementation (not constant strings only) */

/**
 * @class
 * @classdesc Regular expression implementation. Used for defining templated identifiers in constrains, as well as in pushing trie algorithm.
 *
 * @property {string|null} str regex string representation. May be null (because used for debugging only)
 */
class Regex {
    constructor(regexString) {
        this.str = regexString;
    }

    firstSymbolMatches(symbol) {
        return this.str.startsWith(symbol);
    }

    detachFirstSymbol(symbol) {
        return new Regex(this.str.substr(1));
    }

    isEmpty() {
        return this.str.length === 0;
    }
}

exports = module.exports = Regex;