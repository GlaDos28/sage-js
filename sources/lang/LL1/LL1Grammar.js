/**
 * ==========================
 * @description Grammar of LL(1) form. Is a modified BNF. i.e. with extra meta information for LL(1) parsing inside.
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
const TextPos     = require("../../misc/TextPos");
const jsesc       = require("jsesc");

const WS_SYMBOLS = new Set([" ", "\n", "\t"]);

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

    /**
     * @docs Returns parser of current LL(1) grammar that parses given as input parameter text.
     *
     * @returns {Parser} current LL(1) grammar parser
     */
    getParser() {
        return new Parser(this, ll1Parse);
    }

    __buildMeta__() {
        //console.log("DEBUG:\n" + this.ll1Bnf.toString());

        const elemIndRequested = [];

        for (let i = 0; i < this.ll1Bnf.elements.length; i += 1) {
            elemIndRequested.push(false);
        }

        for (let i = 0; i < this.ll1Bnf.elements.length; i += 1) {
            if (!elemIndRequested[i]) {
                this.__buildFirst__(i, elemIndRequested);
            }
        }
    }

    __buildFirst__(elemInd, elemIndRequested) {
        if (this.ll1Bnf.elements[elemInd].first !== undefined) {
            return;
        }

        const elem = this.ll1Bnf.elements[elemInd];

        if (elemIndRequested[elemInd]) {
            throw new Error(`cyclic dependency found when building 'first' meta for element ${elem.name}, so given BNF is not LL(1)`);
        }

        elemIndRequested[elemInd] = true;

        const first   = new Map();
        const wsFirst = new Map();

        switch (elem.type) {
        case BNFElemType.TERMINAL:
            first.set(elem.str[0], true);

            break;
        case BNFElemType.NONTERMINAL:
            //console.log("WAS========= " + JSON.stringify(Array.from(elem.prods)));
            //this.__fixAutoWS__(elemInd, elemIndRequested);
            //console.log("NOW========= " + JSON.stringify(Array.from(elem.prods)));

            for (let i = 0; i < elem.prods.length; i += 1) {
                let epsilonFlag = true;

                for (const prodElemInd of elem.prods[i]) {
                    this.__buildFirst__(prodElemInd, elemIndRequested);

                    //console.log("TEST 1::::::::::::: " + JSON.stringify(Array.from(first.entries())));
                    //console.log("TEST 2::::::::::::: " + JSON.stringify(Array.from(this.ll1Bnf.elements[prodElemInd].first.entries())));
                    //console.log("\n");

                    if (prodElemInd !== this.ll1Bnf.ws) {
                        for (const symbol of this.ll1Bnf.elements[prodElemInd].first.keys()) {
                            if (first.has(symbol)) {
                                throw new Error(`repeated symbol '${symbol}' in 'first' meta for element ${elem.name} (conflicting productions ${first.get(symbol)} and ${i}), so given BNF is not LL(1)`);
                            }

                            first.set(symbol, i);
                        }

                        if (this.ll1Bnf.elements[prodElemInd].epsilonProdInd === undefined) {
                            epsilonFlag = false;
                            break;
                        }
                    }
                }

                const wsFirstBuf = this.__getWSFirst__(elem.prods[i], i);

                for (const symbol of wsFirstBuf.keys()) {
                    wsFirst.set(symbol, i);
                }

                if (elem.epsilonProdInd === undefined && epsilonFlag) {
                    elem.epsilonProdInd = i;
                }
            }

            break;
        case BNFElemType.SEMANTIC_RULE:
            elem.epsilonProdInd = null; /* no epsilon production, but not undefined as it does not require any tokens */
            break;
        default:
            throw new Error("oops! Unsupported BNF element type, but it is impossible");
        }

        elem.first   = first;
        elem.wsFirst = wsFirst;
    }

    __getWSFirst__(prod, prodInd) {
        const wsFirst = new Map();

        let addFirst = false;

        for (const prodElemInd of prod) {
            const prodElemFirst   = this.ll1Bnf.elements[prodElemInd].first;
            const prodElemWsFirst = this.ll1Bnf.elements[prodElemInd].wsFirst;

            for (const symbol of prodElemWsFirst.keys()) {
                wsFirst.set(symbol, prodInd);
            }

            if (addFirst) {
                for (const symbol of prodElemFirst.keys()) {
                    wsFirst.set(symbol, prodInd);
                }
            }

            if (prodElemInd === this.ll1Bnf.ws) {
                addFirst = true;
            }

            if (this.ll1Bnf.elements[prodElemInd].epsilonProdInd === undefined) {
                break;
            }
        }

        return wsFirst;
    }
}

