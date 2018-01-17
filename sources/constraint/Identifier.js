/**
 * ==========================
 * @description Constraint identifier. Can be one of the forms given in CIdentType list.
 * ==========================
 *
 * @author  Evgeny Savelyev
 * @since   17.01.18
 * @version 1.0.0
 * @license See the LICENCE file in the project root.
 */

"use strict";

function ensureValid(type, expr) {
    return true; /* TODO ensure validness */
}

/* TODO perhaps subclasses instead of given type and expression? (different types have different identifier properties) */

/**
 * @class
 * @classdesc Constraint identifier. Can be one of the forms given in CIdentType list.
 *
 * @property {IdentType} type identifier type from the list
 * @property {string} expr expression of the required form
 */
class Identifier {
    constructor(type, expr) {
        ensureValid(type, expr);
        this.type = type;
        this.expr = expr;
    }
}

exports = module.exports = Identifier;