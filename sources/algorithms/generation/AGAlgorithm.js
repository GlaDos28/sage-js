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

let idCounter = 0;

function getNewId() {
    idCounter += 1;
    return idCounter - 1;
}

/**
 * @class
 * @classdesc Attribute generation algorithm.
 * Contains the algorithm itself, along with PIR-AIR transformation function and predicate form requirements.
 *
 * @property {function(map<string, Attribute>, { air : AIR, instanceGenerator : iterator<string[]> }[]):map<string, object>} generateFunc attribute generation function
 * @property {function(PIR):AIR} transformFunc PIR-AIR transformation function
 * @property {FormName[]} required predicate forms' names
 */
class AGAlgorithm {
    constructor(generateFunc, transformFunc, requiredForms) {
        this.id            = getNewId();
        this.generateFunc  = generateFunc;
        this.transformFunc = transformFunc;
        this.requiredForms = requiredForms;
    }

    generate(attributes, predicateData) {
        return this.generateFunc(attributes, predicateData);
    }
}

exports = module.exports = AGAlgorithm;