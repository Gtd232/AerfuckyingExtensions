/**
 * @fileoverview
 * Object representing a Scratch variable.
 */

/**
 * @fileoverview UID generator, from Blockly.
 */

/**
 * Legal characters for the unique ID.
 * Should be all on a US keyboard.  No XML special characters or control codes.
 * Removed $ due to issue 251.
 * @private
 */
 const soup_ = '!#%()*+,-./:;=?@[]^_`{|}~' +
 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

/**
* Generate a unique ID, from Blockly.  This should be globally unique.
* 87 characters ^ 20 length > 128 bits (better than a UUID).
* @return {string} A globally unique ID string.
*/
const uid = function () {
 const length = 20;
 const soupLength = soup_.length;
 const id = [];
 for (let i = 0; i < length; i++) {
     id[i] = soup_.charAt(Math.random() * soupLength);
 }
 return id.join('');
};


const minilog = require('minilog');
minilog.enable();

module.exports = minilog('vm');


/**
 * Escape a string to be safe to use in XML content.
 * CC-BY-SA: hgoebl
 * https://stackoverflow.com/questions/7918868/
 * how-to-escape-xml-entities-in-javascript
 * @param {!string | !Array.<string>} unsafe Unsafe string.
 * @return {string} XML-escaped string, for use within an XML tag.
 */
const xmlEscape = function (unsafe) {
    if (typeof unsafe !== 'string') {
        if (Array.isArray(unsafe)) {
            // This happens when we have hacked blocks from 2.0
            // See #1030
            unsafe = String(unsafe);
        } else {
            log.error('Unexpected input recieved in replaceUnsafeChars');
            return unsafe;
        }
    }
    return unsafe.replace(/[<>&'"]/g, c => {
        switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case '\'': return '&apos;';
        case '"': return '&quot;';
        }
    });
};



 
 class Variable {
     /**
      * @param {string} id Id of the variable.
      * @param {string} name Name of the variable.
      * @param {string} type Type of the variable, one of '' or 'list'
      * @param {boolean} isCloud Whether the variable is stored in the cloud.
      * @constructor
      */
     constructor (id, name, type, isCloud) {
         this.id = id || uid();
         this.name = name;
         this.type = type;
         this.isCloud = isCloud;
         switch (this.type) {
         case Variable.SCALAR_TYPE:
             this.value = 0;
             break;
         case Variable.LIST_TYPE:
             this.value = [];
             break;
         case Variable.BROADCAST_MESSAGE_TYPE:
             this.value = this.name;
             break;
         default:
             throw new Error(`Invalid variable type: ${this.type}`);
         }
     }
 
     toXML (isLocal) {
         isLocal = (isLocal === true);
         return `<variable type="${this.type}" id="${this.id}" islocal="${isLocal
         }" iscloud="${this.isCloud}">${xmlEscape(this.name)}</variable>`;
     }
 
     /**
      * Type representation for scalar variables.
      * This is currently represented as ''
      * for compatibility with blockly.
      * @const {string}
      */
     static get SCALAR_TYPE () {
         return '';
     }
 
     /**
      * Type representation for list variables.
      * @const {string}
      */
     static get LIST_TYPE () {
         return 'list';
     }
 
     /**
      * Type representation for list variables.
      * @const {string}
      */
     static get BROADCAST_MESSAGE_TYPE () {
         return 'broadcast_msg';
     }
 }
 

 
/**
 * Block argument types
 * @enum {string}
 */
 const ArgumentType = {
    /**
     * Numeric value with angle picker
     */
    ANGLE: 'angle',

    /**
     * Boolean value with hexagonal placeholder
     */
    BOOLEAN: 'Boolean',

    /**
     * Numeric value with color picker
     */
    COLOR: 'color',

    /**
     * Numeric value with text field
     */
    NUMBER: 'number',

    /**
     * String value with text field
     */
    STRING: 'string',

    /**
     * String value with matrix field
     */
    MATRIX: 'matrix',

    /**
     * MIDI note number with note picker (piano) field
     */
    NOTE: 'note',

    /**
     * Inline image on block (as part of the label)
     */
    IMAGE: 'image'
};


