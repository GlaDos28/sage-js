/**
 * ==========================
 * @description Net constraint definition. One of the base elements of SAGE mechanism.
 * ==========================
 *
 * @author  Evgeny Savelyev
 * @since   17.01.18
 * @version 1.0.0
 * @license See the LICENCE file in the project root.
 */

"use strict";

const IdentType = require("./IdentType");
const Regex     = require("../misc/Regex");
const Cluster   = require("./Cluster");

/**
 * @class
 * @classdesc Net constraint definition. One of the base elements of SAGE mechanism.
 *
 * @property {Regex[]} templates array of templates (regular expressions) used to describe identifiers
 * @property {Identifier[]} idents array of identifiers used in constraint predicate
 * @property {Predicate} predicate constraint predicate function. Defines requirements on attributes via generation process
 * @property {map<string, object>} meta meta-information entry point for different algorithms
 */
class Constraint {
    constructor(templates, idents, predicate) {
        this.templates = templates;
        this.idents    = idents;
        this.predicate = predicate;
        this.meta      = {};

        this.__initMeta__();
    }

    /**
     * @desc pushes regexes into pushing trie. Must be called right after adding constraint into the ACN
     *
     * @param {map<string, Attribute>} attributes ACN attributes (mappings { attribute id (string) : attribute (Attribute) })
     * @param {PushingTrie} trie pushing trie to push regexes into
     * @returns {void} nothing
     */
    pushToTrie(attributes, trie) {

        /* Basic identifiers */

        for (let i = 0; i < this.meta.basicIdents.relatedIdents.length; i += 1) {
            trie.putRegex(new Regex(this.idents[this.meta.basicIdents.relatedIdents[i]].id), (str, node) => {
                const attr = attributes[str];

                this.meta.common.resolvedAttrs.push(attr);
                attr.meta.constraints.push(this);

                this.meta.basicIdents.resolvedNum += 1;

                if (!attr.fixed) {
                    if (this.__fusionClusters__()) {
                        this.meta.clusters[0].addAttributes(attr);
                    } else {
                        this.meta.common.fusionAttr = attr;
                        this.__mergeClusters__();
                    }
                }

                if (this.__hasPredicateInstance__()) {
                    if (this.__fusionClusters__()) {
                        this.meta.clusters[0].resolve();
                    } else if (this.meta.templatedIdents.nonFixedValue !== null) {
                        for (const resolvedTemplateInd in this.meta.templatedIdents.resolvedTemplateClusterMap) {
                            if (this.meta.templatedIdents.resolvedTemplateClusterMap.hasOwnProperty(resolvedTemplateInd)) {
                                const tvalue = this.meta.templatedIdents.tvalues[this.meta.templatedIdents.nonFixedValue];

                                if (tvalue.templateResolves[resolvedTemplateInd].resolvedIdentNum === tvalue.relatedIdents.length) {
                                    const cluster = this.meta.templatedIdents.resolvedTemplateClusterMap[resolvedTemplateInd];

                                    if (cluster) {
                                        cluster.resolve();
                                    }
                                }
                            }
                        }
                    }
                }
            }, true);
        }

        /* Templated identifiers */

        for (let i = 0; i < this.meta.templatedIdents.tvalues.length; i += 1) {
            const tvalue = this.meta.templatedIdents.tvalues[i];

            trie.putRegex(this.templates[tvalue.template], (str, node) => {
                const bufInd = tvalue.templateResolves.length;

                tvalue.templateResolves.push({
                    resolvedIdents   : [],
                    resolvedIdentNum : 0
                });

                const templateResolves = tvalue.templateResolves[bufInd];
                const relatedIdentNum  = tvalue.relatedIdents.length;

                for (let j = 0; j < relatedIdentNum; j += 1) {
                    templateResolves.resolvedIdents.push(null);

                    node.pushRegex(new Regex(this.idents[tvalue.relatedIdents[j]].postfix), (finalStr, finalNode) => {
                        const attr = attributes[finalStr];

                        this.meta.common.resolvedAttrs.push(attr);
                        attr.meta.constraints.push(this);

                        templateResolves.resolvedIdents[j] = finalStr;
                        templateResolves.resolvedIdentNum += 1;

                        if (!attr.fixed) {
                            this.meta.templatedIdents.resolvedTemplateClusterMap[bufInd] = false; /* "false" indicates existence of non-fixed attribute */
                        }

                        if (templateResolves.resolvedIdentNum === relatedIdentNum) {
                            let cluster = this.meta.templatedIdents.resolvedTemplateClusterMap[bufInd];

                            if (cluster === false) {
                                const nonFixedAttrs = [];

                                for (const attrId of templateResolves.resolvedIdents) {
                                    if (!attributes[attrId].fixed) {
                                        nonFixedAttrs.push(attributes[attrId]);
                                    }
                                }

                                if (this.__fusionClusters__()) {
                                    this.meta.clusters[0].addAttributes(...nonFixedAttrs);
                                } else {
                                    this.meta.templatedIdents.nonFixedValue = i;
                                    cluster = new Cluster(this, ...nonFixedAttrs);
                                    this.meta.clusters.push(cluster);
                                }

                                if (this.meta.templatedIdents.nonFixedValue !== null && this.meta.templatedIdents.nonFixedValue !== i) {
                                    [this.meta.common.fusionAttr] = nonFixedAttrs;
                                    this.__mergeClusters__();
                                }
                            }

                            if (!tvalue.hasResolved) {
                                tvalue.hasResolved = true;
                                this.meta.templatedIdents.hasResolvedNum += 1;
                            }

                            if (this.__hasPredicateInstance__()) {
                                if (this.__fusionClusters__()) {
                                    this.meta.clusters[0].resolve();
                                } else if (cluster) {
                                    cluster.resolve();
                                }
                            }
                        }
                    }, true, str);
                }
            }, false);
        }

        /* Reducer identifiers */

        for (let i = 0; i < this.meta.reducerIdents.tvalues.length; i += 1) {
            const tvalue = this.meta.reducerIdents.tvalues[i];

            trie.putRegex(this.templates[tvalue.template], (str, node) => {
                for (let j = 0; j < tvalue.relatedIdents.length; j += 1) {
                    node.pushRegex(new Regex(this.idents[tvalue.relatedIdents[j]].postfix), (finalStr, finalNode) => {
                        const attr = attributes[finalStr];

                        this.meta.common.resolvedAttrs.push(attr);
                        attr.meta.constraints.push(this);

                        tvalue.identResolves[j].push(finalStr);

                        if (!attr.fixed) {
                            if (this.__fusionClusters__()) {
                                this.meta.clusters[0].addAttributes(attr);
                            } else {
                                this.meta.common.fusionAttr = attr;
                                this.__mergeClusters__();
                            }
                        }
                    }, true, str);
                }
            }, false);
        }
    }

