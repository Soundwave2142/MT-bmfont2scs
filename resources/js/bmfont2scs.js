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
 * TODO: this is a mess, refactor
 *
 */


/* set up converter events when page is done loading */
$(document).ready(function () {
    const converter = new BMFont2SCS();

    $("#file-input").on('change', function () {
        $("#convert-btn").show();
    });

    $('#convert-btn').on('click', function () {
        converter.convert();
    });
});

/**
 * Convertor class
 */
class BMFont2SCS {
    /**
     * @type {{kernelLimit: number}}
     */
    config = {
        kernelLimit: 1535
    }

    /**
     * @type {FileReader}
     */
    fr = new FileReader();

    /**
     * @type {BMFont2SCSHelper}
     */
    helper = new BMFont2SCSHelper();

    convert() {
        const that = this;

        this.fr.onload = function () {
            that.onFileLoad(that);
        }

        this.fr.readAsText($("#file-input").prop('files')[0]);
    }

    onFileLoad = function (that) {
        let generalInfo = {
            vert_span: that.helper.find(that.fr.result, 'lineHeight='),
            line_spacing: 0,
            width: that.helper.find(that.fr.result, 'scaleW='),
            height: that.helper.find(that.fr.result, 'scaleH='),
            filename: that.helper.find(that.fr.result, 'file="').split('.')[0]
        };

        let kerning = [], coordinates = [];

        that.fr.result.split(/\r?\n/).forEach(function (line) {
            let result;
            let isKerningLine = line.startsWith("kerning first=");

            if (line.startsWith("char id=") || isKerningLine) {
                result = that.handleData(line, isKerningLine);
                if (result) {
                    coordinates.push(result);
                }
            }
        });

        kerning.sort(that.sortFunction);
        that.outputData(generalInfo, coordinates, kerning);
    }

    /**
     * @param item
     * @param kerning
     * @returns {*}
     */
    handleData(item, kerning = false) {
        var arrayCoords = [];

        item.replace(/[^0-9 \-+]+/g, "").split(" ").forEach(function (coords) {
            if (coords !== '') {
                arrayCoords.push(coords);
            }
        });

        if (arrayCoords.length > 0) {
            arrayCoords[0] = this.helper.convertDecToHex(arrayCoords[0]);

            if (!kerning) {
                arrayCoords.pop();
            } else {
                arrayCoords[1] = this.helper.convertDecToHex(arrayCoords[1]);
            }

            return arrayCoords;
        }

        return false;
    }

    /**
     * @param info
     * @param coords
     * @param kerning
     */
    outputData(info, coords, kerning) {
        let that = this;
        var result = 'vert_span:' + info.vert_span + '\nline_spacing:' + info.line_spacing + '\n\nimage:' + info.filename + '.mat, ' + info.width + ', ' + info.height + '\n\n';

        result += '#NUM,    P_x, P_y,  W,  H,  L,  T,  A,  I     # character / glyph name\n\n';
        coords.forEach(function (setOfCoords) {

            setOfCoords.forEach(function (coord, key) {
                var itemLength = coord.length;
                var max = key > 2 ? 3 : 5;

                coord += setOfCoords.length > (key + 1) ? ',' : '';
                for (var i = 0; i < (max - itemLength); i++) {
                    coord = ' ' + coord;
                }

                result += coord;
            });

            result += '     # \'' + that.helper.getUnicodeFromHex(setOfCoords[0]) + '\'\n';
        });

        if (kerning.length < this.config.kerningLimit || document.querySelector('input[name="kerningOption"]:checked').value === 'keep') {
            result += '\n# kerning...\n\n';

            var BreakException = {};

            try {
                kerning.forEach(function (setOfKerns, key) {
                    if (key >= that.config.kerningLimit) {
                        throw BreakException
                    }

                    result += 'kern: ' + setOfKerns[0] + ', ' + setOfKerns[1] + ', ' + setOfKerns[2] + '      # \''
                        + that.helper.getUnicodeFromHex(setOfKerns[0]) + '\' -> \''
                        + that.helper.getUnicodeFromHex(setOfKerns[1]) + '\'\n';
                });
            } catch (e) {
                if (e !== BreakException) throw e;
            }
        }

        let mat = 'material : "ui.white_font" {\n	texture : "' + info.filename + '.tobj"\n	texture_name : "texture"\n}\n';
        let tobj = 'map 2d	' + info.filename + '.tga\naddr\n     clamp_to_edge\n     clamp_to_edge\ncolor_space linear\nnomips\nnocompress\n';

        this.zip = new BMFont2SCSZipper();
        this.zip.createFile(info.filename, 'font', result)
            .createFile(info.filename, 'mat', mat)
            .createFile(info.filename, 'tobj', tobj)
            .saveFile('bmfont2scs_' + info.filename)
    }
}
