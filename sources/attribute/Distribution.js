/**
 * ==========================
 * @description Probability distribution F: (-inf, +inf) -> [0, 1]. Must be piecewise continuous.
 * ==========================
 *
 * @author  Evgeny Savelyev
 * @since   17.01.18
 * @version 1.0.0
 * @license See the LICENCE file in the project root.
 */

"use strict";

/* TODO finish implementation. (How to use it?) */

/**
 * @class
 * @classdesc Probability distribution F: (-inf, +inf) -> [0, 1]. Must be piecewise continuous.
 *
 * @property {function(number):number} func probability distribution piecewise continuous function F: (-inf, +inf) -> [0, 1]. Allowed to be defined on subset of real numbers, according to domain.
 * @property {Domain} domain definition of intervals of determination of the function.
 */
class Distribution {
    constructor(func, domain) {
        this.func   = func;
        this.domain = domain;
    }
}

exports = module.exports = Distribution;