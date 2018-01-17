/**
 * ==========================
 * @description constraint identifier type list.
 * ==========================
 *
 * @author  Evgeny Savelyev
 * @since   17.01.18
 * @version 1.0.0
 * @license See the LICENCE file in the project root.
 */

"use strict";

const IdentType = Object.freeze({
    BASIC     : 1,
    TEMPLATED : 2,
    REDUCER   : 3
});

exports = module.exports = IdentType;