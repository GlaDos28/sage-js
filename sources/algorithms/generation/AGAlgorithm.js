/**
 * ==========================
 * @description Attribute generation algorithm.
 * Contains the algorithm itself, along with PIR-AIR transformation function and predicate form requirements.
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
 * @classdesc Attribute generation algorithm.
 * Contains the algorithm itself, along with PIR-AIR transformation function and predicate form requirements.
 *
 * @property {function(?):?} generateFunc attribute generation function
 * @property {function(PIR):AIR} transformFunc PIR-AIR transformation function
 * @property {string[]} required predicate forms' names
 */
class AGAlgorithm {
    constructor(generateFunc, transformFunc, requiredForms) {
        this.generateFunc  = generateFunc;
        this.transformFunc = transformFunc;
        this.requiredForms = requiredForms;
    }

    generate(/* TODO arguments */) {
        return this.generateFunc();
    }
}

exports = module.exports = AGAlgorithm;