    allClustersResolved() {
        for (const cluster of this.meta.clusters) {
            if (!cluster.resolved) {
                return false;
            }
        }

        return true;
    }

    __initMeta__() {
        this.__initIdentMeta__();
        this.__initClusterMeta__();
        this.__initPredicateMeta__();
    }

    __initIdentMeta__() {
        this.meta.common = {
            fusionAttr    : null, /* If null then clusters should not be merged */
            resolvedAttrs : []
        };

        this.meta.basicIdents = {
            resolvedNum   : 0,
            relatedIdents : []
        };

        this.meta.templatedIdents = {
            nonFixedValue              : null,
            tvalues                    : [],
            resolvedTemplateClusterMap : {}, /* Mappings { index : cluster }. Used in non-fusion cases */
            hasResolvedNum             : 0
        };

        this.meta.reducerIdents = { tvalues : [] };

        const templateInfoMap = {};

        for (let i = 0; i < this.idents.length; i += 1) {
            let templateInfo = null;

            switch (this.idents[i].type) {
            case IdentType.BASIC:
                this.meta.basicIdents.relatedIdents.push(i);
                break;
            case IdentType.TEMPLATED:
                templateInfo = templateInfoMap[this.idents[i].templateNum];

                if (templateInfo) {
                    if (templateInfo.isReducer) {
                        throw new Error(`template ${templateInfo.template} is used for both templated and reducer identifiers`);
                    }

                    templateInfo.ref.relatedIdents.push(i);
                } else {
                    this.meta.templatedIdents.tvalues.push({
                        template         : this.idents[i].templateNum,
                        relatedIdents    : [i],
                        templateResolves : [], /* Array of { resolvedIdents, resolvedIdentNum } */
                        hasResolved      : false
                    });

                    templateInfoMap[this.idents[i].templateNum] = {
                        isReducer : false,
                        ref       : this.meta.templatedIdents.tvalues[this.meta.templatedIdents.tvalues.length - 1]
                    };
                }

                break;
            case IdentType.REDUCER:
                templateInfo = templateInfoMap[this.idents[i].templateNum];

                if (templateInfo) {
                    if (!templateInfo.isReducer) {
                        throw new Error(`template ${templateInfo.template} is used for both templated and reducer identifiers`);
                    }

                    templateInfo.ref.relatedIdents.push(i);
                    templateInfo.ref.identResolves.push([]);
                } else {
                    this.meta.reducerIdents.tvalues.push({
                        template      : this.idents[i].templateNum,
                        relatedIdents : [i],
                        identResolves : [[]] /* Array of resolved idents arrays (for each related ident) */
                    });

                    templateInfoMap[this.idents[i].templateNum] = {
                        isReducer : true,
                        ref       : this.meta.reducerIdents.tvalues[this.meta.reducerIdents.tvalues.length - 1]
                    };
                }

                break;
            default:
                throw new Error("oops! Unsupported identifier type: " + this.idents[i].type);
            }
        }

        for (let i = 0; i < this.templates.length; i += 1) {
            if (!templateInfoMap[i]) {
                throw new Error(`template ${i} is not used in any templated or reducer identifier`);
            }
        }
    }

    __initClusterMeta__() {
        this.meta.clusters = [];
    }

    __initPredicateMeta__() {
        /* TODO init meta for predicate */
    }

    __fusionClusters__() {
        return this.meta.common.fusionAttr !== null;
    }

    __hasPredicateInstance__() {
        return this.meta.basicIdents.resolvedNum === this.meta.basicIdents.relatedIdents.length &&
            this.meta.templatedIdents.hasResolvedNum === this.meta.templatedIdents.tvalues.length;
    }

    __mergeClusters__() {
        if (this.meta.clusters.length === 0) {
            this.meta.clusters.push(new Cluster(this, this.meta.common.fusionAttr));
        } else {

            /* Merge clusters */

            for (let i = 1; i < this.meta.clusters.length; i += 1) {
                this.meta.clusters[0].mergeCluster(this.meta.clusters[i]);
            }

            /* Making the first (merged) cluster the only one */

            this.meta.clusters = [this.meta.clusters[0]];

            /* Add fusion attribute into the cluster */

            this.meta.clusters[0].addAttributes(this.meta.common.fusionAttr);
        }

        if (this.__hasPredicateInstance__()) {
            this.meta.clusters[0].resolve();
        }
    }
}

exports = module.exports = Constraint;