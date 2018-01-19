/**
 * ==========================
 * @description Trie with pushing regular expressions. Used in ACN meta. Contains root node of the trie.
 * ==========================
 *
 * @author  Evgeny Savelyev
 * @since   19.01.18
 * @version 1.0.0
 * @license See the LICENCE file in the project root.
 */

"use strict";

/**
 * @class
 * @classdesc Trie with pushing regular expressions. Used in ACN meta. Contains root node of the trie.
 *
 * @property {Node} root root node of the trie
 */
class PushingTrie {
    constructor() {
        this.root = new Node(false);
    }

    /**
     * @desc Put new string into the trie.
     *
     * @param {string} str new string
     * @returns {void} nothing
     */
    putString(str) {
        if (str.length !== 0) {
            this.root.putString(str, 0);
        }
    }

    /**
     * @desc Put new regular expression into the trie.
     *
     * @param {Regex} regex new regex
     * @param {function(string, Node):void} resolveFunc function to call when regex is pushed
     * @returns {void} nothing
     */
    putRegex(regex, resolveFunc) {
        this.root.pushRegex(regex, resolveFunc, "");
    }
}

/**
 * @class
 * @classdesc Pushing trie node (state) with recursive links to other nodes.
 *
 * @property {map<symbol, PushingTrie>} symbolStateMap mapping { symbol (char) : node (PushingTrie) }
 * @property {{regex:Regex, resolve:(function(string, Node):void)}[]} pushRegexes array of pushing regular expressions (with function called due resolving)
 * @property {(function(string, Node):void)[]} resolveRegexes array of resolve function for final states of regular expressions
 * @property {boolean} isFinalState whether the state is final (generates complete string from the root node)
 */
class Node {
    constructor() {
        this.symbolStateMap = {};
        this.pushRegexes    = [];
        this.resolveRegexes = [];
        this.isFinalState   = false;
    }

    putString(str, index) {
        if (index === str.length - 1) {
            this.isFinalState = true;

            for (const resolveRegex of this.resolveRegexes) {
                resolveRegex(str, this);
            }
        } else {
            const ch = str[index];

            if (this.symbolStateMap[ch] === null) { /* TODO removing regex from pushing if no more potential symbols to traverse through */
                this.symbolStateMap[ch] = new Node();

                for (const regexPart of this.pushRegexes) {
                    if (regexPart.regex.firstSymbolMatches(ch)) {
                        this.symbolStateMap[ch].pushRegex(regexPart.regex.detachFirstSymbol(ch), regexPart.resolve, str.slice(0, index));
                    }
                }
            }

            this.symbolStateMap[ch].putString(str, index + 1);
        }
    }

    pushRegex(regex, resolveFunc, prefix) {
        if (regex.isEmpty()) {
            this.resolveRegexes.push(resolveFunc);

            if (this.isFinalState) {
                resolveFunc(prefix, this);
            }
        } else {
            this.pushRegexes.push({
                regex   : regex,
                resolve : resolveFunc
            });
        }

        for (const ch in this.symbolStateMap) {
            if (this.hasOwnProperty(ch) && regex.firstSymbolMatches(ch)) {
                this.symbolStateMap[ch].pushRegex(regex.detachFirstSymbol(ch), resolveFunc, prefix + ch);
            }
        }
    }
}

exports = module.exports = PushingTrie;