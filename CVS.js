
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

class StageLayering {
    static get BACKGROUND_LAYER () {
        return 'background';
    }

    static get VIDEO_LAYER () {
        return 'video';
    }

    static get PEN_LAYER () {
        return 'pen';
    }

    static get SPRITE_LAYER () {
        return 'sprite';
    }


    static get LAYER_GROUPS () {
        return [
            StageLayering.BACKGROUND_LAYER,
            StageLayering.VIDEO_LAYER,
            StageLayering.PEN_LAYER,
            StageLayering.SPRITE_LAYER
        ];
    }
}

/**
 * Icon svg to be displayed at the left edge of each extension block, encoded as a data URI.
 * @type {string}
 */
// eslint-disable-next-line max-len
const blockIconURI = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9Ii00NTkgMjYxIDQwIDQwIj48cGF0aCBkPSJNLTQ0NC40IDI5MC41bC0zLjYtMy42cy0xLjEgMS40LTMuOC44bC0zLjQgOS41Yy0uMS4zLjIuNi41LjVsOS41LTMuNGMtLjYtMi43LjgtMy44LjgtMy44eiIgZmlsbD0iI2Y3YzY3ZiIgc3Ryb2tlPSIjNTc1ZTc1IiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiLz48cGF0aCBkPSJNLTQ0MS45IDI5MC40bDE5LjUtMjIuMXMxLjMtMS42LS4yLTMuMWMtMS42LTEuNS0zLjEtLjItMy4xLS4ybC0yMi4xIDE5LjUtLjIgMi41IDEuOCAxLjggMS44IDEuOCAyLjUtLjJ6IiBmaWxsPSIjZjQ2ZDM4IiBzdHJva2U9IiM1NzVlNzUiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIvPjxwYXRoIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzU3NWU3NSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIGQ9Ik0tNDU1LjEgMjk3LjZsMy44LTMuOCIvPjxwYXRoIGZpbGw9IiM5NWQ4ZDYiIHN0cm9rZT0iIzU3NWU3NSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIGQ9Ik0tNDQ2LjUgMjgzLjFsNS44IDUuOCAyLjktMy4yLTUuNC01LjR6Ii8+PHBhdGggZmlsbD0iI2ZmZiIgc3Ryb2tlPSIjNTc1ZTc1IiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIGQ9Ik0tNDQzLjYgMjg2bC0yLjktMi45LTEuMyAxLjItLjMgMi42IDMuNyAzLjYgMi41LS4xIDEuMi0xLjV6Ii8+PHBhdGggZD0iTS00NDQuOCAyOTAuMmwyLjYtLjIgMTkuNC0yMnMuOC0xLjEuMS0yLjFsLTMwLjkgMzAuOCA3LjgtMi43Yy0uNC0yLjIuNi0zLjUgMS0zLjh6IiBvcGFjaXR5PSIuMiIgZmlsbD0iIzM1MzUzNSIvPjwvc3ZnPg==';

/**
 * @typedef {object} PenState - the pen state associated with a particular target.
 * @property {Boolean} penDown - tracks whether the pen should draw for this target.
 * @property {number} color - the current color (hue) of the pen.
 * @property {PenAttributes} penAttributes - cached pen attributes for the renderer. This is the authoritative value for
 *   diameter but not for pen color.
 */

/**
 * Host for the Pen-related blocks in Scratch 3.0
 * @param {Runtime} runtime - the runtime instantiating this block package.
 * @constructor
 */
