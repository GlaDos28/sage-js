/**
 * ==========================
 * @description Entry point of the library.
 * ==========================
 *
 * @author  Evgeny Savelyev
 * @since   17.01.18
 * @version 1.0.0
 * @license See the LICENCE file in the project root.
 */

"use strict";

const ACN               = require("./sources/net/ACN");
const AttributeBuilder  = require("./sources/dsl/AttributeBuilder");
const ConstraintBuilder = require("./sources/dsl/ConstraintBuilder");

const net = new ACN();

/* Adding attributes */

net.addAttribute(new AttributeBuilder()
    .id("playerName")
    .type("str")
    .build());

net.addAttribute(new AttributeBuilder()
    .id("jumpHeight")
    .type("int")
    .build());

net.addAttribute(new AttributeBuilder()
    .id("jumpNum")
    .type("int")
    .build());

net.addAttribute(new AttributeBuilder()
    .id("monster[1].health")
    .type("int")
    .build());

net.addAttribute(new AttributeBuilder()
    .id("monster[1].armor")
    .type("int")
    .build());

net.addAttribute(new AttributeBuilder()
    .id("monster[2].health")
    .type("int")
    .build());

net.addAttribute(new AttributeBuilder()
    .id("monster[2].armor")
    .type("int")
    .build());

net.addAttribute(new AttributeBuilder()
    .id("monster[3].health")
    .type("int")
    .build());

net.addAttribute(new AttributeBuilder()
    .id("ammo[1].power")
    .type("int")
    .build());

net.addAttribute(new AttributeBuilder()
    .id("ammo[2].power")
    .type("int")
    .build());

/* Adding constant attributes */

net.addConstantAttribute("MAX_HEALTH",          100);
net.addConstantAttribute("monster[3].armor",    10);
net.addConstantAttribute("H/A_BALANCE_MAX_ABS", 200);

/* Adding constraints */

net.addConstraint(new ConstraintBuilder()
    .predicate("jumpHeight * jumpNum >= platformHeight")
    .basicIdent("ident-1", "jumpHeight")
    .basicIdent("ident-2", "jumpNum")
    .basicIdent("ident-3", "platformHeight")
    .build());

net.addConstraint(new ConstraintBuilder()
    .predicate("monster[i].health + monster[i].armor <= MAX_HEALTH")
    .template("template-1", "monster\\[[0123456789]+\\]")
    .templatedIdent("ident-1", "template-1", ".health")
    .templatedIdent("ident-2", "template-1", ".armor")
    .basicIdent("ident-3", "MAX_HEALTH")
    .build());

net.addConstraint(new ConstraintBuilder()
    .predicate("|totalMonsterHealth - totalAmmoPower| <= H/A_BALANCE_MAX_ABS")
    .template("template-1", "monster\\[[0123456789]+\\]")
    .template("template-2", "ammo\\[[0123456789]+\\]")
    .reducerIdent("ident-1", "template-1", ".health", "0, (acc, value) => acc + value")
    .reducerIdent("ident-2", "template-2", ".power", "0, (acc, value) => acc + value")
    .basicIdent("ident-3", "H/A_BALANCE_MAX_ABS")
    .build());

/* Output */

console.log(net.outPushingTrie(             "D:\\WebstormProjects\\sage-js\\pushing-trie-graph.png",         "D:\\Graphviz2.38\\bin"));
console.log(net.outAttributeConstraintGraph("D:\\WebstormProjects\\sage-js\\attribute-constraint-graph.png", "D:\\Graphviz2.38\\bin"));
console.log(net.outAttributeClusterGraph(   "D:\\WebstormProjects\\sage-js\\attribute-cluster-graph.png",    "D:\\Graphviz2.38\\bin"));

exports = module.exports = {};