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

const Attribute   = require("../attribute/Attribute");
const PushingTrie = require("../algorithms/PushingTrie");
const graphviz    = require("graphviz");
const jsesc       = require("jsesc");

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
     * @desc Add new constant attribute into the net.
     *
     * @param {string} id attribute unique identifier
     * @param {object} value constant attribute value
     * @returns {void} nothing
     */
    addConstantAttribute(id, value) {
        if (this.attributes[id]) {
            throw new Error(`attribute with id "${id}" already exists`);
        }

        const attribute = new Attribute(id, null, null, null);
        attribute.fixValue(value);

        this.addAttribute(attribute);
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

    /**
     * @desc Create visualization of tree of pushing trie used to store attributes' identifiers and constrains' regular expressions and save it into file as PNG image.
     *
     * @param {string} filename name (optionally with path) of the file to save image into
     * @param {string} graphvizPath path to graphvizPath program (required to generate graphs)
     * @returns {string} trie data in dot representation
     */
    outPushingTrie(filename, graphvizPath) {
        const trie = graphviz.digraph("AttributeClusterGraph");

        trie.set("rankdir", "LR");

        /* Adding tree nodes and edges via stack to simulate recursion */

        const stack = [{
            node      : this.meta.pushingTrie.root,
            parent    : null,
            transChar : null
        }];

        let idCounter = 0;

        while (stack.length > 0) {
            const {
                node,
                parent,
                transChar
            } = stack.pop();

            let label = "";

            for (const regex of node.pushRegexes) {
                label += jsesc(regex.regex.toString()) + "\n";
            }

            const graphvizNode = trie.addNode(`${idCounter}`, {
                label     : label,
                fillcolor : "white",
                fontcolor : "#0000ff",
                style     : "filled",
                shape     : node.isFinalState ? "doublecircle" : (node.pushRegexes.length > 0) ? "ellipse" : "circle"
            });

            idCounter += 1;

            if (parent) {
                trie.addEdge(parent, graphvizNode, {
                    label : transChar,
                    color : "black"
                });
            }

            for (const ch in node.symbolStateMap) {
                if (node.symbolStateMap.hasOwnProperty(ch)) {
                    stack.push({
                        node      : node.symbolStateMap[ch],
                        parent    : graphvizNode,
                        transChar : ch
                    });
                }
            }
        }

        /* Output trie */

        trie.setGraphVizPath(graphvizPath);
        trie.output("png", filename);

        return trie.to_dot();
    }

    /**
     * @desc Create visualization of graph with attributes and constraint clusters and save it into file as PNG image.
     *
     * @param {string} filename name (optionally with path) of the file to save image into
     * @param {string} graphvizPath path to graphvizPath program (required to generate graphs)
     * @returns {string} graph data in dot representation
     */
    outAttributeClusterGraph(filename, graphvizPath) {
        const graph = graphviz.graph("AttributeClusterGraph");

        graph.set("layout",  "neato");
        graph.set("overlap", "false");

        /* Creating attribute nodes */

        for (const attrId in this.attributes) {
            if (this.attributes.hasOwnProperty(attrId) && !this.attributes[attrId].fixed) {
                graph.addNode(attrId, {
                    fillcolor : "white",
                    style     : "filled"
                });
            }
        }

        /* Creating cluster nodes and edges */

        let clusterCounter = 0;

        for (let i = 0; i < this.constraints.length; i += 1) {
            for (let j = 0; j < this.constraints[i].meta.clusters.length; j += 1) {
                const cluster     = this.constraints[i].meta.clusters[j];
                const clusterId   = `__${clusterCounter}__`;
                const clusterName = `${this.constraints[i].predicate.body}\n(cluster ${j + 1} of ${this.constraints[i].meta.clusters.length})`;

                graph.addNode(clusterId, {
                    label     : clusterName,
                    fillcolor : "#90e0d0",
                    fontname  : "times-bold",
                    style     : cluster.resolved ? "filled" : "filled, dashed",
                    shape     : "rectangle"
                });

                clusterCounter += 1;

                for (const attr of cluster.attributes) {
                    graph.addEdge(attr.id, clusterId, { color : "black" });
                }
            }
        }

        /* Output graph */

        graph.setGraphVizPath(graphvizPath);
        graph.output("png", filename);

        return graph.to_dot();
    }

    /**
     * @desc Create visualization of graph with attributes and constraints and save it into file as PNG image.
     *
     * @param {string} filename name (optionally with path) of the file to save image into
     * @param {string} graphvizPath path to graphvizPath program (required to generate graphs)
     * @returns {string} graph data in dot representation
     */
    outAttributeConstraintGraph(filename, graphvizPath) {
        const graph = graphviz.graph("AttributeClusterGraph");

        graph.set("layout",  "neato");
        graph.set("overlap", "false");

        /* Creating attribute nodes */

        for (const attrId in this.attributes) {
            if (this.attributes.hasOwnProperty(attrId)) {
                graph.addNode(attrId, {
                    label     : attrId + (this.attributes[attrId].fixed ? `=${this.attributes[attrId].fixedValue}` : ""),
                    shape     : "ellipse",
                    fontcolor : this.attributes[attrId].fixed ? "#0000ff" : "#000000",
                    fillcolor : "white",
                    style     : "filled"
                });
            }
        }

        /* Creating constraint nodes and edges */

        for (let i = 0; i < this.constraints.length; i += 1) {
            const constraint     = this.constraints[i];
            const constraintId   = `__${i}__`;
            const constraintName = `${constraint.predicate.body}`;

            graph.addNode(constraintId, {
                label     : constraintName,
                fillcolor : "#90e0d0",
                fontname  : "times-bold",
                style     : constraint.allClustersResolved() ? "filled" : "filled, dashed",
                shape     : "rectangle"
            });

            for (const attr of constraint.meta.common.resolvedAttrs) {
                graph.addEdge(attr.id, constraintId, { color : "black" });
            }
        }

        /* Output graph */

        graph.setGraphVizPath(graphvizPath);
        graph.output("png", filename);

        return graph.to_dot();
    }
}

exports = module.exports = ACN;