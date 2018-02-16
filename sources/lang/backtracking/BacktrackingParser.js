/**
 * ==========================
 * @description Grammar parser with backtracking algorithm. Accepts any valid grammar in BNF form.
 * ==========================
 *
 * @author  Evgeny Savelyev
 * @since   09.02.18
 * @version 1.0.0
 * @licence See the LICENCE file in the project root.
 */

"use strict";

const Parser      = require("../Parser");
const BNFElemType = require("../BNF/BNFElemType");
const TextPos     = require("../../misc/TextPos");
const jsesc       = require("jsesc");
const deepCopy    = require("deepcopy");

function copyTextPos(target) {
    if (target.constructor === TextPos) {
        return new TextPos(target.line, target.column);
    }

    throw new Error("uncopy parameter: " + target);
}

function getBacktrackingParser(bnf) {
    return new Parser(bnf, parse);
}

function parse(bnf, text) {
    const parseMeta = {
        pos    : 0,
        lcPos  : new TextPos()
    };

    const {
        parsedRules,
        parseMeta   : parseMetaFinal,
        error
    } = parseNT(0, bnf, text, parseMeta);

    if (error) {
        throw error.err;
    }

    if (parseMetaFinal.pos < text.length) {
        throw new Error(`can not parse text "${jsesc(text)}": end of text expected at position ${parseMetaFinal.lcPos}`);
    }

    const parseData = { output : null };

    for (const parsedRule of parsedRules) {
        parsedRule(parseData);
    }

    return parseData.output;
}

function parseNTProd(production, bnf, text, parseMeta) {
    let newParseMeta   = parseMeta;
    let newParsedRules = null;
    let error          = null;

    const parsedRules = [];

    for (let i = 0; i < production.length; i += 1) {
        const productionElemNum = production[i];
        const productionElem    = bnf.elements[productionElemNum];

        switch (productionElem.type) {
        case BNFElemType.TERMINAL:
            error = parseT(productionElem, text, newParseMeta);

            if (error) {
                return { error : error };
            }

            break;
        case BNFElemType.NONTERMINAL:
            ({
                parseMeta   : newParseMeta,
                parsedRules : newParsedRules,
                error
            } = parseNT(productionElemNum, bnf, text, newParseMeta));

            if (error) {
                return { error : error };
            }

            parsedRules.push(...newParsedRules);

            break;
        case BNFElemType.SEMANTIC_RULE:
            parsedRules.push(parseSR(productionElem));
            break;
        default:
            throw new Error("oops! Unsupported BNF element type, but it is impossible");
        }
    }

    return {
        parseMeta   : newParseMeta,
        parsedRules : parsedRules
    };
}

function parseNT(ntInd, bnf, text, parseMeta) {
    const nonterminal = bnf.elements[ntInd];

    let returnError = { maxPos : -1 };

    if (nonterminal.prods.length === 0) {
        throw new Error(`corrupt BNF: nonterminal ${nonterminal.name} has no productions`);
    }

    for (const production of nonterminal.prods) {
        let newParseMeta   = deepCopy(parseMeta, copyTextPos);
        let parsedRules    = null;
        let error          = null;

        ({
            parseMeta : newParseMeta,
            parsedRules,
            error
        } = parseNTProd(production, bnf, text, newParseMeta));

        if (!error) {
            return {
                parseMeta   : newParseMeta,
                parsedRules : parsedRules
            };
        }

        if (error.maxPos > returnError.maxPos) {
            returnError = error;
        }
    }

    return { error: returnError };
}

function parseT(terminal, text, parseMeta) {
    if (parseMeta.pos + terminal.str.length > text.length) {
        return {
            err    : new Error(`can not parse text "${jsesc(text)}": unexpected end of text (terminal ${terminal.name})`),
            maxPos : parseMeta.pos
        };
    }

    for (let i = 0; i < terminal.str.length; i += 1) {
        if (text[parseMeta.pos] !== terminal.str[i]) {
            return {
                err    : new Error(`can not parse text "${jsesc(text)}" from position ${parseMeta.lcPos}:
                    expected '${terminal.str[i]}' got '${text[parseMeta.pos]}' (terminal ${terminal.name}, "${terminal.str}")`),
                maxPos : parseMeta.pos
            };
        }

        processCurrentSymbol(text, parseMeta);
    }

    return null;
}

function parseSR(semanticRule, parsedRules) {
    return semanticRule.code;
}

function processCurrentSymbol(text, parseMeta) {
    parseMeta.lcPos.nextSymbol(text[parseMeta.pos]);
    parseMeta.pos += 1;
}

exports = module.exports = { getBacktrackingParser : getBacktrackingParser };