/**
 * Types of block
 * @enum {string}
 */
 const BlockType = {
    /**
     * Boolean reporter with hexagonal shape
     */
    BOOLEAN: 'Boolean',

    /**
     * A button (not an actual block) for some special action, like making a variable
     */
    BUTTON: 'button',

    /**
     * Command block
     */
    COMMAND: 'command',

    /**
     * Specialized command block which may or may not run a child branch
     * The thread continues with the next block whether or not a child branch ran.
     */
    CONDITIONAL: 'conditional',

    /**
     * Specialized hat block with no implementation function
     * This stack only runs if the corresponding event is emitted by other code.
     */
    EVENT: 'event',

    /**
     * Hat block which conditionally starts a block stack
     */
    HAT: 'hat',

    /**
     * Specialized command block which may or may not run a child branch
     * If a child branch runs, the thread evaluates the loop block again.
     */
    LOOP: 'loop',

    /**
     * General reporter with numeric or string value
     */
    REPORTER: 'reporter'
};



class Color {
    /**
     * @typedef {object} RGBObject - An object representing a color in RGB format.
     * @property {number} r - the red component, in the range [0, 255].
     * @property {number} g - the green component, in the range [0, 255].
     * @property {number} b - the blue component, in the range [0, 255].
     */

    /**
     * @typedef {object} HSVObject - An object representing a color in HSV format.
     * @property {number} h - hue, in the range [0-359).
     * @property {number} s - saturation, in the range [0,1].
     * @property {number} v - value, in the range [0,1].
     */

    /** @type {RGBObject} */
    static get RGB_BLACK () {
        return {r: 0, g: 0, b: 0};
    }

    /** @type {RGBObject} */
    static get RGB_WHITE () {
        return {r: 255, g: 255, b: 255};
    }

    /**
     * Convert a Scratch decimal color to a hex string, #RRGGBB.
     * @param {number} decimal RGB color as a decimal.
     * @return {string} RGB color as #RRGGBB hex string.
     */
    static decimalToHex (decimal) {
        if (decimal < 0) {
            decimal += 0xFFFFFF + 1;
        }
        let hex = Number(decimal).toString(16);
        hex = `#${'000000'.substr(0, 6 - hex.length)}${hex}`;
        return hex;
    }

    /**
     * Convert a Scratch decimal color to an RGB color object.
     * @param {number} decimal RGB color as decimal.
     * @return {RGBObject} rgb - {r: red [0,255], g: green [0,255], b: blue [0,255]}.
     */
    static decimalToRgb (decimal) {
        const a = (decimal >> 24) & 0xFF;
        const r = (decimal >> 16) & 0xFF;
        const g = (decimal >> 8) & 0xFF;
        const b = decimal & 0xFF;
        return {r: r, g: g, b: b, a: a > 0 ? a : 255};
    }