function ll1Parse(grammar, text) {
    const parseMeta = {
        pos    : 0,
        lcPos  : new TextPos()
    };

    const parseData = { output : null }; /* For semantic rules */

    parseNT(0, grammar.ll1Bnf, text, parseMeta, parseData);

    return parseData.output;
}

function __getProdInd__(nonterminal, text, parseMeta) {
    if (parseMeta.pos < text.length && nonterminal.first.has(text[parseMeta.pos])) {
        return nonterminal.first.get(text[parseMeta.pos]);
    }

    return null;
}

function __getWsProdInd__(nonterminal, text, parseMeta) {
    while (parseMeta.pos < text.length && !nonterminal.wsFirst.has(text[parseMeta.pos]) && WS_SYMBOLS.has(text[parseMeta.pos])) {
        processCurrentSymbol(text, parseMeta);
    }

    if (parseMeta.pos < text.length && nonterminal.wsFirst.has(text[parseMeta.pos])) {
        return nonterminal.wsFirst.get(text[parseMeta.pos]);
    }

    return null;
}

function parseNT(ntInd, ll1Bnf, text, parseMeta, parseData, wsMode = false) {
    const nonterminal = ll1Bnf.elements[ntInd];

    let productionNum = null;

    if (!wsMode) {
        productionNum = __getProdInd__(nonterminal, text, parseMeta);
    }

    if (productionNum === null && WS_SYMBOLS.has(text[parseMeta.pos])) {
        wsMode = true;
        productionNum = __getWsProdInd__(nonterminal, text, parseMeta);
    }

    if (productionNum === null) {
        productionNum = nonterminal.epsilonProdInd;
    }

    if (productionNum === null) {
        if (parseMeta.pos >= text.length) {
            throw new Error(`can not parse text "${jsesc(text)}": unexpected end of text (nonterminal ${nonterminal.name})`);
        } else {
            throw new Error(`can not parse text "${jsesc(text)}" from position ${parseMeta.lcPos}: unexpected symbol '${text[parseMeta.pos]}' (nonterminal ${nonterminal.name})`);
        }
    }

    const production = nonterminal.prods[productionNum];

    for (let i = 0; i < production.length; i += 1) {
        const productionElemNum = production[i];
        const productionElem    = ll1Bnf.elements[productionElemNum];

        switch (productionElem.type) {
        case BNFElemType.TERMINAL:
            parseT(productionElem, text, parseMeta);
            break;
        case BNFElemType.NONTERMINAL:
            parseNT(productionElemNum, ll1Bnf, text, parseMeta, parseData, wsMode);
            break;
        case BNFElemType.SEMANTIC_RULE:
            parseSR(productionElem, parseData);
            break;
        default:
            throw new Error("oops! Unsupported BNF element type, but it is impossible");
        }

        if (productionElemNum === ll1Bnf.ws) {
            wsMode = false;
        }
    }
}

function parseT(terminal, text, parseMeta) {
    if (parseMeta.pos + terminal.str.length > text.length) {
        throw new Error(`can not parse text "${jsesc(text)}": unexpected end of text (terminal ${terminal.name}, "${parseMeta.pos.str}")`);
    }

    for (let i = 0; i < terminal.str.length; i += 1) {
        if (text[parseMeta.pos] !== terminal.str[i]) {
            throw new Error(`can not parse text "${jsesc(text)}" from position ${parseMeta.lcPos}: expected '${terminal.str[i]}' got '${text[parseMeta.pos]}' (terminal ${terminal.name}, "${terminal.str}")`);
        }

        processCurrentSymbol(text, parseMeta);
    }
}

function parseSR(semanticRule, parseData) {
    semanticRule.code(parseData);
}

function processCurrentSymbol(text, parseMeta) {
    parseMeta.lcPos.nextSymbol(text[parseMeta.pos]);
    parseMeta.pos += 1;
}

exports = module.exports = LL1Grammar;