/**
 * @author Soundwave2142
 *
 * https://github.com/Soundwave2142
 * https://sw-projects.net/
 *
 * Original idea by Etrusan
 *
 * 02.28.2021
 *
 */

class BMFont2SCSHelper {

    /**
     * @param a
     * @param b
     *
     * @returns {number}
     */
    sortFunction(a, b) {
        if (a[0] === b[0]) {
            return 0;
        } else {
            return (a[0] < b[0]) ? -1 : 1;
        }
    }

    /**
     * @param hex
     *
     * @return string
     */
    getUnicodeFromHex(hex) {
        return String.fromCodePoint(parseInt(hex.substring(1), 16));
    }

    /**
     * @param val
     *
     * @returns {string}
     */
    convertDecToHex(val) {
        var element = parseInt(val, 10).toString(16);
        var prefix = 'x';

        for (var i = element.length; i < 4; i++) {
            prefix += '0';
        }

        return prefix + element;
    }

    /**
     * @param str
     * @param needle
     *
     * @returns {*|string}
     */
    find(str, needle) {
        let index = str.indexOf(' ', str.indexOf(needle) + needle.length);
        if (str.indexOf('\n', str.indexOf(needle) + needle.length) < index) {
            index = str.indexOf('\n', str.indexOf(needle) + needle.length)
        }

        return str.substring(str.indexOf(needle) + needle.length, index);
    }
}
