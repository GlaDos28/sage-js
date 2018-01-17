/**
 * ==========================
 * @description Constraint template with regular expression. Is a simplified version of regular expressions. TODO what form exactly?
 * ==========================
 *
 * @author  Evgeny Savelyev
 * @since   17.01.18
 * @version 1.0.0
 * @license See the LICENCE file in the project root.
 */

"use strict";

function ensureValid(expr) {
    return true; /* TODO ensure validness */
}

/**
 * @class
 * @classdesc Constraint template with regular expression. Is a simplified version of regular expressions. TODO what form exactly?
 *
 * @property {string} expr expression of the required form
 */
class Template {
    constructor(expr) {
        ensureValid(expr);
        this.expr = expr;
    }
}

exports = module.exports = Template;