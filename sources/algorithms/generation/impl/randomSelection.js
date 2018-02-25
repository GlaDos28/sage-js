/**
 * ==========================
 * @description Random selection algorithm. Some kind of Monte-Carlo method for generating attribute values by the given attributes and predicate instances.
 * For each attribute algorithm generates value with respective attribute distribution.
 * Then generated values are checked on satisfying every predicate instance.
 * If at least one predicate instance is not satisfied, the algorithm starts again iteratively.
 * ==========================
 *
 * @author  Evgeny Savelyev, NORSI-TRANS
 * @since   ?.02.18
 * @version 1.0.0
 * @licence unlicensed
 */

"use strict";

const AGAlgorithm = require("../AGAlgorithm");
const FormName    = require("../../../predicate/PredicateForm").FormName;

function generate(attributes, predicateData) {
    return genRec(attributes, predicateData, 0);

    /*console.log("Hello from random selecting algorithm!");

    console.log("Attributes:");

    for (const attributeId in attributes) {
        console.log(`\t${attributeId}`);
    }

    console.log("Predicates:");

    for (const predicate of predicateData) {
        console.log(`\tAIR: ${predicate.air}; predicate instances:`);

        const generator = predicate.instanceGenerator();

        for (const instance of generator) {
            console.log(`\t\t${instance.map((attr) => attr.id)}`);
        }
    }*/
}

function genRec(attributes, predicateData, attempt) {
    if (attempt > 1000) { /* TODO implement in general case */
        throw new Error("random selection algorithm has reached maximum attempts of 1000");
    }

    const values = {};

    for (const attrId in attributes) {
        if (attributes.hasOwnProperty(attrId)) {
            const attr = attributes[attrId];

            /* TODO use type, distribution and domain segments */

            values[attrId] = Math.random() * (attr.domain.segments[0].right - attr.domain.segments[0].left) + attr.domain.segments[0].left;
        }
    }

    /* Checking generated attributes' values on satisfying all predicate instances */

    for (const predicate of predicateData) {
        const generator = predicate.instanceGenerator();

        for (const instance of generator) {
            const instanceValues = [];

            for (const attr of instance) {
                instanceValues.push(attr.fixed ? attr.fixedValue : values[attr.id]);
            }

            /* Repeat again if predicate (compiled as JS lambda) returns false */

            if (!predicate.air(...instanceValues)) {
                return genRec(attributes, predicateData, attempt + 1);
            }
        }
    }

    return values;
}

function transform(pir) {
    return null;
}

const randomSelection = new AGAlgorithm(generate, transform, [FormName.BASE]);

exports = module.exports = randomSelection;