    /**
     * Convert a hex color (e.g., F00, #03F, #0033FF) to an RGB color object.
     * CC-BY-SA Tim Down:
     * https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
     * @param {!string} hex Hex representation of the color.
     * @return {RGBObject} null on failure, or rgb: {r: red [0,255], g: green [0,255], b: blue [0,255]}.
     */
    static hexToRgb (hex) {
        const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    /**
     * Convert an RGB color object to a hex color.
     * @param {RGBObject} rgb - {r: red [0,255], g: green [0,255], b: blue [0,255]}.
     * @return {!string} Hex representation of the color.
     */
    static rgbToHex (rgb) {
        return Color.decimalToHex(Color.rgbToDecimal(rgb));
    }

    /**
     * Convert an RGB color object to a Scratch decimal color.
     * @param {RGBObject} rgb - {r: red [0,255], g: green [0,255], b: blue [0,255]}.
     * @return {!number} Number representing the color.
     */
    static rgbToDecimal (rgb) {
        return (rgb.r << 16) + (rgb.g << 8) + rgb.b;
    }

    /**
    * Convert a hex color (e.g., F00, #03F, #0033FF) to a decimal color number.
    * @param {!string} hex Hex representation of the color.
    * @return {!number} Number representing the color.
    */
    static hexToDecimal (hex) {
        return Color.rgbToDecimal(Color.hexToRgb(hex));
    }

    /**
     * Convert an HSV color to RGB format.
     * @param {HSVObject} hsv - {h: hue [0,360), s: saturation [0,1], v: value [0,1]}
     * @return {RGBObject} rgb - {r: red [0,255], g: green [0,255], b: blue [0,255]}.
     */
    static hsvToRgb (hsv) {
        let h = hsv.h % 360;
        if (h < 0) h += 360;
        const s = Math.max(0, Math.min(hsv.s, 1));
        const v = Math.max(0, Math.min(hsv.v, 1));

        const i = Math.floor(h / 60);
        const f = (h / 60) - i;
        const p = v * (1 - s);
        const q = v * (1 - (s * f));
        const t = v * (1 - (s * (1 - f)));

        let r;
        let g;
        let b;

        switch (i) {
        default:
        case 0:
            r = v;
            g = t;
            b = p;
            break;
        case 1:
            r = q;
            g = v;
            b = p;
            break;
        case 2:
            r = p;
            g = v;
            b = t;
            break;
        case 3:
            r = p;
            g = q;
            b = v;
            break;
        case 4:
            r = t;
            g = p;
            b = v;
            break;
        case 5:
            r = v;
            g = p;
            b = q;
            break;
        }

        return {
            r: Math.floor(r * 255),
            g: Math.floor(g * 255),
            b: Math.floor(b * 255)
        };
    }

    /**
     * Convert an RGB color to HSV format.
     * @param {RGBObject} rgb - {r: red [0,255], g: green [0,255], b: blue [0,255]}.
     * @return {HSVObject} hsv - {h: hue [0,360), s: saturation [0,1], v: value [0,1]}
     */
    static rgbToHsv (rgb) {
        const r = rgb.r / 255;
        const g = rgb.g / 255;
        const b = rgb.b / 255;
        const x = Math.min(Math.min(r, g), b);
        const v = Math.max(Math.max(r, g), b);

        // For grays, hue will be arbitrarily reported as zero. Otherwise, calculate
        let h = 0;
        let s = 0;
        if (x !== v) {
            const f = (r === x) ? g - b : ((g === x) ? b - r : r - g);
            const i = (r === x) ? 3 : ((g === x) ? 5 : 1);
            h = ((i - (f / (v - x))) * 60) % 360;
            s = (v - x) / v;
        }

        return {h: h, s: s, v: v};
    }

    /**
     * Linear interpolation between rgb0 and rgb1.
     * @param {RGBObject} rgb0 - the color corresponding to fraction1 <= 0.
     * @param {RGBObject} rgb1 - the color corresponding to fraction1 >= 1.
     * @param {number} fraction1 - the interpolation parameter. If this is 0.5, for example, mix the two colors equally.
     * @return {RGBObject} the interpolated color.
     */
    static mixRgb (rgb0, rgb1, fraction1) {
        if (fraction1 <= 0) return rgb0;
        if (fraction1 >= 1) return rgb1;
        const fraction0 = 1 - fraction1;
        return {
            r: (fraction0 * rgb0.r) + (fraction1 * rgb1.r),
            g: (fraction0 * rgb0.g) + (fraction1 * rgb1.g),
            b: (fraction0 * rgb0.b) + (fraction1 * rgb1.b)
        };
    }
}




/**
 * @fileoverview
 * Utilities for casting and comparing Scratch data-types.
 * Scratch behaves slightly differently from JavaScript in many respects,
 * and these differences should be encapsulated below.
 * For example, in Scratch, add(1, join("hello", world")) -> 1.
 * This is because "hello world" is cast to 0.
 * In JavaScript, 1 + Number("hello" + "world") would give you NaN.
 * Use when coercing a value before computation.
 */

class Cast {
    /**
     * Scratch cast to number.
     * Treats NaN as 0.
     * In Scratch 2.0, this is captured by `interp.numArg.`
     * @param {*} value Value to cast to number.
     * @return {number} The Scratch-casted number value.
     */
    static toNumber (value) {
        // If value is already a number we don't need to coerce it with
        // Number().
        if (typeof value === 'number') {
            // Scratch treats NaN as 0, when needed as a number.
            // E.g., 0 + NaN -> 0.
            if (Number.isNaN(value)) {
                return 0;
            }
            return value;
        }
        const n = Number(value);
        if (Number.isNaN(n)) {
            // Scratch treats NaN as 0, when needed as a number.
            // E.g., 0 + NaN -> 0.
            return 0;
        }
        return n;
    }

