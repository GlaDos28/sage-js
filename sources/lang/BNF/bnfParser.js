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

const BNF                = require("./BNF");
const BacktrackingParser = require("../backtracking/BacktrackingParser");

/* BNF in string form */

const bnfBnfString = `
BNF               -> {
    data.bnf   = new BNF();
    data.ntMap = new Map();
    data.getNT = (name) => {
        if (!data.ntMap.has(name)) data.ntMap.set(name, data.bnf.addNonterminal(name));
        return data.ntMap.get(name);
    \\};
    data.getT = (str) => {
        return data.bnf.addTerminal(str, "\\"" + str + "\\"");
    \\};
    data.getSR = (code) => {
        return data.bnf.addSemanticRule(code, "code");
    \\};
}                    Productions { data.output = data.bnf; }
$Productions      -> Production Productions'
$Productions'     -> WSsNoNewline \\n WSs Production Productions'
                   | e
Production        -> UnWS {data.token = ""; } Nonterminal -> { data.prodElem = data.getNT(data.token); } Rules
UnWS              -> $ { data.autoWS = false; } | e { data.autoWS = true; }
$Rules            -> Rule Rules'
$Rules'           -> WSs \\| WSs Rule Rules'
                   | e
Rule              -> { data.prodList = []; } Elements { data.bnf.addProduction(data.prodElem, data.prodList, data.autoWS); }
                   | \\e { data.bnf.addProduction(data.prodElem, [], false); }
$Elements         -> Element Elements'
$Elements'        -> WSsNoNewline Element Elements'
                   | e
$Element          -> WSsNoNewline { data.token = ""; } Terminal     { data.prodList.push(data.getT(data.token));  }
                   | WSsNoNewline { data.token = ""; } Nonterminal  { data.prodList.push(data.getNT(data.token)); }
                   | WSsNoNewline { data.token = ""; } SemanticRule { data.prodList.push(data.getSR(data.token)); }
$Terminal         -> TerminalSymbol Terminal'
$Terminal'        -> TerminalSymbol Terminal'
                   | \\e Terminal'
                   | e
$Nonterminal      -> BigLetter Ident' Primes
$SemanticRule     -> \\{ Code }
$Code             -> CodeSymbol Code
                   | e
$Ident'           -> Letter    Ident'
                   | BigLetter Ident'
                   | Digit     Ident'
                   | _         Ident'
                   | e

$Letter           -> a | b | c | d | e | f | g | h | i | j | k | l | m | n | o | p | q | r | s | t | u | v | w | x | y | z
$LetterNoE        -> a | b | c | d     | f | g | h | i | j | k | l | m | n | o | p | q | r | s | t | u | v | w | x | y | z
$BigLetter        -> A | B | C | D | E | F | G | H | I | J | K | L | M | N | O | P | Q | R | S | T | U | V | W | X | Y | Z
$Digit            -> 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 
$CommonSpecSymbol -> ! | @ | # | № | $ | % | ^ | & | * | ( | ) | - | _ | = | + | [ | ] | ; | : | ' | " | , | . | < | > | / | ? | \` | ~
$TerminalSymbol   -> LetterNoE | \\\\ TerminalSymbol' | Digit | CommonSpecSymbol | }
$TerminalSymbol'  -> BigLetter | \\\\ | \\{ | \\| | \\e | s | t | n
$CodeSymbol       -> Letter | BigLetter | Digit | WS | \\\\ CodeSymbol' | CommonSpecSymbol | \\{ | \\|
$CodeSymbol'      -> \\\\ | }
$WS               -> \\s | \\t | \\n
$WSs              -> WS WSs | e
$Primes           -> ' Primes | e
$WSNoNewline      -> \\s | \\t
$WSsNoNewline     -> WSNoNewline WSsNoNewline | e`;

/* BNF class instance */

// util (start)

function getList(initValue, capValue, getter = (index) => index, incAmount = 1) {
    const list = [];

    for (let i = initValue; i <= capValue; i += incAmount) {
        list.push(getter(i));
    }

    return list;
}

