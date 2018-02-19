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
 * @property {set<string>} acceptedForms set of accepted predicate forms' names
 * @property {PIR} pir compiled predicate into predicate intermediate representation (PIR). Used in PADME to get AIRs, which are used it attribute generation algorithms.
 * @property {AIR[]} airs transformed PIR into algorithm intermediate representation (AIR). Used in attribute generation algorithms.
 */
class Predicate {
    constructor(body) {
        this.body          = body;
        this.acceptedForms = null;
        this.pir           = null;
        this.airs          = [];
    }

    /**
     * Compiles predicate body to get PIR.
     */
    compile() { /* TODO */
        this.pir = null;
    }

    /**
     * Test predicate on the given forms, adding satisfied forms to accepted forms list.
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

    toString() {
        return this.body;
    }
}

exports = module.exports = Predicate;