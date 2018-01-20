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

const IdentType  = require("./IdentType");
const Regex      = require("../misc/Regex");

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

    constraintResolved() {
        return this.meta.basicIdents.resolvedNum === this.meta.basicIdents.relatedIdents.length;
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
                this.meta.basicIdents.resolvedNum += 1;

                if (!attributes[str].fixed) {
                    if (this.__fusionClusters__()) {
                        attributes[str].meta.dsu.union(this.meta.common.fusionDsuElem);
                    } else {
                        this.meta.common.fusionDsuElem = attributes[str].meta.dsu;
                        this.__mergeClusters__();
                    }
                }
            });
        }

        /* Templated identifiers */

        for (let i = 0; i < this.meta.templatedIdents.tvalues.length; i += 1) {
            const tvalue = this.templates[this.meta.templatedIdents.tvalues[i];

            trie.putRegex(new Regex(this.templates[tvalue.template]), (str, node) => {
                const bufInd = tvalue.templateResolves.length;

                tvalue.templateResolves.push({
                    resolvedTemplate : str,
                    nonFixedIdentDsu : null,
                    resolvedIdents   : [],
                    resolvedIdentNum : 0
                });

                const templateResolves = tvalue.templateResolves[bufInd];
                const relatedIdentNum  = tvalue.relatedIdents.length;

                for (let j = 0; j < relatedIdentNum; j += 1) {
                    templateResolves.resolvedIdents.push(null);

                    node.pushRegex(new Regex(this.idents[tvalue.relatedIdents[j]].postfix), (finalStr, finalNode) => {
                        templateResolves.resolvedIdents[j] = finalStr;
                        templateResolves.resolvedIdentNum += 1;

                        if (!attributes[finalStr].fixed) {
                            templateResolves.nonFixedIdentDsu = attributes[finalStr].meta.dsu;

                            if (this.__fusionClusters__()) {
                                templateResolves.nonFixedIdentDsu.union(this.meta.common.fusionDsuElem);
                            } else if (this.meta.templatedIdents.nonFixedValue !== null && this.meta.templatedIdents.nonFixedValue !== i) {
                                this.meta.common.fusionDsuElem = templateResolves.nonFixedIdentDsu;
                                this.__mergeClusters__();
                            } else {
                                this.meta.templatedIdents.nonFixedValue = i;
                            }
                        }

                        /* Merge attributes inside a cluster whether all of them are resolved */

                        if (templateResolves.resolvedIdentNum === relatedIdentNum && templateResolves.nonFixedIdentDsu !== null) {
                            for (const resolvedIdent of templateResolves.resolvedIdents) {
                                if (!attributes[resolvedIdent].fixed) {
                                    attributes[resolvedIdent].meta.dsu.union(templateResolves.nonFixedIdentDsu);
                                }
                            }
                        }
                    }, str + this.idents[tvalue.relatedIdents[j]].postfix);
                }
            });
        }

        /* Reducer identifiers */

        for (let i = 0; i < this.meta.reducerIdents.tvalues.length; i += 1) {
            const tvalue = this.meta.reducerIdents.tvalues[i];

            trie.putRegex(new Regex(this.templates[tvalue.template]), (str, node) => {
                for (let j = 0; j < tvalue.relatedIdents.length; j += 1) {
                    node.pushRegex(new Regex(this.idents[tvalue.relatedIdents[j]].postfix), (finalStr, finalNode) => {
                        tvalue.identResolves[j].push(finalStr);

                        if (!attributes[finalStr].fixed) {
                            if (this.__fusionClusters__()) {
                                attributes[finalStr].meta.dsu.union(this.meta.common.fusionDsuElem);
                            } else {
                                this.meta.common.fusionDsuElem = attributes[finalStr].meta.dsu;
                                this.__mergeClusters__();
                            }
                        }
                    }, str + this.idents[tvalue.relatedIdents[j]].postfix);
                }
            });
        }
    }

    __initMeta__() { /* TODO init meta for predicate */

        /* Common, basic identifiers, templated identifiers and reducers meta data */

        this.meta.common = { fusionDsuElem : null }; /* If null then clusters should not be merged */

        this.meta.basicIdents = {
            resolvedNum   : [],
            relatedIdents : []
        };

        this.meta.templatedIdents = {
            nonFixedValue : null,
            tvalues       : []
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

                    templateInfo.relatedIdents.push(i);
                } else {
                    this.meta.templatedIdents.tvalues.push({
                        template         : this.idents[i].templateNum,
                        relatedIdents    : [i],
                        templateResolves : [] /* Array of { resolvedTemplate, nonFixedIdentDsu, resolvedIdents, resolvedIdentNum } */
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

                    templateInfo.relatedIdents.push(i);
                    templateInfo.identResolves.push([]);
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

    __fusionClusters__() {
        return this.meta.common.fusionDsuElem !== null;
    }

    __mergeClusters__() {
        if (this.meta.templatedIdents.nonFixedValue !== null) {
            const tvalue = this.meta.templatedIdents.tvalues[this.meta.templatedIdents.nonFixedValue];

            for (const resolveBatch of tvalue.templateResolves) {
                if (resolveBatch.resolvedIdentNum === tvalue.relatedIdents.length && resolveBatch.nonFixedIdentDsu !== null) {
                    resolveBatch.nonFixedIdentDsu.union(this.meta.common.fusionDsuElem);
                }
            }
        }
    }
}

exports = module.exports = Constraint;