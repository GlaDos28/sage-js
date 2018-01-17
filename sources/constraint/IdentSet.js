/**
 * ==========================
 * @description Set of identifiers used in constraint predicate. Uses templates.
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
 * @classdesc Set of identifiers used in constraint predicate. Uses templates.
 *
 * @property {map<string, Identifier>} idIdentMap mappings { id (string) : ident (Identifier) } that define identifiers
 */
class IdentSet {
    constructor(idIdentMap) {
        this.idIdentMap = idIdentMap;
    }

    getIdent(id) {
        return this.idIdentMap[id];
    }
}

exports = module.exports = IdentSet;