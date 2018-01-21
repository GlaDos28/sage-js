/**
 * ==========================
 * @description Segment [left, right] on real line.
 * ==========================
 *
 * @author  Evgeny Savelyev
 * @since   17.01.18
 * @version 1.0.0
 * @license See the LICENCE file in the project root.
 */

"use strict";

/**
 * @class
 * @classdesc Segment [left, right] on real line.
 *
 * @property {number} left left bound
 * @property {number} right right bound
 */
class Segment {
    constructor(left, right) {
        if (left > right) {
            throw new Error(`segment left bound must be less or equal than right bound. Given [${left}, ${right}]`);
        }

        this.left  = left;
        this.right = right;
    }

    toString() {
        return `[${this.left}, ${this.right}]`;
    }
}

exports = module.exports = Segment;