/**
 * ==========================
 * @description Generalized parser interface. All parser generators create instance of this object.
 * ==========================
 *
 * @author  Evgeny Savelyev
 * @since   21.01.18
 * @version 1.0.0
 * @licence See the LICENCE file in the project root.
 */

"use strict";

/**
 * @class
 * @classdesc Generalized parser interface. All parser generators create instance of this object.
 *
 * @property {object} grammar context-free grammar in any form (e.g. BNF)
 * @property {function(object, string):object} parseFunc parsing function that takes grammar instance and text and returns intermediate code
 */
class Parser {
    constructor(grammar, parseFunc) {
        this.grammar   = grammar;
        this.parseFunc = parseFunc;
    }

    parse(text) {
        return this.parseFunc(this.grammar, text);
    }
}

exports = module.exports = Parser;