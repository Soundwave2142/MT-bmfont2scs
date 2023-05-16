/**
 * @author Soundwave2142
 *
 * https://github.com/Soundwave2142
 * https://sw-projects.net/
 *
 * Original idea by Etrusan
 *
 * 02.28.2021
 */

class BMFont2SCSFileCreator {

    /**
     * @type {JSZip}
     */
    zip = new JSZip();

    /**
     * @type {BMFont2SCSHelper}
     */
    helper = new BMFont2SCSHelper();

    /**
     * @type {{kerningKeepIfLimit: boolean, generalInfo: [], kerningLimit: number}}
     */
    config = {
        kerningLimit: 1535,
        kerningKeepIfLimit: true,
        generalInfo: []
    }

    /**
     * @param config
     */
    constructor(config) {
        this.config = $.extend(this.config, config);
    }

    /**
     * @param fileName {string}
     * @param chars {array}
     * @param kernings {array}
     * @param contents {string}
     *
     * @returns {BMFont2SCSFileCreator}
     */
    createFontFile(fileName, chars, kernings, contents = '') {
        const self = this;

        // add general info
        this.config.generalInfo.forEach(function (line) {
            contents += line + '\n';
        })

        // add header and insert coordinates for chars
        contents += '\n' + '#NUM,     P_x, P_y,   W,   H,   L,   T,   A,   I     # character / glyph name\n\n';
        chars.forEach(function (setOfCoordinates) {
            setOfCoordinates.forEach(function (coordinate, key) {
                const spacing = self.calculateSpacingForCoordinate(coordinate, key)
                const delimiter = setOfCoordinates.length > (key + 1) ? ',' : '';

                contents += spacing + coordinate + delimiter;
            });

            contents += "     # '" + self.helper.getUnicodeFromHex(setOfCoordinates[0]) + "'\n";
        });

        const BreakException = {};

        // add header and insert coordinates for kerning
        if (kernings.length < this.config.kerningLimit || this.config.kerningKeepIfLimit) {
            contents += '\n# kerning...\n\n';

            try {
                kernings.forEach(function (coordinates, key) {
                    if (key >= self.config.kerningLimit) {
                        throw BreakException // throw a break, if kerning reached its limit
                    }

                    contents += 'kern: ' + coordinates[0] + ', ' + coordinates[1] + ', ' + coordinates[2] + '      # \''
                        + self.helper.getUnicodeFromHex(coordinates[0]) + '\' -> \''
                        + self.helper.getUnicodeFromHex(coordinates[1]) + '\'\n';
                });
            } catch (e) {
                if (e !== BreakException) throw e;
            }
        }

        this.zip.file(fileName + '.font', contents);

        return this;
    }

    /**
     * @param coordinate {string}
     * @param coordinatePosition {int}
     * @param defaultSpacing {string}
     *
     * @returns {string}
     */
    calculateSpacingForCoordinate(coordinate, coordinatePosition, defaultSpacing = '') {
        // have bigger spacing after first (hex) value, rest are smaller  (4)
        const maxSpacing = coordinatePosition === 1 ? 7 : 4;

        for (let i = 0; i < (maxSpacing - coordinate.length); i++) {
            defaultSpacing += ' ';
        }

        return defaultSpacing;
    }

    /**
     * @param fileName {string}
     * @param contents {string}
     *
     * @returns {BMFont2SCSFileCreator}
     */
    createMatFile(fileName, contents = '') {
        contents = 'material : "ui.white_font" {\n'
            + '	texture : "' + fileName + '.tobj"\n'
            + '	texture_name : "texture"\n'
            + '}\n';

        this.zip.file(fileName + '.mat', contents);

        return this;
    }

    /**
     * @param fileName {string}
     * @param contents {string}
     *
     * @returns {BMFont2SCSFileCreator}
     */
    createTobjFile(fileName, contents = '') {
        contents = 'map 2d	' + fileName + '.tga\n'
            + 'addr\n'
            + '     clamp_to_edge\n'
            + '     clamp_to_edge\n'
            + 'color_space linear\n'
            + 'nomips\n'
            + 'nocompress\n';

        this.zip.file(fileName + '.tobj', contents);

        return this;
    }

    /**
     * @param name
     */
    saveZip(name) {
        this.zip.generateAsync({type: 'blob'}).then(function (blob) {
            saveAs(blob, name + '.zip');
        });
    }
}