class Scratch3CanvasBlocks {
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
            id: 'canvas',
            name: 'Canvas',
            blockIconURI: blockIconURI,
            blocks: [{
                    opcode: 'beginPath',
                    blockType: Scratch.BlockType.COMMAND,
                    text: 'beginPath',
                    arguments: {}
                },
                {
                    opcode: 'closePath',
                    blockType: Scratch.BlockType.COMMAND,
                    text: 'closePath',
                    arguments: {}
                },
                {
                    opcode: 'moveTo',
                    blockType: Scratch.BlockType.COMMAND,
                    text: 'moveTo([X],[Y])',
                    arguments: {
                        X: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: '0'
                        },
                        Y: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: '0'
                        }
                    }
                },
                {
                    opcode: 'lineTo',
                    blockType: Scratch.BlockType.COMMAND,
                    text: 'lineTo([X],[Y])',
                    arguments: {
                        X: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: '0'
                        },
                        Y: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: '0'
                        }
                    }
                },
                {
                    opcode: 'arc',
                    blockType: Scratch.BlockType.COMMAND,
                    text: 'arc([X],[Y],[RADIUS],[START_ANGLE],[END_ANGLE])',
                    arguments: {
                        X: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: '0'
                        },
                        Y: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: '0'
                        },
                        RADIUS: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: '100'
                        },
                        START_ANGLE: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: '0'
                        },
                        END_ANGLE: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: '3.1415926'
                        }
                    }
                },
                {
                    opcode: 'rect',
                    blockType: Scratch.BlockType.COMMAND,
                    text: 'rect([X],[Y],[W],[H])',
                    arguments: {
                        X: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: '0'
                        },
                        Y: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: '0'
                        },
                        W: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: '100'
                        },
                        H: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: '100'
                        }
                    }
                },
                {
                    opcode: 'clip',
                    blockType: Scratch.BlockType.COMMAND,
                    text: 'clip'
                },
                {
                    opcode: 'setLineWidth',
                    blockType: Scratch.BlockType.COMMAND,
                    text: 'setLineWidth([LINE_WIDTH])',
                    arguments: {
                        LINE_WIDTH: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: '1'
                        }
                    }
                },
                {
                    opcode: 'setLineCap',
                    blockType: Scratch.BlockType.COMMAND,
                    text: 'setLineCap([LINE_CAP])',
                    arguments: {
                        LINE_CAP: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: 'round'
                        }
                    }
                },
                {
                    opcode: 'setStrokeStyle',
                    blockType: Scratch.BlockType.COMMAND,
                    text: 'setStrokeStyle([STROKE_STYLE])',
                    arguments: {
                        STROKE_STYLE: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: '#000000'
                        }
                    }
                },
                {
                    opcode: 'setFillStyle',
                    blockType: Scratch.BlockType.COMMAND,
                    text: 'setFillStyle([FILL_STYLE])',
                    arguments: {
                        FILL_STYLE: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: '#000000'
                        }
                    }
                },
                {
                    opcode: 'stroke',
                    blockType: Scratch.BlockType.COMMAND,
                    text: 'stroke'
                },
                {
                    opcode: 'fill',
                    blockType: Scratch.BlockType.COMMAND,
                    text: 'fill'
                },
                {
                    opcode: 'clearRect',
                    blockType: Scratch.BlockType.COMMAND,
                    text: 'clearRect([X],[Y],[W],[H])',
                    arguments: {
                        X: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: '0'
                        },
                        Y: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: '0'
                        },
                        W: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: '480'
                        },
                        H: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: '360'
                        }
                    }
                },
                {
                    opcode: 'setFont',
                    blockType: Scratch.BlockType.COMMAND,
                    text: 'setFont([FONT])',
                    arguments: {
                        FONT: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: '30px Arial'
                        }
                    }
                },
                {
                    opcode: 'strokeText',
                    blockType: Scratch.BlockType.COMMAND,
                    text: 'strokeText([TEXT],[X],[Y])',
                    arguments: {
                        TEXT: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: 'hello world'
                        },
                        X: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: '0'
                        },
                        Y: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: '0'
                        }
                    }
                },
                {
                    opcode: 'fillText',
                    blockType: Scratch.BlockType.COMMAND,
                    text: 'fillText([TEXT],[X],[Y])',
                    arguments: {
                        TEXT: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: 'hello world'
                        },
                        X: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: '0'
                        },
                        Y: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: '0'
                        }
                    }
                },
                {
                    opcode: 'measureText',
                    blockType: Scratch.BlockType.REPORTER,
                    text: 'measureText([TEXT])',
                    arguments: {
                        TEXT: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: 'hello world'
                        }
                    }
                },
                {
                    opcode: 'loadImage',
                    blockType: Scratch.BlockType.COMMAND,
                    text: 'loadImage([IMAGE_ID])',
                    arguments: {
                        IMAGE_ID: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: 'bcaaa8547a07cfe572c0967ba829e99d.svg'
                        }
                    }
                },
                {
                    opcode: 'drawImage',
                    blockType: Scratch.BlockType.COMMAND,
                    text: 'drawImage([IMAGE_ID],[X],[Y])',
                    arguments: {
                        IMAGE_ID: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: 'bcaaa8547a07cfe572c0967ba829e99d.svg'
                        },
                        X: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: '0'
                        },
                        Y: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: '0'
                        }
                    }
                },
                {
                    opcode: 'scale',
                    blockType: Scratch.BlockType.COMMAND,
                    text: 'scale([SCALE_W],[SCALE_H])',
                    arguments: {
                        SCALE_W: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: '1.0'
                        },
                        SCALE_H: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: '1.0'
                        }
                    }
                },
                {
                    opcode: 'rotate',
                    blockType: Scratch.BlockType.COMMAND,
                    text: 'rotate([ANGLE])',
                    arguments: {
                        ANGLE: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: '0'
                        }
                    }
                },
                {
                    opcode: 'translate',
                    blockType: Scratch.BlockType.COMMAND,
                    text: 'translate([X],[Y])',
                    arguments: {
                        X: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: '0'
                        },
                        Y: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: '0'
                        }
                    }
                },
                {
                    opcode: 'transform',
                    blockType: Scratch.BlockType.COMMAND,
                    text: 'transform([A],[B],[C],[D],[E],[F])',
                    arguments: {
                        A: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: '0'
                        },
                        B: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: '0'
                        },
                        C: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: '0'
                        },
                        D: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: '0'
                        },
                        E: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: '0'
                        },
                        F: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: '0'
                        }
                    }
                },
                {
                    opcode: 'clearTransform',
                    blockType: Scratch.BlockType.COMMAND,
                    text: 'clearTransform'
                },
                {
                    opcode: 'save',
                    blockType: Scratch.BlockType.COMMAND,
                    text: 'save'
                },
                {
                    opcode: 'restore',
                    blockType: Scratch.BlockType.COMMAND,
                    text: 'restore'
                },
                {
                    opcode: 'setGlobalAlpha',
                    blockType: Scratch.BlockType.COMMAND,
                    text: 'setGlobalAlpha([ALPHA])',
                    arguments: {
                        ALPHA: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: '1.0'
                        }
                    }
                },
                {
                    opcode: 'setGlobalCompositeOperation',
                    blockType: Scratch.BlockType.COMMAND,
                    text: 'setGlobalCompositeOperation([CompositeOperation])',
                    arguments: {
                        CompositeOperation: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: 'source-over'
                        }
                    }
                },
                {
                    opcode: 'switchCanvas',
                    blockType: Scratch.BlockType.COMMAND,
                    text: 'switchCanvas([NUMBER])',
                    arguments: {
                        NUMBER: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: '0'
                        }
                    }
                },
                {
                    opcode: 'stampOnStage',
                    blockType: Scratch.BlockType.COMMAND,
                    text: 'stampOnStage'
                },
            ],
            menus: {}
        };
    }

    _createCanvas() {
        var penSkinId = this.runtime.penSkinId;
        if (penSkinId == undefined) return null;
        var penSkin = this.runtime.renderer._allSkins[penSkinId];
        var size = penSkin.size;
        var w = size[0];
        var h = size[1];
        var tmpCanvas = document.createElement("canvas");
        tmpCanvas.width = w;
        tmpCanvas.height = h;
        var tmpCtx = tmpCanvas.getContext("2d");
        return {
            canvas: tmpCanvas,
            ctx: tmpCtx
        };
    }

    _getContext(idx) {
        if (!this._ctx) {
            this._canvasList = [];
            for (var i = 0; i < 8; i++) this._canvasList.push(null);
            var tmpCanvas = this._createCanvas();
            if (!tmpCanvas) return null;
            this._canvasList[0] = tmpCanvas;
            this._canvas = tmpCanvas.canvas;
            this._ctx = tmpCanvas.ctx;
            this._bufferedImages = {};

            this._skinId = this.runtime.renderer.createBitmapSkin(this._createCanvas().canvas, 1);
            this._drawableId = this.runtime.renderer.createDrawable(StageLayering.PEN_LAYER);
            this.runtime.renderer.updateDrawableSkinId(this._drawableId, this._skinId);
            this.runtime.renderer.updateDrawableVisible(this._drawableId, false);
        }
        if (idx != null) {
            var tmpCanvas = this._canvasList[idx];
            if (!tmpCanvas) {
                tmpCanvas = this._createCanvas();
                this._canvasList[idx] = tmpCanvas;
            }
            this._canvas = tmpCanvas.canvas;
            this._ctx = tmpCanvas.ctx;
        }
        return this._ctx;
    }

    beginPath() {
        const ctx = this._getContext();
        if (!ctx) return;
        ctx.beginPath();
    }

    closePath() {
        const ctx = this._getContext();
        if (!ctx) return;
        ctx.closePath();
    }

    moveTo(args, util) {
        const ctx = this._getContext();
        if (!ctx) return;
        const x = Cast.toNumber(args.X);
        const y = Cast.toNumber(args.Y);
        ctx.moveTo(x, y);
    }

    lineTo(args, util) {
        const ctx = this._getContext();
        if (!ctx) return;
        const x = Cast.toNumber(args.X);
        const y = Cast.toNumber(args.Y);
        ctx.lineTo(x, y);
    }

    rect(args, util) {
        const ctx = this._getContext();
        if (!ctx) return;
        const x = Cast.toNumber(args.X);
        const y = Cast.toNumber(args.Y);
        const w = Cast.toNumber(args.W);
        const h = Cast.toNumber(args.H);
        ctx.rect(x, y, w, h);
    }

    arc(args, util) {
        const ctx = this._getContext();
        if (!ctx) return;
        const x = Cast.toNumber(args.X);
        const y = Cast.toNumber(args.Y);
        const radius = Cast.toNumber(args.RADIUS);
        const startAngle = Cast.toNumber(args.START_ANGLE);
        const endAngle = Cast.toNumber(args.END_ANGLE);
        ctx.arc(x, y, radius, startAngle, endAngle);
    }

    clip() {
        const ctx = this._getContext();
        if (!ctx) return;
        ctx.clip();
    }

    setLineWidth(args, util) {
        const ctx = this._getContext();
        if (!ctx) return;
        const lineWidth = args.LINE_WIDTH;
        ctx.lineWidth = lineWidth;
    }

    setLineCap(args, util) {
        const ctx = this._getContext();
        if (!ctx) return;
        const lineCap = args.LINE_CAP;
        ctx.lineCap = lineCap;
    }

    setStrokeStyle(args, util) {
        const ctx = this._getContext();
        if (!ctx) return;
        const strokeStyle = args.STROKE_STYLE;
        ctx.strokeStyle = strokeStyle;
    }

    setFillStyle(args, util) {
        const ctx = this._getContext();
        if (!ctx) return;
        const fillStyle = args.FILL_STYLE;
        ctx.fillStyle = fillStyle;
    }

    stroke() {
        const ctx = this._getContext();
        if (!ctx) return;
        ctx.stroke();
    }

    fill() {
        const ctx = this._getContext();
        if (!ctx) return;
        ctx.fill();
    }

    setFont(args, util) {
        const ctx = this._getContext();
        if (!ctx) return;
        const font = args.FONT;
        ctx.font = font;
    }

    strokeText(args, util) {
        const ctx = this._getContext();
        if (!ctx) return;
        const text = args.TEXT;
        const x = Cast.toNumber(args.X);
        const y = Cast.toNumber(args.Y);
        ctx.strokeText(text, x, y);
    }

    fillText(args, util) {
        const ctx = this._getContext();
        if (!ctx) return;
        const text = args.TEXT;
        const x = Cast.toNumber(args.X);
        const y = Cast.toNumber(args.Y);
        ctx.fillText(text, x, y);
    }

    measureText(args, util) {
        const ctx = this._getContext();
        if (!ctx) return;
        const text = args.TEXT;
        return ctx.measureText(text).width;
    }

    clearRect(args, util) {
        const ctx = this._getContext();
        if (!ctx) return;
        const x = Cast.toNumber(args.X);
        const y = Cast.toNumber(args.Y);
        const w = Cast.toNumber(args.W);
        const h = Cast.toNumber(args.H);
        ctx.clearRect(x, y, w, h);
    }

    loadImage(args, util) {
        const ctx = this._getContext();
        if (!ctx) return;
        const imageId = args.IMAGE_ID;
        let self = this;
        if (!this._bufferedImages[imageId]) {
            return new Promise(resolve => {
                const img = new Image();
                img.crossOrigin = "anonymous";
                img.onload = () => {
                    this._bufferedImages[imageId] = img;

                    if (self._totalLoadedSize == null) self._totalLoadedSize = 0;
                    self._totalLoadedSize += 128 * 1024;
                    if (self._totalLoadedSize >= 2 * 1024 * 1024) {
                        var extUtils = self.runtime.extUtils;
                        var ctx = extUtils.getContext();
                        extUtils.ajax({
                            url: '/WebApi/Log/BlobAccess',
                            loadingStyle: "none",
                            hashStr: '',
                            data: {
                                targetType: ctx.targetType,
                                targetId: ctx.target.id,
                                deltaSize: this._totalLoadedSize,
                            },
                            type: 'POST'
                        }).done(r => {
                            self._totalLoadedSize = 0;
                        }).error(r => {});
                    }

                    resolve();
                };
                img.onerror = () => {
                    resolve();
                };
                var extUtils = this.runtime.extUtils;
                img.src = extUtils.getAssetFetchUrl(imageId);
            });
        }
    }

    drawImage(args, util) {
        const ctx = this._getContext();
        if (!ctx) return;
        const imageId = Cast.toString(args.IMAGE_ID);
        const x = Cast.toNumber(args.X);
        const y = Cast.toNumber(args.Y);
        if (imageId.length > 10) {
            const img = this._bufferedImages[imageId];
            if (!img) return;
            ctx.drawImage(img, x, y);
        } else {
            var idx = Math.min(Math.max(0, Cast.toNumber(args.IMAGE_ID)), 7);
            var tmpCanvas = this._canvasList[idx];
            if (tmpCanvas) ctx.drawImage(tmpCanvas.canvas, x, y);
        }
    }

    scale(args, util) {
        const ctx = this._getContext();
        if (!ctx) return;
        const scaleW = Cast.toNumber(args.SCALE_W);
        const scaleH = Cast.toNumber(args.SCALE_H);
        ctx.scale(scaleW, scaleH);
    }

    rotate(args, util) {
        const ctx = this._getContext();
        if (!ctx) return;
        const angle = Cast.toNumber(args.ANGLE);
        ctx.rotate(angle);
    }

    translate(args, util) {
        const ctx = this._getContext();
        if (!ctx) return;
        const x = Cast.toNumber(args.X);
        const y = Cast.toNumber(args.Y);
        ctx.translate(x, y);
    }

    transform(args, util) {
        const ctx = this._getContext();
        if (!ctx) return;
        const a = Cast.toNumber(args.A);
        const b = Cast.toNumber(args.B);
        const c = Cast.toNumber(args.C);
        const d = Cast.toNumber(args.D);
        const e = Cast.toNumber(args.E);
        const f = Cast.toNumber(args.F);
        ctx.transform(a, b, c, d, e, f);
    }

    clearTransform(args, util) {
        const ctx = this._getContext();
        if (!ctx) return;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
    }

    save() {
        const ctx = this._getContext();
        if (!ctx) return;
        ctx.save();
    }

    restore() {
        const ctx = this._getContext();
        if (!ctx) return;
        ctx.restore();
    }

    setGlobalAlpha(args, util) {
        const ctx = this._getContext();
        if (!ctx) return;
        const alpha = Cast.toNumber(args.ALPHA);
        ctx.globalAlpha = alpha;
    }

    setGlobalCompositeOperation(args, util) {
        const ctx = this._getContext();
        if (!ctx) return;
        const compositeOperation = args.CompositeOperation;
        ctx.globalCompositeOperation = compositeOperation;
    }

    switchCanvas(args, util) {
        const number = Math.min(Math.max(0, Cast.toNumber(args.NUMBER)), 7);
        const ctx = this._getContext(number); //使用指定编号获取ctx时会自动设置为当前ctx
    }

    stampOnStage() {
        const ctx = this._getContext();
        if (!ctx) return;

        var imageData = ctx.getImageData(0, 0, 480, 360);
        var skin = this.runtime.renderer._allSkins[this._skinId];
        skin._setTexture(imageData);
        this.runtime.renderer.penStamp(this.runtime.penSkinId, this._drawableId);
        this.runtime.requestRedraw();
    }
}

Scratch.extensions.register(new Scratch3CanvasBlocks());
