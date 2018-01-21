/**
 * ==========================
 * @description Attribute builder. Is a DSL object which provides creating attribute in more convenient way.
 * ==========================
 *
 * @author  Evgeny Savelyev
 * @since   21.01.18
 * @version 1.0.0
 * @license See the LICENCE file in the project root.
 */

"use strict";

const Attribute    = require("../attribute/Attribute");
const Distribution = require("../attribute/Distribution");
const Domain       = require("../attribute/Domain");
const Segment      = require("../attribute/Segment");
const AttrType     = require("../attribute/AttrType");

const DOMAIN_MIN    = -1000000;
const DOMAIN_MAX    = 1000000;

const DEFAULT_DOMAIN = new Domain([new Segment(DOMAIN_MIN, DOMAIN_MAX)]);
const DEFAULT_DISTR  = new Distribution((value) => 1 / (DOMAIN_MAX - DOMAIN_MIN), DEFAULT_DOMAIN);

const ATTR_TYPE_NAME_MAP = {
    "int"     : AttrType.INT,
    "integer" : AttrType.INT,
    "float"   : AttrType.FLOAT,
    "str"     : AttrType.STR,
    "string"  : AttrType.STR,
    "bool"    : AttrType.BOOL,
    "boolean" : AttrType.BOOL
};

/**
 * @class
 * @classdesc Attribute builder. Is a DSL object which provides creating attribute in more convenient way.
 *
 * @property {string} attrId attribute identifier
 * @property {AttrType} attrType attribute type
 * @property {Distribution} attrDistr attribute value probability distribution. Default is even distribution on one large segment
 * @property {Domain} attrDomain attribute determination area. Default is one large segment
 */
class AttributeBuilder {
    constructor() {
        this.attrId     = null;
        this.attrType   = null;
        this.attrDistr  = DEFAULT_DISTR;
        this.attrDomain = DEFAULT_DOMAIN;
    }

    id(id) {
        if (typeof id !== "string") {
            throw new Error(`invalid argument for attribute id: ${id}. Must be nonempty string`);
        }

        if (id === "") {
            throw new Error("attribute id must be nonempty string");
        }

        this.attrId = id;
        return this;
    }

    /**
     * @desc Set attribute type.
     *
     * @param {AttrType|string} type attribute type as value from AttrType enum or as string representing some type.
     * @returns {AttributeBuilder} self
     */
    type(type) {
        if (typeof type === "number" && type >= 1 && type <= 4) {
            this.attrType = type;
        } else if (typeof type === "string") {
            this.attrType = ATTR_TYPE_NAME_MAP[type];

            if (!this.attrType) {
                throw new Error(`invalid attribute type "${type}. Must be one of: ${JSON.stringify(ATTR_TYPE_NAME_MAP)}"`);
            }
        } else {
            throw new Error(`invalid argument for attribute type: ${type}. Must be AttrType (enum|string) or string`);
        }

        return this;
    }

    /**
     * @desc Set attribute distribution. Default is even distribution on one large segment.
     *
     * @param {function(number):number} func probability distribution function of type function(number): [0, 1]
     * @param {number[]} segments distribution domain segments as arrays of size 2, e.g. [1, 2], [5, 18]. Must be disjoint
     * @returns {AttributeBuilder} self
     */
    distribution(func, ...segments) {
        if (typeof func !== "function") {
            throw new Error(`invalid "func" argument for distribution: ${func}. Must be function(number):[0, 1]`);
        }

        const finalSegments = [];

        for (let i = 0; i < segments.length; i += 1) {
            if (!Array.isArray(segments[i]) || segments[i].length !== 2 || typeof segments[i][0] !== "number" || typeof segments[i][1] !== "number") {
                throw new Error(`invalid "segments[${i}]" argument for distribution domain: ${segments[i]}. Must be array with two values [number, number]`);
            }

            finalSegments.push(new Segment(segments[i][0], segments[i][1]));
        }

        this.attrDistr = new Distribution(func, new Domain(segments));

        return this;
    }

    /**
     * @desc Set attribute domain. Default is one large segment.
     *
     * @param {number[]} segments domain segments as arrays of size 2, e.g. [1, 2], [5, 18]. Must be disjoint
     * @returns {AttributeBuilder} self
     */
    domain(...segments) {
        const finalSegments = [];

        for (let i = 0; i < segments.length; i += 1) {
            if (!Array.isArray(segments[i]) || segments[i].length !== 2 || typeof segments[i][0] !== "number" || typeof segments[i][1] !== "number") {
                throw new Error(`invalid "segments[${i}]" argument for attribute domain: ${segments[i]}. Must be array with two values [number, number]`);
            }

            finalSegments.push(new Segment(segments[i][0], segments[i][1]));
        }

        this.domain = new Domain(segments);

        return this;
    }

    /**
     * @desc Build attribute with settled properties. If not every required field set, throws error.
     *
     * @returns {Attribute} new built attribute
     */
    build() {
        this.__ensureReadyForBuild__();
        return new Attribute(this.attrId, this.attrType, this.attrDistr, this.attrDomain);
    }

    /* Private methods */

    __ensureReadyForBuild__() {
        if (this.attrId === null) {
            throw new Error("attribute id must be set. Use id(<string>) method");
        }

        if (this.attrType === null) {
            throw new Error("attribute type must be set. Use type(<enum>) method");
        }
    }
}

exports = module.exports = AttributeBuilder;