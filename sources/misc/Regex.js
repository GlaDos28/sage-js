/**
 * ==========================
 * @description Regular expression implementation. Used for defining templated identifiers in constrains, as well as in pushing trie algorithm.
 * ==========================
 *
 * @author  Evgeny Savelyev
 * @since   19.01.18
 * @version 1.0.0
 * @license See the LICENCE file in the project root.
 */

"use strict";

function compileString(str, index, openMarker) {
    const part = new RegexPart(null);

    let prevSubpart = null;

    if (openMarker === "[") {
        part.isSelector = true;
    }

    for (; index.ind < str.length; index.ind += 1) {
        switch (str[index.ind]) {
        case "\\":
            index.ind += 1;

            switch (str[index.ind]) {
            case "(":
            case ")":
            case "[":
            case "]":
            case "*":
            case "+":
            case "\\":
                part.subparts.push(new RegexPart(str[index.ind]));
                break;
            default:
                throw new Error(`Regex error: bad character after '\\' symbol in regex "${str}" (position ${index.ind - 1})`);
            }

            break;
        case ")":
            if (openMarker !== "(") {
                throw new Error(`Regex error: unexpected ')' in regex "${str}" (position ${index.ind})`);
            }

            return part;
        case "]":
            if (openMarker !== "[") {
                throw new Error(`Regex error: unexpected ')' in regex "${str}" (position ${index.ind})`);
            }

            return part;
        case "(":
            index.ind += 1;
            part.subparts.push(compileString(str, index, "("));
            break;
        case "[":
            index.ind += 1;
            part.subparts.push(compileString(str, index, "["));
            break;
        case "*":
            if (part.subparts.length === 0) {
                throw new Error(`Regex error: unexpected '*' in regex "${str}" (position ${index.ind})`);
            }

            prevSubpart = part.subparts[part.subparts.length - 1];

            if (prevSubpart.isClosed) {
                throw new Error(`Regex error: unexpected '*' in regex "${str}" (position ${index.ind})`);
            }

            prevSubpart.isClosed = true;

            break;
        case "+":
            if (part.subparts.length === 0) {
                throw new Error(`Regex error: unexpected '+' in regex "${str}" (position ${index.ind})`);
            }

            prevSubpart = part.subparts[part.subparts.length - 1];

            if (prevSubpart.isClosed) {
                throw new Error(`Regex error: unexpected '+' in regex "${str}" (position ${index.ind})`);
            }

            part.subparts.push(prevSubpart.getCopy());
            part.subparts[part.subparts.length - 1].isClosed = true;

            break;
        default:
            part.subparts.push(new RegexPart(str[index.ind]));
        }
    }

    if (openMarker !== null) {
        throw new Error(`Regex error: unclosed '${openMarker}' in regex "${str}"`);
    }

    return part;
}

/**
 * @class
 * @classdesc Regular expression implementation. Used for defining templated identifiers in constrains, as well as in pushing trie algorithm.
 *
 * @property {string} str regex string representation
 * @property {RegexPart} rootPart root part of compiled regular expression
 * @property {Set<symbol>} firstSet set of symbols regular expression can start with
 */
class Regex {
    constructor(regexString) {
        if (typeof regexString === "string") {
            this.rootPart = compileString(regexString, { ind : 0 }, null);
            this.str      = regexString;
        } else { /* For internal usage only */
            this.rootPart = regexString;
            this.str = this.rootPart.toString();
        }

        this.firstSet = this.rootPart.getFirstSet();
    }

    firstSymbolMatches(symbol) {
        return this.firstSet.has(symbol);
    }

    detachFirstSymbol(symbol) {
        return new Regex(this.rootPart.detachFirstSymbol(symbol));
    }

    isEmpty() {
        return this.str.length === 0;
    }

    toString() {
        return this.str;
    }
}

