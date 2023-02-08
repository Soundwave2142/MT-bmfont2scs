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

class BMFont2SCSZipper {

    /**
     * @type {JSZip}
     */
    zip = new JSZip();

    /**
     * @param name
     * @param format
     * @param contents
     *
     * @returns {BMFont2SCSZipper}
     */
    createFile(name, format, contents) {
        this.zip.file(name + '.' + format, contents);

        return this;
    }

    /**
     * @param name
     */
    saveFile(name) {
        this.zip.generateAsync({type: 'blob'}).then(function (blob) {
            saveAs(blob, name + '.zip');
        });
    }
}
