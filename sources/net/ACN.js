/**
 * ==========================
 * @description Attribute-Constraint Net. Core of SAGE mechanism.
 * ==========================
 *
 * @author  Evgeny Savelyev
 * @since   19.01.18
 * @version 1.0.0
 * @license See the LICENCE file in the project root.
 */

"use strict";

const PushingTrie = require("../algorithms/PushingTrie");

/**
 * @class
 * @classdesc Attribute-Constraint Net. Core of SAGE mechanism.
 *
 * @property {Attribute[]} attributes net attributes
 * @property {Constraint[]} constraints net constraints
 * @property {map<string, object>} meta meta-information entry point for different algorithms
 */
class ACN {
    constructor() {
        this.attributes  = [];
        this.constraints = [];
        this.meta        = {};

        this.initMeta();
    }

    initMeta() {
        this.meta.pushingTrie = new PushingTrie();
    }

    addAttribute(attribute) {
        /* TODO adding new attribute */
    }

    addConstraint(constraint) {
        /* TODO adding new constraint */
    }

    generateComponent(attributes) {
        /* TODO generate attributes */
    }
}

exports = module.exports = ACN;