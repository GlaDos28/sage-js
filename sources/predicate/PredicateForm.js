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

const FormName = Object.freeze({
    BPF                : 1,
    BASE               : 1,

    DNPF               : 2,
    DISJUNCTIVE_NORMAL : 2,

    LPF                : 3,
    LINEAR             : 3
});

/**
 * @class
 * @classdesc Predicate form as a subset of predicate language (subset of predicate intermediate representation, PIR).
 * Put some requirements to the PIR, implemented by test function, applying to it.
 *
 * @property {FormName} name predicate form's name from the enumeration
 * @property {function(PIR):bool} testFunction function which applies to PIR to test it meets the form requirements
 */
class PredicateForm {
    constructor(name, testFunction) {
        this.name = name;
        this.testFunction = testFunction;
    }
}

exports = module.exports = {
    PredicateForm : PredicateForm,
    FormName      : FormName
};