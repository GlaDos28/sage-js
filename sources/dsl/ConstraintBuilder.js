/**
 * ==========================
 * @description Constraint builder. Is a DSL object which provides creating constraint in more convenient way.
 * ==========================
 *
 * @author  Evgeny Savelyev
 * @since   21.01.18
 * @version 1.0.0
 * @license See the LICENCE file in the project root.
 */

"use strict";

const Constraint = require("../constraint/Constraint");
const Identifier = require("../constraint/Identifier");
const IdentType  = require("../constraint/IdentType");
const Regex      = require("../misc/Regex");
const Predicate  = require("../predicate/Predicate");

/**
 * @class
 * @classdesc Constraint builder. Is a DSL object which provides creating constraint in more convenient way.
 *
 * @property {Regex[]} constrTemplates constraint templates
 * @property {{name:string,type:int,args:map}[]} deferredIdents constraint deferred identifiers which will be created due building
 * @property {string} predicateBody constraint predicate body in string form
 * @property {map<string, int>} templateNameMap mappings { template name : template index }
 * @property {map<string, int>} identNameMap mappings { ident name : ident index }
 */
class ConstraintBuilder {
    constructor() {
        this.constrTemplates = [];
        this.deferredIdents  = [];
        this.predicateBody   = null;
        this.templateNameMap = {};
        this.identNameMap    = {};
    }

    /**
     * @desc Add new constraint template.
     *
     * @param {string} name template naming to use in identifier references to it
     * @param {string} regex template's regular expression
     * @returns {ConstraintBuilder} self
     */
    template(name, regex) {
        if (typeof name !== "string" || name === "") {
            throw new Error(`invalid argument "name" for template: ${name}. Must be unique nonempty string`);
        }

        if (this.templateNameMap[name] !== undefined) {
            throw new Error(`template with name "${name}" already exists`);
        }

        if (typeof regex !== "string" || regex === "") {
            throw new Error(`invalid argument "regex" for template: ${regex}. Must be nonempty string with regular expression`);
        }

        this.constrTemplates.push(new Regex(regex));
        this.templateNameMap[name] = this.constrTemplates.length - 1;

        return this;
    }

    /**
     * @desc Add new constraint basic identifier.
     *
     * @param {string} name identifier naming to use in predicate references to it
     * @param {string} attrId attribute id which basic identifier related to
     * @returns {ConstraintBuilder} self
     */
    basicIdent(name, attrId) {
        if (typeof name !== "string" || name === "") {
            throw new Error(`invalid argument "name" for basicIdent: ${name}. Must be unique nonempty string`);
        }

        if (this.identNameMap[name] !== undefined) {
            throw new Error(`identifier with name "${name}" already exists`);
        }

        if (typeof attrId !== "string" || attrId === "") {
            throw new Error(`invalid argument "attrId" for basicIdent: ${attrId}. Must be valid attribute id (nonempty string)`);
        }

        this.deferredIdents.push({
            name : name,
            type : IdentType.BASIC,
            args : { id : attrId }
        });
        this.identNameMap[name] = this.deferredIdents.length - 1;

        return this;
    }

    /**
     * @desc Add new constraint templated identifier.
     *
     * @param {string} name identifier naming to use in predicate references to it
     * @param {string} templateName name of template to use. May be non-added template yet, but template must exist when build() method is called
     * @param {string} identIdPostfix identifier postfix string that concatenates with template string instance and forms complete attribute id reference
     * @returns {ConstraintBuilder} self
     */
    templatedIdent(name, templateName, identIdPostfix) {
        if (typeof name !== "string" || name === "") {
            throw new Error(`invalid argument "name" for templatedIdent: ${name}. Must be unique nonempty string`);
        }

        if (this.identNameMap[name] !== undefined) {
            throw new Error(`identifier with name "${name}" already exists`);
        }

        if (typeof templateName !== "string" || templateName === "") {
            throw new Error(`invalid argument "templateName" for templatedIdent: ${templateName}. Must be reference to template (by name)`);
        }

        if (typeof identIdPostfix !== "string") {
            throw new Error(`invalid argument "identIdPostfix" for templatedIdent: ${identIdPostfix}. Must be string`);
        }

        this.deferredIdents.push({
            name : name,
            type : IdentType.TEMPLATED,
            args : {
                templateNum : templateName,
                postfix     : identIdPostfix
            }
        });
        this.identNameMap[name] = this.deferredIdents.length - 1;

        return this;
    }

