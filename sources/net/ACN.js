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
 * @property {map<string, Attribute>} attributes net attributes (mapped with attribute identifiers)
 * @property {Constraint[]} constraints net constraints
 * @property {map<string, object>} meta meta-information entry point for different algorithms
 */
class ACN {
    constructor() {
        this.attributes  = {};
        this.constraints = [];
        this.meta        = {};

        this.__initMeta__();
    }

    __initMeta__() {
        this.meta.pushingTrie = new PushingTrie();
    }

    /**
     * @desc Add new attribute into the net.
     *
     * @param {Attribute} attribute new attribute
     * @returns {void} nothing
     */
    addAttribute(attribute) {
        this.attributes[attribute.id] = attribute;
        this.meta.pushingTrie.putString(attribute.id);
    }

    /**
     * @desc Add new constraint into the net.
     *
     * @param {Constraint} constraint new constraint
     * @returns {void} nothing
     */
    addConstraint(constraint) {
        this.constraints.push(constraint);
        constraint.pushToTrie(this.attributes, this.meta.pushingTrie);
    }

    /**
     * @desc Generate tvalues for given attributes.
     *
     * @param {string[]} attrIds attributes' identifiers. Must form a single component and be the only elements of this component
     * @returns {object[]} generated tvalues for each attribute
     */
    generateComponent(attrIds) {
        return null; /* TODO generate attributes */
    }
}

exports = module.exports = ACN;