    /**
     * Scratch cast to boolean.
     * In Scratch 2.0, this is captured by `interp.boolArg.`
     * Treats some string values differently from JavaScript.
     * @param {*} value Value to cast to boolean.
     * @return {boolean} The Scratch-casted boolean value.
     */
    static toBoolean (value) {
        // Already a boolean?
        if (typeof value === 'boolean') {
            return value;
        }
        if (typeof value === 'string') {
            // These specific strings are treated as false in Scratch.
            if ((value === '') ||
                (value === '0') ||
                (value.toLowerCase() === 'false')) {
                return false;
            }
            // All other strings treated as true.
            return true;
        }
        // Coerce other values and numbers.
        return Boolean(value);
    }

    /**
     * Scratch cast to string.
     * @param {*} value Value to cast to string.
     * @return {string} The Scratch-casted string value.
     */
    static toString (value) {
        return String(value);
    }

    /**
     * Cast any Scratch argument to an RGB color array to be used for the renderer.
     * @param {*} value Value to convert to RGB color array.
     * @return {Array.<number>} [r,g,b], values between 0-255.
     */
    static toRgbColorList (value) {
        const color = Cast.toRgbColorObject(value);
        return [color.r, color.g, color.b];
    }

    /**
     * Cast any Scratch argument to an RGB color object to be used for the renderer.
     * @param {*} value Value to convert to RGB color object.
     * @return {RGBOject} [r,g,b], values between 0-255.
     */
    static toRgbColorObject (value) {
        let color;
        if (typeof value === 'string' && value.substring(0, 1) === '#') {
            color = Color.hexToRgb(value);

            // If the color wasn't *actually* a hex color, cast to black
            if (!color) color = {r: 0, g: 0, b: 0, a: 255};
        } else {
            color = Color.decimalToRgb(Cast.toNumber(value));
        }
        return color;
    }

    /**
     * Determine if a Scratch argument is a white space string (or null / empty).
     * @param {*} val value to check.
     * @return {boolean} True if the argument is all white spaces or null / empty.
     */
    static isWhiteSpace (val) {
        return val === null || (typeof val === 'string' && val.trim().length === 0);
    }

    /**
     * Compare two values, using Scratch cast, case-insensitive string compare, etc.
     * In Scratch 2.0, this is captured by `interp.compare.`
     * @param {*} v1 First value to compare.
     * @param {*} v2 Second value to compare.
     * @returns {number} Negative number if v1 < v2; 0 if equal; positive otherwise.
     */
    static compare (v1, v2) {
        let n1 = Number(v1);
        let n2 = Number(v2);
        if (n1 === 0 && Cast.isWhiteSpace(v1)) {
            n1 = NaN;
        } else if (n2 === 0 && Cast.isWhiteSpace(v2)) {
            n2 = NaN;
        }
        if (isNaN(n1) || isNaN(n2)) {
            // At least one argument can't be converted to a number.
            // Scratch compares strings as case insensitive.
            const s1 = String(v1).toLowerCase();
            const s2 = String(v2).toLowerCase();
            if (s1 < s2) {
                return -1;
            } else if (s1 > s2) {
                return 1;
            }
            return 0;
        }
        // Handle the special case of Infinity
        if (
            (n1 === Infinity && n2 === Infinity) ||
            (n1 === -Infinity && n2 === -Infinity)
        ) {
            return 0;
        }
        // Compare as numbers.
        return n1 - n2;
    }

    /**
     * Determine if a Scratch argument number represents a round integer.
     * @param {*} val Value to check.
     * @return {boolean} True if number looks like an integer.
     */
    static isInt (val) {
        // Values that are already numbers.
        if (typeof val === 'number') {
            if (isNaN(val)) { // NaN is considered an integer.
                return true;
            }
            // True if it's "round" (e.g., 2.0 and 2).
            return val === parseInt(val, 10);
        } else if (typeof val === 'boolean') {
            // `True` and `false` always represent integer after Scratch cast.
            return true;
        } else if (typeof val === 'string') {
            // If it contains a decimal point, don't consider it an int.
            return val.indexOf('.') < 0;
        }
        return false;
    }

    static get LIST_INVALID () {
        return 'INVALID';
    }

    static get LIST_ALL () {
        return 'ALL';
    }