    /**
     * @desc Add new constraint reducer identifier.
     *
     * @param {string} name identifier naming to use in predicate references to it
     * @param {string} templateName name of template to use. May be non-added template yet, but template must exist when build() method is called
     * @param {string} identIdPostfix identifier postfix string that concatenates with template string instance and forms complete attribute id reference
     * @param {string} reduceFunc reduce function in string form
     * @returns {ConstraintBuilder} self
     */
    reducerIdent(name, templateName, identIdPostfix, reduceFunc) {
        if (typeof name !== "string" || name === "") {
            throw new Error(`invalid argument "name" for reducerIdent: ${name}. Must be unique nonempty string`);
        }

        if (this.identNameMap[name] !== undefined) {
            throw new Error(`identifier with name "${name}" already exists`);
        }

        if (typeof templateName !== "string" || templateName === "") {
            throw new Error(`invalid argument "templateName" for reducerIdent: ${templateName}. Must be reference to template (by name)`);
        }

        if (typeof identIdPostfix !== "string") {
            throw new Error(`invalid argument "identIdPostfix" for reducerIdent: ${identIdPostfix}. Must be string`);
        }

        if (typeof reduceFunc !== "string") {
            throw new Error(`invalid argument "reduceFunc" for reducerIdent: ${reduceFunc}. Must be reduce function (string)`);
        }

        this.deferredIdents.push({
            name : name,
            type : IdentType.REDUCER,
            args : {
                templateNum : templateName,
                postfix     : identIdPostfix,
                reduceFunc  : reduceFunc
            }
        });
        this.identNameMap[name] = this.deferredIdents.length - 1;

        return this;
    }

    /**
     * @desc Set constraint predicate.
     *
     * @param {string} predicateBody predicate body in string form
     * @returns {ConstraintBuilder} self
     */
    predicate(predicateBody) {
        if (typeof predicateBody !== "string") {
            throw new Error(`invalid argument for predicate: ${predicateBody}. Must be string with predicate body`);
        }

        this.predicateBody = predicateBody;

        return this;
    }

    /**
     * @desc Build constraint with settled properties. If not every required field set, throws error.
     *
     * @returns {Constraint} new built constraint
     */
    build() {
        this.__ensureReadyForBuild__();

        const constrIdents = [];

        for (const deferredIdent of this.deferredIdents) {
            if (deferredIdent.type === IdentType.TEMPLATED || deferredIdent.type === IdentType.REDUCER) {
                const templateName = deferredIdent.args.templateNum;
                const templateNum  = this.templateNameMap[templateName];

                if (templateNum === undefined) {
                    throw new Error(`identifier "${deferredIdent.name}" references to nonexistent template "${templateName}"`);
                }

                deferredIdent.args.templateNum = templateNum;
            }

            constrIdents.push(new Identifier(deferredIdent.type, deferredIdent.args));
        }

        return new Constraint(this.constrTemplates, constrIdents, new Predicate(this.predicateBody));
    }

    /* Private methods */

    __ensureReadyForBuild__() {
        if (this.predicateBody === null) {
            throw new Error("constraint predicate must be set. Use predicate(<string>) method");
        }

        if (this.deferredIdents.length === 0) {
            throw new Error("constraint must use at least one identifier. Use basicIdent(..), templatedIdent(..) or reducerIdent(..)");
        }
    }
}

exports = module.exports = ConstraintBuilder;