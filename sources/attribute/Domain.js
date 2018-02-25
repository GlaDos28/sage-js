/**
 * ==========================
 * @description Domain on real line. Defines intervals of determination for attributes and distributions.
 * For non-number attribute types (such as strings and booleans) elements should be treated as numbered set of constant elements, so the same we get here.
 * Each isolated point (including string enum constants) is the same as [left, right] where left = right.
 * ==========================
 *
 * @author  Evgeny Savelyev
 * @since   17.01.18
 * @version 1.0.0
 * @license See the LICENCE file in the project root.
 */

"use strict";

/* eslint no-extra-parens: ["error", "all", { "nestedBinaryExpressions": false }] */

function ensureDisjoint(segs) {
    for (let i = 0; i < segs.length; i += 1) {
        for (let j = i + 1; j < segs.length; j += 1) {
            if ((segs[i].left <= segs[j].left && segs[i].right >= segs[j].left) ||
                (segs[i].left <= segs[j].right && segs[i].right >= segs[j].right)) {
                throw new Error(`segment ${i} (${segs[i].toString()}) intersects with segment ${j} (${segs[j].toString()})`);
            }
        }
    }
}

/**
 * @class
 * @classdesc Domain on real line. Defines intervals of determination for attributes and distributions.
 * For non-number attribute types (such as strings and booleans) elements should be treated as numbered set of constant elements, so the same we get here.
 * Each isolated point (including string enum constants) is the same as [left, right] where left = right.
 *
 * @property {Segment[]} segments array of segments [left, right]
 */
class Domain { /* TODO implement domain for strings and booleans */
    constructor(segments) {
        ensureDisjoint(segments);
        this.segments = segments;
    }

    toString() {
        return JSON.stringify(this.segments);
    }
}

exports = module.exports = Domain;