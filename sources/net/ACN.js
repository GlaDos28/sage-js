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
const randomSelection = require("../algorithms/generation/impl/randomSelection"); /* TODO remove plug */

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
        //constraint.compilePredicate(this.padme); TODO uncoment
    }

    /**
     * @desc Generate values for given attributes. Attributes must be strictly in one component of connectivity.
     *
     * @param {string} attrIds attributes' identifiers. Must form a single component and be the only elements of this component
     * @returns {object[]} generated values for each attribute
     */
    generateComponent(...attrIds) {
        this.__ensureValidComponent__(attrIds);

        const attributes    = attrIds.map((attrId) => this.attributes[attrId]).filter((attribute) => !attribute.fixed);
        const predicateData = [];
        const clusterSet    = new Set();
        const constraintSet = new Set();

        for (const attribute of attributes) {
            attribute.meta.clusters.filter((cluster) => cluster.resolved).forEach((cluster) => {
                clusterSet.add(cluster);
                constraintSet.add(cluster.constraint);
            });
        }

        constraintSet.forEach((constraint) => {
            const data = {
                air : eval(constraint.predicate.body), /* TODO remove plug */
                instanceGenerator : null
            };

            /* Initially filling attributes of each identifier type */

            const basicIdents     = [];
            const templatedIdents = [];
            const reducerIdents   = [];

            for (const basicIdentNum of constraint.meta.basicIdents.relatedIdents) {
                basicIdents.push({
                    ind  : basicIdentNum,
                    attr : this.attributes[constraint.idents[basicIdentNum].id]
                });
            }

            for (const template of constraint.meta.templatedIdents.tvalues) {
                const idents = {
                    identIndices : [],
                    attrLists    : []
                };

                for (const identIndex of template.relatedIdents) {
                    idents.identIndices.push(identIndex);
                }

                for (const identList of template.templateResolves) {
                    const attrList = [];

                    let addList = true;

                    for (const ident of identList.resolvedIdents) {
                        const attr = this.attributes[ident];

                        if (!attr.fixed || attributes[attr.id] === undefined) { /* Do not add resolved template attributes which not included in generating attribute list */
                            addList = false;
                            break;
                        }

                        attrList.push(attr);
                    }

                    if (addList) {
                        idents.attrLists.push(attrList);
                    }
                }

                templatedIdents.push(idents);
            }

            for (const template of constraint.meta.reducerIdents.tvalues) {
                for (let i = 0; i < template.relatedIdents.length; i += 1) {
                    const reducerIdent = {
                        ind   : template.relatedIdents[i],
                        attrs : []
                    };

                    for (const ident of template.resolvedIdents[i]) {
                        reducerIdent.attrs.push(this.attributes[ident]);
                    }

                    reducerIdents.push(reducerIdent);
                }
            }

            /* Creating predicate instance generator */

            data.instanceGenerator = function* () {
                if (templatedIdents.length === 0) {
                    const instance = [];

                    /* Adding basic identifiers' attributes */

                    for (const basicIdent of basicIdents) {
                        instance[basicIdent.ind] = basicIdent.attr;
                    }

                    /* Adding reducer identifiers' attributes */

                    for (const reducerIdent of reducerIdents) {
                        const attrs = [];

                        for (const attr of reducerIdents.attrs) {
                            attrs.push(attr);
                        }

                        instance[reducerIdent.ind] = {
                            reducer : true,
                            code    : constraint.idents[reducerIdent.ind].reduceFunc,
                            attrs   : attrs
                        };
                    }

                    yield instance;
                    return;
                }

                const tIndices = [];

                for (let i = 0; i < templatedIdents.length; i += 1) {
                    tIndices.push(0);
                }

                let cnt = 0;

                while (cnt + 1 < tIndices.length || tIndices[cnt] < templatedIdents[cnt].attrLists.length) {
                    const instance = [];

                    for (let i = 0; i < constraint.idents.length; i += 1) {
                        instance.push(null);
                    }

                    /* Adding basic identifiers' attributes */

                    for (const basicIdent of basicIdents) {
                        instance[basicIdent.ind] = basicIdent.attr;
                    }

                    /* Adding templated identifiers' attributes */

                    for (let i = 0; i < templatedIdents.length; i += 1) {
                        const template = templatedIdents[i];
                        const attrList = template.attrLists[tIndices[i]];

                        for (let j = 0; j < template.identIndices.length; j += 1) {
                            instance[template.identIndices[j]] = attrList[j];
                        }
                    }

                    /* Adding reducer identifiers' attributes */

                    for (const reducerIdent of reducerIdents) {
                        const attrs = [];

                        for (const attr of reducerIdents.attrs) {
                            attrs.push(attr);
                        }

                        instance[reducerIdent.ind] = {
                            reducer : true,
                            code    : constraint.idents[reducerIdent.ind].reduceFunc,
                            attrs   : attrs
                        };
                    }

                    /* Yielding predicate instance */

                    yield instance;

                    /* Consider next tuple of templated identifiers */

                    tIndices[0] += 1;

                    let i = 0;

                    while (i + 1 < tIndices.length && tIndices[i] === templatedIdents[i].attrLists.length) {
                        tIndices[i] = 0;
                        i += 1;
                        tIndices[i] += 1;
                    }

                    cnt = i;
                }
            };

            /* Adding data of processed predicate */

            predicateData.push(data);
        });

        const attributeDict = {};

        for (const attribute of attributes) {
            attributeDict[attribute.id] = attribute;
        }

        return randomSelection.generate(attributeDict, predicateData);
    }

    /**
     * @desc Check the given attributes to belong to one component of connectivity. Throw errors if something is wrong.
     *
     * @param {string[]} attrIds identifiers of attributes which should be checked
     * @returns {void} nothing
     * @private
     */
    __ensureValidComponent__(attrIds) {
        for (const attrId of attrIds) {
            if (this.attributes[attrId] === undefined) {
                throw new Error(`attribute "${attrId}" is not found in ACN`);
            }
        }

        const attributes = attrIds.map((attrId) => this.attributes[attrId]).filter((attribute) => !attribute.fixed);

        if (attributes.length === 0) {
            return;
        }

        /* Checking attributes to share one component of connectivity  */

        const rootComponent = attributes[0].meta.dsu.getComponent();

        for (const attribute of attributes) {
            if (attribute.meta.dsu.getComponent() !== rootComponent) {
                throw new Error(`attributes "${attributes[0].id}" and "${attribute.id}" are in different components of connectivity`);
            }
        }

        /* Checking attributes to form the whole component (except fixed attributes) */

        const clusterSet       = new Set();
        const inputAttrSet     = new Set();
        const componentAttrSet = new Set();

        for (const attribute of attributes) {
            inputAttrSet.add(attribute);
            attribute.meta.clusters.filter((cluster) => cluster.resolved).forEach((cluster) => clusterSet.add(cluster));
        }

        clusterSet.forEach((cluster) => {
            for (const clusterAttribute of cluster.attributes) {
                componentAttrSet.add(clusterAttribute);
            }
        });

        const missedAttributes = [];

        componentAttrSet.forEach((componentAttr) => {
            if (!inputAttrSet.has(componentAttr) && !componentAttr.fixed) {
                missedAttributes.push(componentAttr);
            }
        });

        if (missedAttributes.length > 0) {
            throw new Error(`the following attributes belong to generating attributes component, but not mention in input list: ${missedAttributes.map((attr) => attr.id)}`);
        }
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