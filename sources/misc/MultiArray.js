/**
 * ==========================
 * @description Array with multiple indexes. Allows adding and getting values by given array of indexes.
 * ==========================
 *
 * @author Evgeny Savelyev
 * @since   19.01.17
 * @version 1.0.0
 * @licence See the LICENCE file in the project root.
 */

"use strict";

/**
 * @class
 * @classdesc Array with multiple indexes. Allows adding and getting tvalues by given array of indexes.
 *
 * @property {int} indexNum number of indexes
 * @property {object} array multi-index array data
 */
class MultiArray {
    constructor(indexNum) {
        if (indexNum === 0) {
            throw new Error("can not create multi-array with zero index number");
        }

        this.array    = [];
        this.indexNum = indexNum;
    }

    getValue(indexValues) {
        let buf = this.array;

        for (let i = 0; i < this.indexNum; i += 1) {
            if (buf.length <= indexValues[i]) {
                return null;
            }

            buf = buf[indexValues[i]];
        }

        return buf;
    }

    putValue(indexValues, value) {
        if (indexValues.length !== this.indexNum) {
            throw new Error(`expected ${this.indexNum} indexes instead of ${indexValues.length}`);
        }

        let buf = this.array;

        for (let i = 0; i < this.indexNum - 1; i += 1) {
            for (let j = buf.length; j <= indexValues[i]; j += 1) {
                buf.push([]);
            }

            buf = buf[indexValues[i]];
        }

        for (let j = buf.length; j <= indexValues[this.indexNum - 1]; j += 1) {
            buf.push(null);
        }

        buf[indexValues[this.indexNum - 1]] = value;
    }
}

exports = module.exports = MultiArray;