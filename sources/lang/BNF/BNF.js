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
const jsesc       = require("jsesc");

/**
 * @class
 * @classdesc Backus-Naur form of grammar. Defines context-free grammars. Also semantic rules are allowed in nonterminal productions. First element is chosen as root element. Use BNF parser for getting BNF class instance by BNF string representation.
 *
 * @property {{type:BNFElemType, symbol:(symbol|undefined), prods:(int[]|undefined), code:(string|undefined)}} elements BNF element definitions
 */
class BNF {
    constructor() {
        this.elements = [-1]; /* -1 for 'booking' position for the start nonterminal */

        /* Adding whitespace characters and whitespaces nonterminal (for inner purposes only) */

        const wsSymbol = this.addTerminalSelection([" ", "\t", "\n"], (data) => {}, "__AutoWSSymbol__");

        this.ws = this.addNonterminal("__AutoWS__");

        this.addProduction(this.ws, [wsSymbol, this.ws], false);
        this.addProduction(this.ws, [],                  false);

        /* Changing 'booked' position for the start nonterminal to null */

        this.elements[0] = null;
    }

    __addElement__(element, name) {
        element.name = name === null ? `<${this.elements.length}>` : name;

        this.elements.push(element);
        return this.elements.length - 1;
    }

    addTerminal(str, name = `"${jsesc(str)}"`) {
        const element = {
            type : BNFElemType.TERMINAL,
            str  : str
        };

        return this.__addElement__(element, name);
    }

    addNonterminal(name = null) {
        const element = {
            type  : BNFElemType.NONTERMINAL,
            prods : []
        };

        if (this.elements[0] === null) {
            this.elements[0] = element;
            this.elements[0].name = name;

            return 0;
        }

        return this.__addElement__(element, name);
    }

    addSemanticRule(code, name = "<semantic rule>") {
        if (typeof code !== "function") {
            throw new Error("semantic rule must be a function (data) => {...}");
        }

        const element = {
            type : BNFElemType.SEMANTIC_RULE,
            code : code
        };

        return this.__addElement__(element, name);
    }

    addProduction(ntIndex, prod, autoWS = true) {
        const insertProd = [];
        const addAutoWS  = autoWS && !isSRProd(prod, this.elements);

        for (const prodElemNum of prod) {
            if (addAutoWS && this.elements[prodElemNum].type !== BNFElemType.SEMANTIC_RULE) {
                insertProd.push(this.ws);
            }

            insertProd.push(prodElemNum);
        }

        if (autoWS && ntIndex === 0) {
            insertProd.push(this.ws);
        }

        this.elements[ntIndex].prods.push(insertProd);
    }

    addTerminalWithSR(terminal, semanticRule, name = `Nt-of-"${jsesc(terminal)}"`) {
        const ntId = this.addNonterminal(name);
        const tId  = this.addTerminal(terminal);
        const srId = this.addSemanticRule(semanticRule);

        this.addProduction(ntId, [tId, srId], false);

        return ntId;
    }

    addTerminalSelection(terminalList, commonSemanticRule = () => {}, name = null) { /* Use data.__token__ im semantic rule */
        const ntId       = this.addNonterminal(name);
        const innerNtId  = this.addNonterminal();
        const commonSrId = this.addSemanticRule(commonSemanticRule);

        this.addProduction(ntId, [innerNtId, commonSrId], false);

        for (const terminal of terminalList) {
            const tId  = this.addTerminal(terminal);
            const srId = this.addSemanticRule((data) => { data.__token__ = terminal; });

            this.addProduction(innerNtId, [tId, srId], false);
        }

        return ntId;
    }

    getCopy() {
        const copy = new BNF();

        copy.elements = []; /* Removing internal whitespaces nonterminal */

        for (let i = 0; i < this.elements.length; i += 1) {
            const elem = this.elements[i];

            copy.elements.push({
                name  : elem.name,
                type  : elem.type,
                str   : elem.str,
                prods : [],
                code  : elem.code,
            });

            if (elem.type === BNFElemType.NONTERMINAL) {
                for (const prod of elem.prods) {
                    const prodCopy = [];

                    for (const prodElem of prod) {
                        prodCopy.push(prodElem);
                    }

                    copy.addProduction(i, prodCopy, false);
                }
            }
        }

        return copy;
    }

    toString() {
        let str = "";

        for (let i = 0; i < this.elements.length; i += 1) {
            str += `${i}: ${this.elements[i].name}\n`;
        }

        str += "\n";

        for (const elem of this.elements) {
            if (elem.type === BNFElemType.NONTERMINAL) {
                for (const prod of elem.prods) {
                    str += `${elem.name} -> `;

                    for (const prodElemInd of prod) {
                        str += `${this.elements[prodElemInd].name} `;
                    }

                    str += "\n";
                }
            }
        }

        return str;
    }
}

function isSRProd(prod, elems) {
    for (const prodElemNum of prod) {
        if (prodElemNum >= elems.length) {
            return false;
        }

        const prodElem = elems[prodElemNum];

        if (prodElem.type !== BNFElemType.SEMANTIC_RULE) {
            return false;
        }
    }

    return true;
}

exports = module.exports = BNF;