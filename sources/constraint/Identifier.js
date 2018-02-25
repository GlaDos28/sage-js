/**
 * ==========================
 * @description Constraint identifier. Can be one of the forms given in IdentType list.
 * ==========================
 *
 * @author  Evgeny Savelyev
 * @since   17.01.18
 * @version 1.0.0
 * @license See the LICENCE file in the project root.
 */

"use strict";

const IdentType = require("./IdentType");

/**
 * @class
 * @classdesc Constraint identifier. Can be one of the forms given in IdentType list.
 *
 * @property {IdentType} type identifier type from the list
 * @property {string} expr expression of the required form
 * @property {string|undefined} id attribute id (for IdentType.BASIC only)
 * @property {int|undefined} templateNum index of template used (for IdentType.TEMPLATED and IdentType.REDUCER only)
 * @property {string|undefined} postfix string added after template prefix (for IdentType.TEMPLATED and IdentType.REDUCER only)
 * @property {string|undefined} reduceFunc reducer function in string form (for IdentType.REDUCER only)
 */
class Identifier {
    constructor(type, args) {
        this.type = type;

        switch (type) {
        case IdentType.BASIC:
            this.id = args.id;
            break;
        case IdentType.TEMPLATED:
            this.templateNum = args.templateNum;
            this.postfix     = args.postfix;
            break;
        case IdentType.REDUCER:
            this.templateNum = args.templateNum;
            this.postfix     = args.postfix;
            this.reduceFunc  = args.reduceFunc;
            break;
        default:
            throw new Error("oops! Not supported identifier type: " + type);
        }
    }
}

exports = module.exports = Identifier;