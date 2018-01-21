/**
 * ==========================
 * @description BNF parser as a parser instance which parses BNF text into BNF class instance.
 * ==========================
 *
 * @author  Evgeny Savelyev
 * @since   21.01.18
 * @version 1.0.0
 * @licence See the LICENCE file in the project root.
 */

"use strict";

const BNF        = require("./BNF");
const LL1Grammar = require("../LL1/LL1Grammar");

const bnfBnf = new BNF(); /* TODO */

/**
 * @desc BNF parser as a parser instance which parses BNF text into BNF class instance.
 *
 * @type {Parser}
 */
const bnfParser = new LL1Grammar(bnfBnf).getParser();

exports = module.exports = bnfParser;