    /**
     * Compute a 1-based index into a list, based on a Scratch argument.
     * Two special cases may be returned:
     * LIST_ALL: if the block is referring to all of the items in the list.
     * LIST_INVALID: if the index was invalid in any way.
     * @param {*} index Scratch arg, including 1-based numbers or special cases.
     * @param {number} length Length of the list.
     * @param {boolean} acceptAll Whether it should accept "all" or not.
     * @return {(number|string)} 1-based index for list, LIST_ALL, or LIST_INVALID.
     */
    static toListIndex (index, length, acceptAll) {
        if (typeof index !== 'number') {
            if (index === 'all') {
                return acceptAll ? Cast.LIST_ALL : Cast.LIST_INVALID;
            }
            if (index === 'last') {
                if (length > 0) {
                    return length;
                }
                return Cast.LIST_INVALID;
            } else if (index === 'random' || index === 'any') {
                if (length > 0) {
                    return 1 + Math.floor(Math.random() * length);
                }
                return Cast.LIST_INVALID;
            }
        }
        index = Math.floor(Cast.toNumber(index));
        if (index < 1 || index > length) {
            return Cast.LIST_INVALID;
        }
        return index;
    }
}




/**
 * Icon svg to be displayed at the left edge of each extension block, encoded as a data URI.
 * @type {string}
 */
// eslint-disable-next-line max-len
const blockIconURI = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSLlm77lsYJfMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeD0iMHB4IiB5PSIwcHgiCgkgdmlld0JveD0iMCAwIDEyOCAxMjgiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDEyOCAxMjg7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPHN0eWxlIHR5cGU9InRleHQvY3NzIj4KCS5zdDB7ZmlsbDojRkZGRkZGO30KPC9zdHlsZT4KPHBhdGggY2xhc3M9InN0MCIgZD0iTTEwNy4xLDU2LjVoLTYuOVYzNy44YzAtNS00LjQtOS40LTkuNC05LjRINzIuMXYtNy41QzcxLjUsMTQsNjUuOSw5LDU5LjYsOWMtNi45LDAtMTEuOSw1LTExLjksMTEuOXY2LjlIMjkKCWMtNS42LDAtMTAsNC40LTEwLDEwdjE4LjFoNi45QzMyLjgsNTUuOSwzOSw2MS41LDM5LDY5YzAsNi45LTUuNiwxMy4xLTEzLjEsMTMuMUgxOXYxOC4xYzAsNC40LDQuNCw4LjgsOS40LDguOGgxOC4xdi02LjkKCWMwLTYuOSw1LjYtMTMuMSwxMy4xLTEzLjFjNi45LDAsMTMuMSw1LjYsMTMuMSwxMy4xdjYuOWgxOC4xYzUsMCw5LjQtNC40LDkuNC05LjRWODAuOWg2LjljNi45LDAsMTEuOS01LDExLjktMTEuOQoJQzExOSw2MS41LDExNCw1Ni41LDEwNy4xLDU2LjV6IE02NS43LDgyLjNoLTUuNWMtMTAuMiwwLTE0LjctNS4yLTE1LjEtNS43bDYuOC02LjZjMC4xLDAuMSwyLjQsMi42LDguMywyLjZoMS4zCgljMywwLDYuMi0wLjQsNi4yLTIuMWMwLTEuOS01LjItMi44LTcuNy0zLjFjLTMuMS0wLjQtNi4zLTAuOS05LjEtMi4yYy0xLjgtMC45LTMuMy0yLjEtNC4zLTMuNmMtMS4yLTEuNy0xLjgtMy43LTEuOC01LjkKCWMwLTcuMiw3LjMtMTEuOSwxNy45LTExLjloMS44YzYuMiwwLDExLjMsMi41LDE1LjQsNy4ybC02LjcsNi41Yy0yLjItMi43LTQuOS0zLjktOC41LTMuOWgtMC40Yy0xLjksMC02LjItMC40LTYuMiwyLjEKCWMwLDEuOCw0LjksMi42LDcuNCwyLjljMy4xLDAuNCw2LjUsMSw5LjIsMi4yYzEuOCwwLjksMy4zLDIuMSw0LjQsMy43YzEuMSwxLjcsMS44LDMuOCwxLjgsNi4xQzgwLjksODAuNSw2OS42LDgyLjMsNjUuNyw4Mi4zeiIvPgo8L3N2Zz4=';
const menuIconURI = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSLlm77lsYJfMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeD0iMHB4IiB5PSIwcHgiCgkgdmlld0JveD0iMCAwIDEyOCAxMjgiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDEyOCAxMjg7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPHN0eWxlIHR5cGU9InRleHQvY3NzIj4KCS5zdDB7ZmlsbDojMTI5NmRiO30KPC9zdHlsZT4KPHBhdGggY2xhc3M9InN0MCIgZD0iTTEwNy4xLDU2LjVoLTYuOVYzNy44YzAtNS00LjQtOS40LTkuNC05LjRINzIuMXYtNy41QzcxLjUsMTQsNjUuOSw5LDU5LjYsOWMtNi45LDAtMTEuOSw1LTExLjksMTEuOXY2LjlIMjkKCWMtNS42LDAtMTAsNC40LTEwLDEwdjE4LjFoNi45QzMyLjgsNTUuOSwzOSw2MS41LDM5LDY5YzAsNi45LTUuNiwxMy4xLTEzLjEsMTMuMUgxOXYxOC4xYzAsNC40LDQuNCw4LjgsOS40LDguOGgxOC4xdi02LjkKCWMwLTYuOSw1LjYtMTMuMSwxMy4xLTEzLjFjNi45LDAsMTMuMSw1LjYsMTMuMSwxMy4xdjYuOWgxOC4xYzUsMCw5LjQtNC40LDkuNC05LjRWODAuOWg2LjljNi45LDAsMTEuOS01LDExLjktMTEuOQoJQzExOSw2MS41LDExNCw1Ni41LDEwNy4xLDU2LjV6IE02NS43LDgyLjNoLTUuNWMtMTAuMiwwLTE0LjctNS4yLTE1LjEtNS43bDYuOC02LjZjMC4xLDAuMSwyLjQsMi42LDguMywyLjZoMS4zCgljMywwLDYuMi0wLjQsNi4yLTIuMWMwLTEuOS01LjItMi44LTcuNy0zLjFjLTMuMS0wLjQtNi4zLTAuOS05LjEtMi4yYy0xLjgtMC45LTMuMy0yLjEtNC4zLTMuNmMtMS4yLTEuNy0xLjgtMy43LTEuOC01LjkKCWMwLTcuMiw3LjMtMTEuOSwxNy45LTExLjloMS44YzYuMiwwLDExLjMsMi41LDE1LjQsNy4ybC02LjcsNi41Yy0yLjItMi43LTQuOS0zLjktOC41LTMuOWgtMC40Yy0xLjksMC02LjItMC40LTYuMiwyLjEKCWMwLDEuOCw0LjksMi42LDcuNCwyLjljMy4xLDAuNCw2LjUsMSw5LjIsMi4yYzEuOCwwLjksMy4zLDIuMSw0LjQsMy43YzEuMSwxLjcsMS44LDMuOCwxLjgsNi4xQzgwLjksODAuNSw2OS42LDgyLjMsNjUuNyw4Mi4zeiIvPgo8L3N2Zz4=';

/**
 * Host for the Pen-related blocks in Scratch 3.0
 * @param {Runtime} runtime - the runtime instantiating this block package.
 * @constructor
 */
class Scratch3StringExtBlocks {
    constructor(runtime) {
        /**
         * The runtime instantiating this block package.
         * @type {Runtime}
         */
        this.runtime = runtime;
    }

