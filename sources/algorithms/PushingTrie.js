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
     * @param {boolean} finalStateOnly whether resolve function triggers only on final states
     * @returns {void} nothing
     */
    putRegex(regex, resolveFunc, finalStateOnly) {
        this.root.pushRegex(regex, resolveFunc, finalStateOnly, "");
    }
}

/**
 * @class
 * @classdesc Pushing trie node (state) with recursive links to other nodes.
 *
 * @property {map<symbol, Node>} symbolStateMap mapping { symbol (char) : node (Node) }
 * @property {{regex:Regex, resolve:(function(string, Node):void), finalStateOnly:boolean, pushesLeft:int}[]} pushRegexes array of pushing regular expressions (with function called due resolving)
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
        if (index === str.length) {
            this.isFinalState = true;

            for (const resolveRegex of this.resolveRegexes) {
                resolveRegex(str, this);
            }
        } else {
            const ch = str[index];

            if (!this.symbolStateMap[ch]) {
                this.symbolStateMap[ch] = new Node();

                const leftPushRegexes = [];

                for (let i = 0; i < this.pushRegexes.length; i += 1) {
                    const regexPart = this.pushRegexes[i];

                    if (regexPart.regex.firstSymbolMatches(ch)) {
                        this.symbolStateMap[ch].pushRegex(regexPart.regex.detachFirstSymbol(ch), regexPart.resolve, regexPart.finalStateOnly, str.slice(0, index));
                        regexPart.pushesLeft -= 1;

                        if (regexPart.pushesLeft > 0) {
                            leftPushRegexes.push(regexPart);
                        }
                    }
                }

                this.pushRegexes = leftPushRegexes;
            }

            this.symbolStateMap[ch].putString(str, index + 1);
        }
    }

    pushRegex(regex, resolveFunc, finalStateOnly, prefix) {
        if (regex.isEmpty()) {
            if (finalStateOnly) {
                this.resolveRegexes.push(resolveFunc);
            }

            if (this.isFinalState || !finalStateOnly) {
                resolveFunc(prefix, this);
            }
        } else {
            const pushRegex = {
                regex          : regex,
                resolve        : resolveFunc,
                finalStateOnly : finalStateOnly,
                pushesLeft     : regex.firstSet.size
            };

            this.pushRegexes.push(pushRegex);

            for (const ch in this.symbolStateMap) {
                if (this.symbolStateMap.hasOwnProperty(ch) && regex.firstSymbolMatches(ch)) {
                    this.symbolStateMap[ch].pushRegex(regex.detachFirstSymbol(ch), resolveFunc, finalStateOnly, prefix + ch);
                    pushRegex.pushesLeft -= 1;

                    if (pushRegex.pushesLeft === 0) {
                        this.pushRegexes.pop();
                        break;
                    }
                }
            }
        }
    }
}

exports = module.exports = PushingTrie;