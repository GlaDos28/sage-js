/**
 * ==========================
 * @description Constraint predicate function f: {} -> bool. Uses identifiers as input arguments.
 * Defines in a special form and must be 'compiled' before executing first time.
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
 * @classdesc Constraint predicate function f: {} -> bool. Uses identifiers as input arguments. Defines in a special form and must be 'compiled' before executing first time.
 *
 * @property {string} body predicate body expression in a special form TODO what form exactly?
 * @property {CompiledBody} compiled predicate compiled body. Used in attribute generation process.
 */
class Predicate {
    constructor(body) {
        this.body     = body;
        this.compiled = null;
    }
}

exports = module.exports = Predicate;