/**
 * ==========================
 * @description Grammar in LL-1 form. Is a modified BNF. i.e. with extra meta information for LL-1 parsing inside.
 * ==========================
 *
 * @author  Evgeny Savelyev
 * @since   21.01.18
 * @version 1.0.0
 * @licence See the LICENCE file in the project root.
 */

"use strict";

const Parser = require("../Parser");

/**
 * @class
 * @classdesc Grammar in LL-1 form. Is a modified BNF. i.e. with extra meta information for LL-1 parsing inside.
 *
 * @property {object} ll1Bnf BNF with extra meta information for LL-1 parsing
 */
class LL1Grammar {

    /**
     * @desc creates LL-1 grammar by initial grammar in BNF form.
     *
     * @param {BNF} bnf initial grammar in BNF form. Must be potentially LL-1 or error is thrown
     */
    constructor(bnf) {
        this.ll1Bnf = bnf.getCopy();
        this.__buildMeta__();
    }

    __buildMeta__() {
        /* TODO */
    }

    getParser() {
        return new Parser(this, ll1Parse);
    }
}

function ll1Parse(grammar, text) {
    /* TODO */
}

exports = module.exports = LL1Grammar;