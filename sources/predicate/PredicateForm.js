/**
 * ==========================
 * @description Predicate form as a subset of predicate language (subset of predicate intermediate representation, PIR).
 * Put some requirements to the PIR, implemented by test function, applying to it.
 * ==========================
 *
 * @author  Evgeny Savelyev
 * @since   19.02.18
 * @version 1.0.0
 * @licence See the LICENCE file in the project root.
 */

"use strict";

/**
 * @class
 * @classdesc Predicate form as a subset of predicate language (subset of predicate intermediate representation, PIR).
 * Put some requirements to the PIR, implemented by test function, applying to it.
 *
 * @property {string} name predicate form's naming
 * @property {function(PIR):bool} testFunction function which applies to PIR to test it meets the form requirements
 */
class PredicateForm {
    constructor(name, testFunction) {
        this.name = name;
        this.testFunction = testFunction;
    }
}

exports = module.exports = PredicateForm;