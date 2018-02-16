/**
 * ==========================
 * @description Text position (line, column).
 * ==========================
 *
 * @author  Evgeny Savelyev
 * @since   25.01.18
 * @version 1.0.0
 * @licence See the LICENCE file in the project root.
 */

"use strict";

/**
 * @class
 * @classdesc Text position (line, column).
 *
 * @property {int} line text line number
 * @property {int} column text column number
 */
class TextPos {
    constructor(line = 1, column = 1) {
        this.line   = line;
        this.column = column;
    }

    nextSymbol(symbol) {
        if (symbol === "\n") {
            this.line  += 1;
            this.column = 1;
        } else {
            this.column += 1;
        }
    }

    toString() {
        return `(${this.line}, ${this.column})`;
    }
}

exports = module.exports = TextPos;