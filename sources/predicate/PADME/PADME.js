/**
 * ==========================
 * @description Predicate Adjustable Data Manipulation Engine (PADME) - SAGA element which handles compiled predicates and their intermediate representations.
 * Firstly predicate is compiled into predicate intermediate representation (PIR), then it should be transformed into one or more algorithm
 * intermediate representation (AIR) to be used in attribute generating algorithms.
 * There are several predicate forms, with test function for each one, applying to the PIR.
 * Each AIR relates to its transform function, which requires to met one or several predicate forms.
 * ==========================
 *
 * @author  Evgeny Savelyev
 * @since   19.02.18
 * @version 1.0.0
 * @licence See the LICENCE file in the project root.
 */

"use strict";

const Predicate = require("../Predicate");

/**
 * @class
 * @classdesc Predicate Adjustable Data Manipulation Engine (PADME) - SAGA element which handles compiled predicates and their intermediate representations.
 * Firstly predicate is compiled into predicate intermediate representation (PIR), then it should be transformed into one or more algorithm
 * intermediate representation (AIR) to be used in attribute generating algorithms.
 * There are several predicate forms, with test function for each one, applying to the PIR.
 * Each AIR relates to its transform function, which requires to met one or several predicate forms.
 *
 * @property {map<string, PredicateForm>} forms all predicate forms which are used during working process { form's name : form }
 */
class PADME {
    constructor(formMap) {
        this.forms = formMap;
    }

    /**
     * Builds PIR for the given predicate.
     *
     * @param {Predicate} predicate instance to build PIR into
     * @returns {void} nothing
     */
    buildPIR(predicate) {
        try {
            predicate.compile();
            predicate.testForms(this.forms);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Returns predicate algorithm intermediate representation (AIR) by the given required forms and transform function.
     *
     * @param {Predicate} predicate instance to build AIR into
     * @param {string[]} requiredForms list of forms required for transforming into AIR
     * @param {function(PIR):AIR} transformFunction function which transforms PIR into AIR
     * @returns {void} nothing
     */
    buildAIR(predicate, requiredForms, transformFunction) {
        if (!predicate) {
            throw new Error(`predicate ${predicate.body} is not registered in PADME`);
        }

        for (const requiredForm of requiredForms) {
            if (!this.forms.has(requiredForm)) {
                throw new Error(`predicate form "${requiredForm}" is not registered in PADME`);
            }

            if (!predicate.acceptedForms.has(requiredForm)) {
                throw new Error(`predicate ${predicate.body} does not meet requirement on predicate form "${requiredForm}"`);
            }
        }

        try {
            predicate.airs[-1] = transformFunction(predicate.pir);
        } catch (error) {
            throw error;
        }
    }
}

exports = module.exports = PADME;