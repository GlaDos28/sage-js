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

/**
 * @class
 * @classdesc Net attribute definition. One of the base elements of SAGE mechanism.
 *
 * @property {AttrType} type attribute type from list
 * @property {Distribution} distribution attribute value probability distribution
 * @property {Domain} domain attribute determination area
 * @property {Map} meta meta-information entry point for different algorithms
 */
class Attribute {
    constructor(type, distribution, domain) {
        this.type         = type;
        this.distribution = distribution;
        this.domain       = domain;
        this.meta         = {};
    }
}

exports = module.exports = Attribute;