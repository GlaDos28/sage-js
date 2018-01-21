/**
 * ==========================
 * @description Constraint's cluster that connects several resolved identifiers (i.e. attributes). Has a reference to its constraint.
 * ==========================
 *
 * @author  Evgeny Savelyev
 * @since   20.01.18
 * @version 1.0.0
 * @license See the LICENCE file in the project root.
 */

"use strict";

/**
 * @class
 * @classdesc Constraint's cluster that connects several resolved identifiers (i.e. attributes). Has a reference to its constraint.
 *
 * @property {Constraint} constraint link to the constraint
 * @property {Attribute[]} attributes cluster attributes' links
 */
class Cluster {
    constructor(constraint, ...attributes) {
        this.constraint = constraint;
        this.attributes = [attributes[0]];
        this.resolved   = false;

        for (let i = 1; i < attributes.length; i += 1) {
            this.attributes.push(attributes[i]);
            this.attributes[0].meta.dsu.union(attributes[i].meta.dsu);
            attributes[i].meta.clusters.push(this);
        }
    }

    mergeCluster(anotherCluster) {
        this.addAttributes(...anotherCluster.attributes);
    }

    addAttributes(...attributes) {
        for (const attribute of attributes) {
            this.attributes.push(attribute);
            this.attributes[0].meta.dsu.union(attribute.meta.dsu);
            attribute.meta.clusters.push(this);
        }
    }

    resolve() {
        this.resolved = true;
    }
}

exports = module.exports = Cluster;