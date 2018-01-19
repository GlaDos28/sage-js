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
 * @property {Template[]} templates array of templates used to describe identifiers
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

    __initMeta__() { /* TODO init meta for predicate */
        /* Basic identifiers, templated identifiers and reducers meta data */

        this.meta.basicIdents = {
            areResolved    : false,
            areFixed       : true,
            resolvedNum    : [],
            relatedIdents  : [],
            resolvedIdents : []
        };

        this.meta.templatedIdents = { tvalues : [] };
        this.meta.reducerIdents   = { tvalues : [] };

        const templateInfoMap = {};

        for (let i = 0; i < this.idents.length; i += 1) {
            switch (this.idents[i].type) {
                case IdentType.BASIC:
                    this.meta.basicIdents.relatedIdents.push(i);
                    this.meta.basicIdents.resolvedIdents.push(false);
                    break;
                case IdentType.TEMPLATED:
                    if (templateInfoMap[this.idents[i].templateNum]) {
                        const templateInfo = templateInfoMap[this.idents[i].templateNum];

                        if (templateInfo.isReducer) {
                            throw new Error(`template ${templateInfo.template} is used for both templated and reducer identifiers`);
                        }

                        templateInfo.relatedIdents.push(i);
                    } else {
                        this.meta.templatedIdents.tvalues.push({
                            template         : this.idents[i].templateNum,
                            relatedIdents    : [i],
                            templateResolves : [] /* array of { resolved template, resolved idents num, resolved idents array } */
                        });

                        templateInfoMap[this.idents[i].templateNum] = {
                            isReducer : false,
                            ref       : this.meta.templatedIdents.tvalues[this.meta.templatedIdents.tvalues.length - 1]
                        };
                    }

                    break;
                case IdentType.REDUCER:
                    if (templateInfoMap[this.idents[i].templateNum]) {
                        const templateInfo = templateInfoMap[this.idents[i].templateNum];

                        if (!templateInfo.isReducer) {
                            throw new Error(`template ${templateInfo.template} is used for both templated and reducer identifiers`);
                        }

                        templateInfo.relatedIdents.push(i);
                        templateInfo.identResolves.push([]);
                    } else {
                        this.meta.reducerIdents.tvalues.push({
                            template      : this.idents[i].templateNum,
                            relatedIdents : [i],
                            identResolves : [[]] /* array of resolved idents arrays (for each related ident) */
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
            if (templateInfoMap[i]) {
                throw new Error(`template ${i} is not used in any templated or reducer identifier`);
            }
        }
    }

    /**
     * @desc pushes regexes into pushing trie. Must be called right after adding constraint into the ACN
     *
     * @param {function(string):boolean} attrFixed function that checks whether the attribute is fixed
     * @param {PushingTrie} trie pushing trie to push regexes into
     * @returns {void} nothing
     */
    pushToTrie(attrFixed, trie) {

        /* Basic identifiers */

        for (let i = 0; i < this.meta.basicIdents.relatedIdents.length; i += 1) {
            trie.putRegex(new Regex(), (str, node) => { /* TODO form regex */
                this.meta.basicIdents.resolvedIdents[i] = true;
                this.meta.basicIdents.resolvedNum += 1;

                if (!attrFixed(str)) {
                    this.meta.basicIdents.areFixed = false;
                }

                if (this.meta.basicIdents.resolvedNum === this.meta.basicIdents.relatedIdents.length) {
                    this.meta.basicIdents.areResolved = true;
                    this.__mergeInClusters__();
                }
            });
        }

        /* Templated identifiers */

        for (let i = 0; i < this.meta.templatedIdents.tvalues.length; i += 1) {
            trie.putRegex(new Regex(), (str, node) => { /* TODO form regex */
                const bufInd = this.meta.templatedIdents.tvalues[i].templateResolves.length;

                this.meta.templatedIdents.tvalues[i].templateResolves.push({
                    templateValue  : str,
                    isResolved     : false,
                    resolvedNum    : 0,
                    resolvedIdents : []
                });

                for (let j = 0; j < this.meta.templatedIdents.tvalues[i].relatedIdents.length; j += 1) {
                    this.meta.templatedIdents.tvalues[i].templateResolves[bufInd].resolvedIdents.push(false);

                    node.pushRegex(new Regex(), (finalStr, finalNode) => {
                        this.meta.templatedIdents.tvalues[i].templateResolves[bufInd].resolvedIdents[j] = finalStr;
                        this.meta.templatedIdents.tvalues[i].templateResolves[bufInd].resolvedNum += 1;

                        if (this.meta.templatedIdents.tvalues[i].templateResolves[bufInd].resolvedNum === this.meta.templatedIdents.tvalues[i].relatedIdents.length) {
                            this.meta.templatedIdents.tvalues[i].templateResolves[bufInd].isResolved = true; /* TODO merging in new cluster */
                        }
                    }, str + this.idents[this.meta.templatedIdents.tvalues[i].relatedIdents[j]].postfix); /* TODO form regex */
                }
            });
        }

        /* Reducer identifiers */

        for (let i = 0; i < this.meta.reducerIdents.tvalues.length; i += 1) {
            trie.putRegex(new Regex(), (str, node) => { /* TODO form regex */
                for (let j = 0; j < this.meta.reducerIdents.tvalues[i].relatedIdents.length; j += 1) {
                    node.pushRegex(new Regex(), (finalStr, finalNode) => {
                        this.meta.reducerIdents.tvalues[i].identResolves[j].push(finalStr);
                    }, str + this.idents[this.meta.reducerIdents.tvalues[i].relatedIdents[j]].postfix); /* TODO form regex */
                }
            });
        }
    }

    __mergeInClusters__() {

    }

    __getClusterTemplatedIdentsGenerator__() {
        const self = this;

        return function*() {
            const indexTuple = [];
            const resTuple   = [];

            for (let i = 0; i < self.meta.templatedIdents.tvalues.length; i += 1) {
                indexTuple.push(0);

                for (let j = 0; j < self.meta.templatedIdents.tvalues[i].relatedIdents.length; j += 1) {
                    resTuple.push(null);
                }
            }

            let depth = self.meta.templatedIdents.tvalues.length - 1;

            while (true) {
                if (depth === self.meta.templatedIdents.tvalues.length - 1) {
                    /* TODO yield res */
                }



                if (indexTuple[depth] === self.meta.templatedIdents.tvalues[depth].resolvedIdents.length - 1) {
                    indexTuple[depth] = 0;
                    depth -= 1;
                } else {
                    indexTuple[depth] += 1;

                    if (depth === self.meta.templatedIdents.tvalues.length - 1) {
                        /* TODO yield res */
                    } else {
                        depth += 1;
                    }
                }
            }
        };
    }
}

exports = module.exports = Constraint;