    /**
     * @returns {object} metadata for this extension and its blocks.
     */
    getInfo() {
        return {
            id: 'stringExt',
            name: 'String Extension',
            blockIconURI: blockIconURI,
            menuIconURI: menuIconURI,
            blocks: [{
                    opcode: 'charCodeAt',
                    blockType: BlockType.REPORTER,
                    text: '[STRING]的第[INDEX]个字符的编码',
                    arguments: {
                        STRING: {
                            type: ArgumentType.STRING,
                            defaultValue: 'Hello'
                        },
                        INDEX: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 1
                        }
                    }
                },
                {
                    opcode: 'fromCharCode',
                    blockType: BlockType.REPORTER,
                    text: '编码[CODE]对应的字符',
                    arguments: {
                        CODE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 97
                        }
                    }
                },
                {
                    opcode: 'serializeToJson',
                    blockType: BlockType.REPORTER,
                    text: '将[PREFIX]开头的变量转换为JSON',
                    arguments: {
                        PREFIX: {
                            type: ArgumentType.STRING,
                            defaultValue: '.'
                        }
                    }
                },
                {
                    opcode: 'deserializeFromJson',
                    blockType: BlockType.COMMAND,
                    text: '将[PREFIX]开头的变量设为JSON[JSON]',
                    arguments: {
                        JSON: {
                            type: ArgumentType.STRING,
                            defaultValue: '{}'
                        },
                        PREFIX: {
                            type: ArgumentType.STRING,
                            defaultValue: '.'
                        }
                    }
                },
                {
                    opcode: 'postJson',
                    blockType: BlockType.COMMAND,
                    text: '发送JSON[JSON]到[URL]',
                    arguments: {
                        JSON: {
                            type: ArgumentType.STRING,
                            defaultValue: '{"action":"save","userId":1,readOnly:1,"key":"",value:[]}'
                        },
                        URL: {
                            type: ArgumentType.STRING,
                            menu: 'urlNames',
                            defaultValue: 'cloudSpace'
                        }
                    }
                },
                {
                    opcode: 'postResponse',
                    blockType: BlockType.REPORTER,
                    text: '发送JSON应答'
                }
            ],
            menus: {
                urlNames: {
                    acceptReporters: true,
                    items: [{
                        text: '云空间',
                        value: 'cloudSpace'
                    }]
                },
            }
        };
    }

    charCodeAt(args, util) {
        var str = args.STRING;
        var idx = args.INDEX;
        if (idx < 1 || idx > str.length) return NaN;
        return str.charCodeAt(idx - 1);
    };

    fromCharCode(args, util) {
        var code = args.CODE;
        return String.fromCharCode(code);
    };

    serializeToJson(args, util) {
        var extUtils = this.runtime.extUtils;
        extUtils.Alerter.info("serializeToJson即将废弃，改由js扩展中的相应指令替换。");
        var prefix = Cast.toString(args.PREFIX).trim();
        var jsonObj = {};
        var variables = util.target.variables;
        for (var varId in variables) {
            var variable = variables[varId];
            if (variable.type == Variable.SCALAR_TYPE || variable.type == Variable.LIST_TYPE) {
                if (variable.name.indexOf(prefix) == 0) {
                    jsonObj[variable.name.substr(prefix.length)] = variable.value;
                }
            }
        }
        return JSON.stringify(jsonObj);
    };

    deserializeFromJson(args, util) {
        var extUtils = this.runtime.extUtils;
        extUtils.Alerter.info("deserializeFromJson即将废弃，改由js扩展中的相应指令替换。");
        var prefix = Cast.toString(args.PREFIX).trim();
        var jsonStr = args.JSON;
        var jsonObj = null;
        try {
            jsonObj = JSON.parse(jsonStr);
        } catch (e) {}
        if (!jsonObj) return;
        var variables = util.target.variables;
        for (var varId in variables) {
            var variable = variables[varId];
            var varValue = null;
            if (variable.name.indexOf(prefix) == 0) {
                varValue = jsonObj[variable.name.substr(prefix.length)];
            }
            if (varValue == undefined) continue;
            if (variable.type == Variable.LIST_TYPE && Array.isArray(varValue)) {
                for (var i = 0; i < varValue.length; i++) {
                    if (varValue[i] == null) varValue[i] = '';
                }
                variable.value = varValue;
            } else if (variable.type == Variable.SCALAR_TYPE) {
                variable.value = String(varValue);
            }
        }
    };

    postJson(args, util) {
        var extUtils = this.runtime.extUtils;
        if (extUtils.detectAbnormalAction('POST_JSON')) return;
        extUtils.Alerter.info("postJson即将废弃，改由js扩展中的相应指令替换。");

        var jsonStr = Cast.toString(args.JSON);
        var url = Cast.toString(args.URL).trim();
        var urlMap = {
            cloudSpace: '/WebApi/Projects/CloudSpace'
        };
        url = urlMap[url];
        if (!url) {
            this._postResponse = {
                error: "invalid url"
            };
            return;
        }
        var postData = {};
        try {
            postData = JSON.parse(jsonStr);
        } catch (e) {
            this._postResponse = {
                error: "invalid json"
            };
            return;
        }
        return new Promise(resolve => {
            extUtils.ajax({
                url: url,
                loadingStyle: "none",
                hashStr: '',
                data: postData,
                type: "POST"
            }).done(r => {
                this._postResponse = r;
                resolve();
            }).error(r => {
                this._postResponse = {
                    error: "unexpected error"
                };
                resolve();
            });
        });
    }

    postResponse(args, util) {
        var extUtils = this.runtime.extUtils;
        extUtils.Alerter.info("postResponse即将废弃，改由js扩展中的相应指令替换。")
        return JSON.stringify(this._postResponse);
    };
}

module.exports = Scratch3StringExtBlocks;
