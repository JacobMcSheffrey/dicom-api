const dicomParser = require("dicom-parser");
const fs = require("fs");
const dcmjsImaging = require("dcmjs-imaging");
const { DicomImage } = dcmjsImaging;
PNG = require("pngjs").PNG;

/**
 * Service class with static util methods for manipulating DICOM files
 */
class DicomService {

    /**
     * Read the DICOM P10 file from disk into a Buffer and return it
     * @param {string} [fileName] - Name of the DICOM file
     * @returns {Buffer|undefined} Contents of the specified file or undefined if fileName doesn't exist.
     */
    static getDicomFileAsBuffer(fileName) {
        if (!fileName) {
            return undefined;
        }
        const filePath = `resources/uploads/${fileName}`;
        return fs.readFileSync(filePath);
    }

    /**
     * Extracts and returns a header attribute from a given DICOM file and tag
     * @param {string} [fileName] - Name of the DICOM file
     * @param {string} [fileName] - DICOM tag in xGGGGEEEE format (where G = group number, E = element number)
     * @returns {string|undefined} The corresponding header attribute value or undefined
     */
    static getAttributeByTag(dicomFileAsBuffer, tag) {
        if (!dicomFileAsBuffer || !tag) {
            return undefined;
        }
        try {
            var dataSet = dicomParser.parseDicom(dicomFileAsBuffer);
            return dataSet.string(tag);
        } catch (ex) {
            console.log(ex);
        }
    }

    static async getImage(dicomFileAsBuffer) {
        try {
            const toArrayBuffer = (buf) => {
                const ab = new ArrayBuffer(buf.length);
                const view = new Uint8Array(ab);
                for (let i = 0; i < buf.length; ++i) {
                    view[i] = buf[i];
                }
                return ab;
            };

            const arrBuffer = toArrayBuffer(dicomFileAsBuffer);

            const image = new DicomImage(arrBuffer);

            // Render image.
            const renderingResult = image.render();

            // // Rendered pixels in an RGBA ArrayBuffer.
            const renderedPixels = Buffer.from(renderingResult.pixels);

            const argbPixels = Buffer.alloc( 4 * image.getWidth() * image.getHeight());
            for (let i = 0; i < 4 * image.getWidth() * image.getHeight(); i += 4) {
                argbPixels[i] = renderedPixels[i + 3];
                argbPixels[i + 1] = renderedPixels[i + 2];
                argbPixels[i + 2] = renderedPixels[i + 1];
                argbPixels[i + 3] = renderedPixels[i];
            }

            let png = new PNG({
                width: image.getWidth(),
                height: image.getHeight(),
                bitDepth: 8,
                colorType: 6,
                inputColorType: 6,
                inputHasAlpha: true,
            });

            png.data = argbPixels;
            return png.pack();
        } catch (ex) {
            console.log(ex);
        }
    }
}

module.exports = DicomService;
