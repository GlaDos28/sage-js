/**
 * ==========================
 * @description Net attribute definition. One of the base elements of SAGE mechanism.
 * ==========================
 *
 * @author  Evgeny Savelyev
 * @since   17.01.18
 * @version 1.0.0
 * @license See the LICENCE file in the project root.
 */

"use strict";

const DSU = require("../algorithms/DSU");

/**
 * @class
 * @classdesc Net attribute definition. One of the base elements of SAGE mechanism.
 *
 * @property {string} id attribute unique identification string
 * @property {AttrType} type attribute type from list
 * @property {Distribution} distribution attribute value probability distribution
 * @property {Domain} domain attribute determination area
 * @property {boolean} fixed whether attribute has the only possible value to generate (i.e. fixed value)
 * @property {object|null} fixedValue attribute fixed value. Not null only if fixed=true
 * @property {map<string, object>} meta meta-information entry point for different algorithms
 */
class Attribute {
    constructor(id, type, distribution, domain) {
        this.id           = id;
        this.type         = type;
        this.distribution = distribution;
        this.domain       = domain;
        this.fixed        = false;
        this.fixedValue   = null;
        this.meta         = {};

        this.__initMeta__();
    }

    fixValue(value) {
        this.fixed      = true;
        this.fixedValue = value;
    }

    __initMeta__() {
        this.meta.dsu         = new DSU();
        this.meta.constraints = [];
        this.meta.clusters    = [];
    }
}

exports = module.exports = Attribute;