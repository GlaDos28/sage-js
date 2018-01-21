/**
 * ==========================
 * @description Grammar in LL(1) form. Is a modified BNF. i.e. with extra meta information for LL(1) parsing inside.
 * ==========================
 *
 * @author  Evgeny Savelyev
 * @since   21.01.18
 * @version 1.0.0
 * @licence See the LICENCE file in the project root.
 */

"use strict";

const Parser      = require("../Parser");
const BNFElemType = require("../BNF/BNFElemType");
const jsesc       = require("jsesc");

/**
 * @class
 * @classdesc Grammar in LL(1) form. Is a modified BNF. i.e. with extra meta information for LL(1) parsing inside.
 *
 * @property {object} ll1Bnf BNF with extra meta information for LL(1) parsing
 */
class LL1Grammar {

    /**
     * @desc creates LL(1) grammar by initial grammar in BNF form.
     *
     * @param {BNF} bnf initial grammar in BNF form. Must be potentially LL(1) or error is thrown
     */
    constructor(bnf) {
        this.ll1Bnf = bnf.getCopy();
        this.__buildMeta__();
    }

    getParser() {
        return new Parser(this, ll1Parse);
    }

    __buildMeta__() {
        const elemIndRequested = [];

        for (let i = 0; i < this.ll1Bnf.elements.length; i += 1) {
            elemIndRequested.push(false);
        }

        this.__buildFirst__(0, elemIndRequested);
    }

    __buildFirst__(elemInd, elemIndRequested) {
        if (this.ll1Bnf.elements[elemInd].first !== undefined) {
            return;
        }

        if (elemIndRequested[elemInd]) {
            throw new Error(`cyclic dependency found when building 'first' meta for element ${elemInd}, so given BNF is not LL(1)`);
        }

        elemIndRequested[elemInd] = true;

        const elem  = this.ll1Bnf.elements[elemInd];
        const first = new Map();

        switch (elem.type) {
        case BNFElemType.TERMINAL:
            elem.hasEpsilon = false;
            elem.first[elem.symbol] = true;

            break;
        case BNFElemType.NONTERMINAL:
            elem.hasEpsilon = false;

            for (let i = 0; i < elem.prods.length; i += 1) {
                let epsilonFlag = true;

                for (const prodElemInd of elem.prods[i]) {
                    this.__buildFirst__(prodElemInd, elemIndRequested);

                    for (const symbol of this.ll1Bnf.elements[prodElemInd].first.keys()) {
                        if (first.has(symbol)) {
                            throw new Error(`repeated symbol '${symbol}' in 'first' meta for element ${elemInd} (conflicting productions ${first.get(symbol)} and ${i}), so given BNF is not LL(1)`);
                        }

                        first.set(symbol, i);
                    }

                    if (!this.ll1Bnf.elements[prodElemInd].hasEpsilon) {
                        epsilonFlag = false;
                        break;
                    }
                }

                if (epsilonFlag) {
                    elem.hasEpsilon = true;
                }
            }

            break;
        case BNFElemType.SEMANTIC_RULE:
            elem.hasEpsilon = true;
            break;
        default:
            throw new Error("oops! Unsupported BNF element type, but it is impossible");
        }

        elem.first = first;
    }
}

function ll1Parse(grammar, text) { /* TODO WS handling */
    let textPos = 0;

    const elemIndStack = [0];

    while (elemIndStack.length > 0) {
        const elem = this.ll1Bnf.elements[elemIndStack.pop()];

        switch (elem.type) {
        case BNFElemType.TERMINAL:
            if (!elem.first.has(text[textPos])) {
                throw new Error(`can not parse text "${jsesc(text)}" from position ${textPos}`);
            }

            textPos += 1;

            break;
        case BNFElemType.NONTERMINAL:
            const prodNum = elem.first.get(text[textPos]);

            if (prodNum === undefined) { /* TODO check that Map.get() returns undefined when there is not element to return */
                throw new Error(`can not parse text "${jsesc(text)}" from position ${textPos}`);
            }

            for (let i = elem.prods[prodNum].length - 1; i >= 0; i -= 1) {
                elemIndStack.push(elem.prods[prodNum][i]);
            }

            break;
        case BNFElemType.SEMANTIC_RULE:
            /* TODO semantic rules handling */
            break;
        default:
            throw new Error("oops! Unsupported BNF element type, but it is impossible");
        }
    }
}

exports = module.exports = LL1Grammar;