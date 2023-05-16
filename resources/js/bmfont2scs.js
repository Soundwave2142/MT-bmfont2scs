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

/* set up converter events when page is done loading */
$(document).ready(function () {
    $("#file-input").on('change', function () {
        $("#convert-btn").show();
    });

    $('#convert-btn').on('click', function () {
        (new BMFont2SCS()).convert();
    });
});

/**
 * Convertor class
 */
class BMFont2SCS {

    /**
     * @type {BMFont2SCSHelper}
     */
    helper = new BMFont2SCSHelper();

    /**
     * @type {string}
     */
    fileContents = '';

    /**
     * @type {[]}
     */
    chars = [];

    /**
     * @type {[]}
     */
    kernings = [];

    /**
     * Assign on load event then load the file
     */
    convert() {
        const self = this;
        const fileReader = new FileReader();

        fileReader.onload = function () {
            // load file reader result into file, then handle each line separately.
            self.fileContents = fileReader.result;
            self.fileContents.split(/\r?\n/).forEach(function (line) {
                self.handleLine(line)
            });

            self.outputData();
        }

        fileReader.readAsText($("#file-input").prop('files')[0]);
    }

    /**
     * @param line
     */
    handleLine(line) {
        let isCharLine = line.startsWith("char id=");
        let isKerningLine = line.startsWith("kerning first=");
        if (!isCharLine && !isKerningLine) {
            return;
        }

        this.handleLineData(line, isCharLine, isKerningLine);
    }

    /**
     * @param line {string}
     * @param isCharLine {boolean}
     * @param isKerningLine {boolean}
     *
     * @returns {boolean|*}
     */
    handleLineData(line, isCharLine, isKerningLine) {
        // remove every non number symbol, split the line into chars to filter out empty chars
        // the change type of coordinate to int for further processing
        const coordinates = line.replace(/[^0-9 \-+]+/g, "").split(" ")
            .filter(number => number.trim().length !== 0); // .map(coordinate => parseInt(coordinate)); <-- currently int not needed.

        if (coordinates.length <= 0) {
            return;
        }

        if (isCharLine) {
            this.handleCharCoordinates(coordinates);
        } else if (isKerningLine) {
            this.handleKerningCoordinates(coordinates);
        }
    }

    /**
     * @param coordinates
     */
    handleCharCoordinates(coordinates) {
        coordinates[0] = this.helper.convertDecToHex(coordinates[0]); // convert first to hex, which is id
        coordinates.pop(); // and pop last, which is "chnl" and not needed

        this.chars.push(coordinates);
    }

    /**
     * @param coordinates
     */
    handleKerningCoordinates(coordinates) {
        // both first and second element are ids and needed to be in hex format
        coordinates[0] = this.helper.convertDecToHex(coordinates[0]);
        coordinates[1] = this.helper.convertDecToHex(coordinates[1]);

        this.kernings.push(coordinates);
    }


    /**
     * pack processed lines into files and pack files into zip
     */
    outputData() {
        this.kernings.sort(this.helper.sortFunction);

        const fileName = this.findInFile('file="').split('.')[0]
        const fileConfig = {
            kerningKeepIfLimit: $('input[name="kerningOption"]:checked').val() === 'keep',
            generalInfo: [
                'vert_span:' + this.findInFile('lineHeight='),
                'line_spacing:' + '0',
                'image:' + fileName + '.mat, ' + this.findInFile('scaleW=') + ', ' + this.findInFile('scaleH=')
            ]
        };

        (new BMFont2SCSFileCreator(fileConfig)) // create three needed files and pack them to zip
            .createFontFile(fileName, this.chars, this.kernings)
            .createMatFile(fileName)
            .createTobjFile(fileName)
            .saveZip('bmfont2scs_' + fileName);
    }

    /**
     * @param key
     *
     * @returns {*|string}
     */
    findInFile(key) {
        return this.helper.find(this.fileContents, key);
    }
}