const letterSelection           = getList("a".charCodeAt(0), "z".charCodeAt(0), (index) => String.fromCharCode(index));
const letterNoESelection        = getList("a".charCodeAt(0), "z".charCodeAt(0), (index) => String.fromCharCode(index)).filter((symbol) => symbol !== "e");
const bigLetterSelection        = getList("A".charCodeAt(0), "Z".charCodeAt(0), (index) => String.fromCharCode(index));
const digitSelection            = getList("0".charCodeAt(0), "9".charCodeAt(0), (index) => String.fromCharCode(index));
const commonSpecSymbolSelection = ["!", "@", "#", "№", "$", "%", "^", "&", "*", "(", ")", "-", "_", "=", "+", "[", "]", ";", ":", "'", "\"", ",", ".", "<", ">", "/", "?", "`", "~"];
const wsSelection               = [" ", "\t", "\n"];
const wsNoNewlineSelection      = [" ", "\t"];

// util (end)

const bnfBnf = new BNF();

const bnf              = bnfBnf.addNonterminal("BNF");
const productions      = bnfBnf.addNonterminal("Productions");
const productionsP     = bnfBnf.addNonterminal("Produnctions'");
const production       = bnfBnf.addNonterminal("Production");
const unWS             = bnfBnf.addNonterminal("UnWS");
const rules            = bnfBnf.addNonterminal("Rules");
const rulesP           = bnfBnf.addNonterminal("Rules'");
const rule             = bnfBnf.addNonterminal("Rule");
const elements         = bnfBnf.addNonterminal("Elements");
const elementsP        = bnfBnf.addNonterminal("Elements'");
const element          = bnfBnf.addNonterminal("Element");
const terminal         = bnfBnf.addNonterminal("Terminal");
const terminalP        = bnfBnf.addNonterminal("Terminal'");
const nonterminal      = bnfBnf.addNonterminal("Nonterminal");
const semanticRule     = bnfBnf.addNonterminal("SemanticRule");
const code             = bnfBnf.addNonterminal("Code");
const identP           = bnfBnf.addNonterminal("Ident'");
const wss              = bnfBnf.addNonterminal("WSs");
const wssNoNewline     = bnfBnf.addNonterminal("WSsNoNewline");

const letter           = bnfBnf.addTerminalSelection(letterSelection,           (data) => { data.token += data.__token__; }, "Letter");
const letterNoE        = bnfBnf.addTerminalSelection(letterNoESelection,        (data) => { data.token += data.__token__; }, "LetterNoE");
const bigLetter        = bnfBnf.addTerminalSelection(bigLetterSelection,        (data) => { data.token += data.__token__; }, "BigLetter");
const digit            = bnfBnf.addTerminalSelection(digitSelection,            (data) => { data.token += data.__token__; }, "Digit");
const commonSpecSymbol = bnfBnf.addTerminalSelection(commonSpecSymbolSelection, (data) => { data.token += data.__token__; }, "CommonSpecSymbol");
const ws               = bnfBnf.addTerminalSelection(wsSelection,               (data) => { data.token += data.__token__; }, "WS");
const wsNoNewline      = bnfBnf.addTerminalSelection(wsNoNewlineSelection,      (data) => { data.token += data.__token__; }, "WSNoNewline");

const terminalSymbol   = bnfBnf.addNonterminal("TerminalSymbol");
const terminalSymbolP  = bnfBnf.addNonterminal("TerminalSymbol'");
const codeSymbol       = bnfBnf.addNonterminal("CodeSymbol");
const codeSymbolP      = bnfBnf.addNonterminal("CodeSymbol'");
const primes           = bnfBnf.addNonterminal("Primes");

