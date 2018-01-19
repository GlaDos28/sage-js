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

/* TODO algorithm API implementation */

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
}

/**
 * @class
 * @classdesc Pushing trie node (state) with recursive links to other nodes.
 *
 * @property {map<char, PushingTrie>} symbolStateMap mapping { symbol (char) : node (PushingTrie) }
 * @property {{Regex, object}} regexParts array of pushing regular expressions (with refs to objects that can be used anyway)
 * @property {object} finalRegexes array of markers for final states of regular expressions. Stored refs to objects that can be used anyway
 * @property {boolean} isFinalState whether the state is final (generates complete string from the root node)
 */
class Node {
    constructor() {
        this.symbolStateMap = {};
        this.regexParts     = [];
        this.finalRegexes   = [];
        this.isFinalState   = false;
    }
}

exports = module.exports = PushingTrie;