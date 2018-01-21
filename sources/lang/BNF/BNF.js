/**
 * ==========================
 * @description Backus-Naur form of grammar. Defines context-free grammars. Also semantic rules are allowed in nonterminal productions. First element is chosen as root element.
 * Use BNF parser for getting BNF class instance by BNF string representation.
 * ==========================
 *
 * @author  Evgeny Savelyev
 * @since   21.01.18
 * @version 1.0.0
 * @licence See the LICENCE file in the project root.
 */

"use strict";

const BNFElemType = require("./BNFElemType");

/**
 * @class
 * @classdesc Backus-Naur form of grammar. Defines context-free grammars. Also semantic rules are allowed in nonterminal productions. First element is chosen as root element. Use BNF parser for getting BNF class instance by BNF string representation.
 *
 * @property {{type:BNFElemType, symbol:(symbol|undefined), prods:(int[]|undefined), code:(string|undefined)}} elements BNF element definitions
 * @property {boolean} skipWS skipping white space symbols when parsing text according to this grammar
 */
class BNF {
    constructor(skipWS = true) {
        this.elements = [];
        this.skipWS   = skipWS;
    }

    addElement(type, args) {
        const element = { type  : type };

        switch (type) {
        case BNFElemType.TERMINAL:
            element.symbol = args.symbol;
            break;
        case BNFElemType.NONTERMINAL:
            element.prods = [];
            break;
        case BNFElemType.SEMANTIC_RULE:
            element.code = args.code;
            break;
        default:
            throw new Error(`oops! Unsupported BNF element type ${type}, but it is impossible`);
        }

        this.elements.push(element);
        return this.elements.length - 1;
    }

    addProduction(ntIndex, prod) {
        this.elements[ntIndex].prods.push(prod);
    }

    getCopy() {
        const copy = new BNF();

        for (let i = 0; i < this.elements.length; i += 1) {
            const elem = this.elements[i];

            copy.addElement(elem.type, elem);

            if (elem.type === BNFElemType.NONTERMINAL) {
                for (const prod of elem.prods) {
                    const prodCopy = [];

                    for (const prodElem of prod) {
                        prodCopy.push(prodElem);
                    }

                    copy.addProduction(i, prodCopy);
                }
            }
        }

        return copy;
    }
}

exports = module.exports = BNF;