const specTerminal1  = bnfBnf.addTerminal("\\");
const specTerminal2  = bnfBnf.addTerminalWithSR("{",  (data) => { data.token += "{";  });
const specTerminal3  = bnfBnf.addTerminalWithSR("}",  (data) => { data.token += "}";  });
const specTerminal4  = bnfBnf.addTerminalWithSR("|",  (data) => { data.token += "|";  });
const specTerminal5  = bnfBnf.addTerminalWithSR("e",  (data) => { data.token += "e";  });
const specTerminal6  = bnfBnf.addTerminalWithSR("s",  (data) => { data.token += "s";  });
const specTerminal7  = bnfBnf.addTerminalWithSR("t",  (data) => { data.token += "t";  });
const specTerminal8  = bnfBnf.addTerminalWithSR("n",  (data) => { data.token += "n";  });
const specTerminal9  = bnfBnf.addTerminalWithSR("_",  (data) => { data.token += "_";  });
const specTerminal10 = bnfBnf.addTerminal("->");
const specTerminal11 = bnfBnf.addTerminalWithSR("'",  (data) => { data.token += "'";  });
const specTerminal12 = bnfBnf.addTerminalWithSR("\n", (data) => { data.token += "\n"; });
const specTerminal13 = bnfBnf.addTerminal("$");

const sr1 = bnfBnf.addSemanticRule((data) => {
    data.bnf   = new BNF();
    data.ntMap = new Map();
    data.getNT = (name) => {
        if (!data.ntMap.has(name)) {
            data.ntMap.set(name, data.bnf.addNonterminal(name));
        }

        return data.ntMap.get(name);
    };
    data.getT = (tStr) => data.bnf.addTerminal(tStr, `"${tStr}"`);
    data.getSR = (srCode) => data.bnf.addSemanticRule(eval(`(data) => ${srCode}`), `${srCode}`);
});
const sr2  = bnfBnf.addSemanticRule((data) => {
    data.prodElem = data.getNT(data.token);
});
const sr3  = bnfBnf.addSemanticRule((data) => {
    data.prodList = [];
});
const sr4  = bnfBnf.addSemanticRule((data) => {
    data.bnf.addProduction(data.prodElem, data.prodList, data.autoWS);
});
const sr5  = bnfBnf.addSemanticRule((data) => {
    data.token = "";
});
const sr6  = bnfBnf.addSemanticRule((data) => {
    data.prodList.push(data.getT(data.token));
});
const sr7  = bnfBnf.addSemanticRule((data) => {
    data.prodList.push(data.getNT(data.token));
});
const sr8  = bnfBnf.addSemanticRule((data) => {
    data.prodList.push(data.getSR(data.token));
});
const sr9  = bnfBnf.addSemanticRule((data) => {
    data.autoWS = false;
});
const sr10 = bnfBnf.addSemanticRule((data) => {
    data.autoWS = true;
});
const sr11 = bnfBnf.addSemanticRule((data) => {
    data.token += "\\";
});
const sr12 = bnfBnf.addSemanticRule((data) => {
    data.output = data.bnf;
});
const sr13 = bnfBnf.addSemanticRule((data) => {
    data.bnf.addProduction(data.prodElem, [], false);
});

bnfBnf.addProduction(bnf,          [sr1, productions, sr12]);
bnfBnf.addProduction(productions,  [production, productionsP],                                    false);
bnfBnf.addProduction(productionsP, [wssNoNewline, specTerminal12, wss, production, productionsP], false);
bnfBnf.addProduction(productionsP, [],                                                            false);
bnfBnf.addProduction(production,   [unWS, sr5, nonterminal, specTerminal10, sr2, rules]);
bnfBnf.addProduction(unWS,         [specTerminal13, sr9]);
bnfBnf.addProduction(unWS,         [sr10]);
bnfBnf.addProduction(rules,        [rule, rulesP],                                                false);
bnfBnf.addProduction(rulesP,       [wss, specTerminal4, wss, rule, rulesP],                       false);
bnfBnf.addProduction(rulesP,       [],                                                            false);
bnfBnf.addProduction(rule,         [sr3, elements, sr4]);
bnfBnf.addProduction(rule,         [specTerminal5, sr13]);
bnfBnf.addProduction(elements,     [element, elementsP],                                          false);
bnfBnf.addProduction(elementsP,    [wssNoNewline, element, elementsP],                            false);
bnfBnf.addProduction(elementsP,    [],                                                            false);
bnfBnf.addProduction(element,      [sr5, wssNoNewline, terminal,     sr6],                        false);
bnfBnf.addProduction(element,      [sr5, wssNoNewline, nonterminal,  sr7],                        false);
bnfBnf.addProduction(element,      [sr5, wssNoNewline, semanticRule, sr8],                        false);

