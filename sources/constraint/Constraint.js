/**
 * ==========================
 * @description Net constraint definition. One of the base elements of SAGE mechanism.
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
 * @classdesc Net constraint definition. One of the base elements of SAGE mechanism.
 *
 * @property {TemplateSet} templateSet set of templates used to describe identifiers
 * @property {IdentSet} identSet set of identifiers used in constraint predicate
 * @property {Predicate} predicate constraint predicate function. Defines requirements on attributes via generation process
 * @property {map<string, object>} meta meta-information entry point for different algorithms
 */
class Constraint {
    constructor(templateSet, identSet, predicate) {
        this.templateSet = templateSet;
        this.identSet    = identSet;
        this.predicate   = predicate;
        this.meta        = {};
    }

    initMeta() {
        /* TODO initializing meta (generating algorithm, "unit constraints" etc.) */
    }
}

exports = module.exports = Constraint;