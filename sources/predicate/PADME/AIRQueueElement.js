/**
 * ==========================
 * @description Element of PADME queue for transforming PIR.
 * Each element consists of priority, and link to the attribute generating algorithm, from which one can retrieve transform function and predicate form requirements.
 * ==========================
 *
 * @author  Evgeny Savelyev
 * @since   19.02.18
 * @version 1.0.0
 * @licence See the LICENCE file in the project root.
 */

"use strict";

/**
 * @class
 * @classdesc Element of PADME queue for transforming PIR.
 * Each element consists of priority, and link to the attribute generating algorithm, from which one can retrieve transform function and predicate form requirements.
 *
 * @property {AGAlgorithm} agAlgorithm link to the attribute generation algorithm
 * @property {int} priority element priority for the queue
 */
class AIRQueueElement {
    constructor(agAlgorithm, priority) {
        this.agAlgorithm = agAlgorithm;
        this.priority    = priority;
    }
}

exports = module.exports = AIRQueueElement;