bnfBnf.addProduction(terminal,     [terminalSymbol, terminalP],          false);
bnfBnf.addProduction(terminalP,    [terminalSymbol, terminalP],          false);
bnfBnf.addProduction(terminalP,    [specTerminal5, terminalP],           false);
bnfBnf.addProduction(terminalP,    [],                                   false);
bnfBnf.addProduction(nonterminal,  [bigLetter, identP, primes],          false);
bnfBnf.addProduction(semanticRule, [specTerminal2, code, specTerminal3], false);
bnfBnf.addProduction(code,         [codeSymbol, code],                   false);
bnfBnf.addProduction(code,         [],                                   false);
bnfBnf.addProduction(identP,       [letter, identP],                     false);
bnfBnf.addProduction(identP,       [bigLetter, identP],                  false);
bnfBnf.addProduction(identP,       [digit, identP],                      false);
bnfBnf.addProduction(identP,       [specTerminal9, identP],              false);
bnfBnf.addProduction(identP,       [],                                   false);

bnfBnf.addProduction(terminalSymbol, [letterNoE],                      false);
bnfBnf.addProduction(terminalSymbol, [specTerminal1, terminalSymbolP], false);
bnfBnf.addProduction(terminalSymbol, [digit],                          false);
bnfBnf.addProduction(terminalSymbol, [commonSpecSymbol],               false);
bnfBnf.addProduction(terminalSymbol, [specTerminal3],                  false);

bnfBnf.addProduction(terminalSymbolP, [bigLetter],           false);
bnfBnf.addProduction(terminalSymbolP, [specTerminal1, sr11], false);
bnfBnf.addProduction(terminalSymbolP, [specTerminal2],       false);
bnfBnf.addProduction(terminalSymbolP, [specTerminal4],       false);
bnfBnf.addProduction(terminalSymbolP, [specTerminal5],       false);
bnfBnf.addProduction(terminalSymbolP, [specTerminal6],       false);
bnfBnf.addProduction(terminalSymbolP, [specTerminal7],       false);
bnfBnf.addProduction(terminalSymbolP, [specTerminal8],       false);

bnfBnf.addProduction(codeSymbol, [letter],                     false);
bnfBnf.addProduction(codeSymbol, [bigLetter],                  false);
bnfBnf.addProduction(codeSymbol, [digit],                      false);
bnfBnf.addProduction(codeSymbol, [ws],                         false);
bnfBnf.addProduction(codeSymbol, [specTerminal1, codeSymbolP], false);
bnfBnf.addProduction(codeSymbol, [commonSpecSymbol],           false);
bnfBnf.addProduction(codeSymbol, [specTerminal2],              false);
bnfBnf.addProduction(codeSymbol, [specTerminal4],              false);

bnfBnf.addProduction(codeSymbolP, [specTerminal1, sr11], false);
bnfBnf.addProduction(codeSymbolP, [specTerminal3],       false);

bnfBnf.addProduction(wss, [ws, wss], false);
bnfBnf.addProduction(wss, [],        false);

bnfBnf.addProduction(wssNoNewline, [wsNoNewline, wssNoNewline], false);
bnfBnf.addProduction(wssNoNewline, [],                          false);

bnfBnf.addProduction(primes, [specTerminal11, primes], false);
bnfBnf.addProduction(primes, [],                       false);

/* BNF parser */

/**
 * @desc BNF parser as a parser instance which parses BNF text into BNF class instance.
 *
 * @type {Parser}
 */
const bnfParser = BacktrackingParser.getBacktrackingParser(bnfBnf);

exports = module.exports = {
    parser       : bnfParser,
    bnfBNFString : bnfBnfString
};