/**
 * @class
 * @classdesc Regular expression part. Constructs recursively.
 *
 * @property {symbol|null} symbol either symbol (then it is not recursive part) or null (then it is recursive defined by subparts)
 * @property {RegexPart[]} subparts subparts (not used whether symbol is not null)
 * @property {boolean} isClosed whether part is of the form "(...)*"
 * @property {boolean} isSelector whether part is of the form "[...]"
 */
class RegexPart {
    constructor(symbol) {
        this.symbol     = symbol;
        this.subparts   = [];
        this.isClosed   = false;
        this.isSelector = false;
    }

    /**
     * @desc Returns a set of symbols regex part can start with
     *
     * @returns {Set<symbol>} set of symbols part can begin with
     */
    getFirstSet() {
        const set = new Set();

        if (this.symbol !== null) {
            set.add(this.symbol);
        } else {
            for (const subpart of this.subparts) {
                const subset = subpart.getFirstSet();

                for (const symbol of subset) {
                    set.add(symbol);
                }

                if (!this.isSelector && !subpart.isClosed) {
                    break;
                }
            }
        }

        return set;
    }

    getWithoutFirstSubpart() {
        const res = new RegexPart(this.symbol);

        for (let i = 1; i < this.subparts.length; i += 1) {
            res.subparts.push(this.subparts[i].getCopy());
        }

        res.isClosed   = this.isClosed;
        res.isSelector = this.isSelector;

        return res;
    }

    detachFirstSymbol(symbol) {
        let curState = this;

        while (curState.subparts.length > 0) {
            const [subpart] = curState.subparts;

            if (subpart.getFirstSet().has(symbol)) {
                if (subpart.symbol !== null) {
                    return subpart.isClosed ? curState.getCopy() : curState.getWithoutFirstSubpart();
                } else {
                    let detachedSubpart = null;

                    if (subpart.isSelector) {
                        let i = 0;

                        for (; i < subpart.subparts.length; i += 1) {
                            if (subpart.subparts[i].getFirstSet().has(symbol)) {
                                break;
                            }
                        }

                        if (i === subpart.subparts.length) {
                            throw new Error(`'${symbol}' can not be attached from regex "${this.toString()}"`);
                        }

                        detachedSubpart = subpart.subparts[i];
                    } else {
                        detachedSubpart = subpart.detachFirstSymbol(symbol);
                    }

                    const res = new RegexPart(curState.symbol);

                    res.isClosed   = false;
                    res.isSelector = false;

                    res.subparts.push(detachedSubpart);

                    if (curState.isClosed) {
                        res.subparts.push(subpart.getCopy());
                    }

                    for (let i = 1; i < curState.subparts.length; i += 1) {
                        res.subparts.push(curState.subparts[i].getCopy());
                    }

                    curState = res;
                }
            } else if (subpart.isClosed) {
                curState = curState.getWithoutFirstSubpart();
            } else {
                throw new Error(`'${symbol}' can not be attached from regex "${this.toString()}"`);
            }
        }

        throw new Error(`'${symbol}' can not be attached from regex "${this.toString()}"`);
    }

    getCopy() {
        const copy = new RegexPart(this.symbol);

        for (const subpart of this.subparts) {
            copy.subparts.push(subpart.getCopy());
        }

        copy.isClosed   = this.isClosed;
        copy.isSelector = this.isSelector;

        return copy;
    }

    toString() {
        if (this.symbol !== null) {
            let prefix = "";

            if (this.symbol === "(" ||
                this.symbol === ")" ||
                this.symbol === "[" ||
                this.symbol === "]" ||
                this.symbol === "*" ||
                this.symbol === "+" ||
                this.symbol === "\\") {
                prefix = "\\";
            }

            return prefix + this.symbol + (this.isClosed ? "*" : "");
        }

        let res = "";

        if (this.isSelector) {
            res += "[";
        }

        for (const subpart of this.subparts) {
            res += subpart.symbol === null && !subpart.isSelector ? "(" + subpart.toString() + ")" : subpart.toString();
        }

        if (this.isSelector) {
            res += "]";
        }

        return res + (this.isClosed ? "*" : "");
    }
}

exports = module.exports = Regex;