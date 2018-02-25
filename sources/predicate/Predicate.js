/**
 * ==========================
 * @description Constraint predicate function f: {} -> bool. Uses identifiers as input arguments.
 * Defines in a special form and must be 'compiled' and registered in PADME before executing first time.
 * See PADME for more information.
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
 * @classdesc Constraint predicate function f: {} -> bool. Uses identifiers as input arguments.
 * Defines in a special form and must be 'compiled' and registered in PADME before executing first time.
 * See PADME for more information.
 *
 * @property {string} body predicate body expression in language of predicates
 * @property {set<FormName>} acceptedForms set of accepted predicate forms' names
 * @property {PIR} pir compiled predicate into predicate intermediate representation (PIR). Used in PADME to get algorithm intermediate representations (AIRs)
 * @property {map<int, AIR>} airs PIR transformations into AIRs { algorithm id : AIR }. Used in attribute generation algorithms
 */
class Predicate {
    constructor(body) {
        this.body          = body;
        this.acceptedForms = null;
        this.pir           = null;
        this.airs          = {};
    }

    /**
     * @desc Compiles predicate body to get PIR.
     *
     * @returns {void} nothing
     */
    compile() { /* TODO */
        this.pir = null;
        throw new Error("predicate compiling is not supported");
    }

    /**
     * @desc Test predicate on the given forms, adding satisfied forms to accepted forms list.
     *
     * @param {PredicateForm[]} forms predicate forms to test
     * @returns {void} nothing
     */
    testForms(forms) {
        this.acceptedForms = new Set();

        for (const form of forms) {
            if (form.testFunction(this.pir)) {
                this.acceptedForms.add(form.name);
            }
        }
    }

    /**
     * @desc processes AIR for the given algorithm. If not all required forms are satisfied, an error is thrown.
     *
     * @param {AGAlgorithm} algorithm attribute generation algorithm for which AIR should be calculated
     * @returns {void} nothing
     */
    processAIR(algorithm) {
        for (const requiredForm of algorithm.requiredForms) {
            if (!this.acceptedForms.has(requiredForm)) {
                throw new Error(`Form "${requiredForm}" is not satisfied`);
            }
        }

        this.airs[algorithm.id] = algorithm.transformFunc(this.pir);
    }

    toString() {
        return this.body;
    }
}

exports = module.exports = Predicate;