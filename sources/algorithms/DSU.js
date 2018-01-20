/**
 * ==========================
 * @description Disjoint Set Union algorithm. Used in attribute meta. Implemented with storing node number (have extra use in attribute generating process).
 * ==========================
 *
 * @author  Evgeny Savelyev
 * @since   19.01.18
 * @version 1.0.0
 * @license See the LICENCE file in the project root.
 */

"use strict";

let idCounter = 0;

function nextId() {
    idCounter += 1;
    return idCounter - 1;
}

/**
 * @class
 * @classdesc Disjoint Set Union algorithm. Used in attribute meta. Implemented with storing node number (have extra use in attribute generating process).
 *
 * @property {int} id attribute id number (is a component id whether node is a root, i.e. this.parent = this)
 * @property {DSU} parent link to parent's DSU element
 * @property {int} nodeNum number of nodes in node subtree (including self node)
 */
class DSU {
    constructor() {
        this.id      = nextId();
        this.parent  = this;
        this.nodeNum = 1;
    }

    getComponent() {
        this.__updateParent__();
        return this.parent.id;
    }

    union(dsuNode) {
        if (this.getComponent() !== dsuNode.getComponent()) {
            if (dsuNode.nodeNum > this.nodeNum) {
                this.parent = dsuNode.parent;
                dsuNode.nodeNum += this.nodeNum;
            } else {
                dsuNode.parent = this.parent;
                this.nodeNum += dsuNode.nodeNum;
            }
        }
    }

    __updateParent__() {
        if (this.parent.parent !== this.parent) {
            this.parent = this.parent.parent;
            this.__updateParent__();
        }
    }
}

exports = module.exports = DSU;