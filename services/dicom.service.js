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
        try {
            if (!fileName) {
                return undefined;
            }
            const filePath = `resources/uploads/${fileName}`;
            return fs.readFileSync(filePath);
        } catch(ex) {
            console.log(ex);
        }
    }

    /**
     * Extracts and returns a header attribute from a given DICOM file and tag
     * @param {Buffer} [dicomFileAsBuffer] - DICOM file contents
     * @param {string} [tag] - DICOM tag in xGGGGEEEE format (where G = group number, E = element number)
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

    /**
     * Extracts and converts raw pixel data to PNG image format
     * @param {Buffer} [dicomFileAsBuffer] - DICOM file contents
     * @returns {PNG|undefined} PNG object
     */
    static async createPNG(dicomFileAsBuffer) {
        try {
            const toArrayBuffer = (buf) => {
                const ab = new ArrayBuffer(buf.length);
                const view = new Uint8Array(ab);
                for (let i = 0; i < buf.length; ++i) {
                    view[i] = buf[i];
                }
                return ab;
            };

            const image = new DicomImage(toArrayBuffer(dicomFileAsBuffer));

            // Rendered pixels in an RGBA ArrayBuffer.
            const renderedPixels = Buffer.from(image.render().pixels);

            const rgbaPixels = Buffer.alloc( 4 * image.getWidth() * image.getHeight());

            for (let i = 0; i < 4 * image.getWidth() * image.getHeight(); i += 4) {
                rgbaPixels[i] = renderedPixels[i + 3];
                rgbaPixels[i + 1] = renderedPixels[i + 2];
                rgbaPixels[i + 2] = renderedPixels[i + 1];
                rgbaPixels[i + 3] = renderedPixels[i];
            }

            let png = new PNG({
                width: image.getWidth(),
                height: image.getHeight(),
                bitDepth: 8,
                colorType: 6,
                inputColorType: 6,
                inputHasAlpha: true,
            });

            png.data = rgbaPixels;
            return png.pack();

        } catch (ex) {
            console.log(ex);
        }
    }
}

module.exports = DicomService;
