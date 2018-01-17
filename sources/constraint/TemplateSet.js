/**
 * ==========================
 * @description Set of templates used to define multiple constraint identifiers by simplified regular expression.
 * ==========================
 *
 * @author  Evgeny Savelyev
 * @since   17.01.18
 * @version 1.0.0
 * @license See the LICENCE file in the project root.
 */

"use strict";

/**
 * @class
 * @classdesc Set of templates used to define multiple constraint identifiers by simplified regular expression.
 *
 * @property {map<string, Template>} idTemplateMap mappings { id (string) : expr (Template) } that define templates
 */
class TemplateSet {
    constructor(idTemplateMap) {
        this.idTemplateMap = idTemplateMap;
    }

    getTemplate(id) {
        return this.idTemplateMap[id];
    }
}

exports = module.exports = TemplateSet;