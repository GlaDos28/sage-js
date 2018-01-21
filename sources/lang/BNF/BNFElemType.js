/**
 * ==========================
 * @description BNF element type list.
 * ==========================
 *
 * @author  Evgeny Savelyev
 * @since   21.01.18
 * @version 1.0.0
 * @licence See the LICENCE file in the project root.
 */

"use strict";

const BNFElemType = Object.freeze({
    TERMINAL      : 1,
    NONTERMINAL   : 2,
    SEMANTIC_RULE : 3
});

exports = module.exports = BNFElemType;