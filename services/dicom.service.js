var dicomParser = require("dicom-parser");
var Rusha = require("rusha");

class DicomService {

    // Function to calculate the SHA1 Hash for a buffer with a given offset and length
    static sha1(buffer, offset, length) {
        offset = offset || 0;
        length = length || buffer.length;
        var subArray = dicomParser.sharedCopy(buffer, offset, length);
        var rusha = new Rusha();
        return rusha.digest(subArray);
    }

    // Read the DICOM P10 file from disk into a Buffer and return it
    static getDicomFileAsBuffer(fileName) {
        const fs = require('fs');
        const filePath = `resources/uploads/${fileName}`;
        console.log('File Path = ', filePath);
        return fs.readFileSync(filePath);
    }

    static parseDicom(dicomFileAsBuffer) {
        // Parse the dicom file
        try {
        var dataSet = dicomParser.parseDicom(dicomFileAsBuffer);
    
        // print the patient's name
        var patientName = dataSet.string('x00100020');
        console.log('Patient Name = '+ patientName);
    
        // Get the pixel data element and calculate the SHA1 hash for its data
        var pixelData = dataSet.elements.x7fe00010;
        var pixelDataBuffer = dicomParser.sharedCopy(dicomFileAsBuffer, pixelData.dataOffset, pixelData.length);
        console.log('Pixel Data length = ', pixelDataBuffer.length);
        console.log("Pixel Data SHA1 hash = ", this.sha1(pixelDataBuffer));
    
    
        if(pixelData.encapsulatedPixelData) {
            var imageFrame = dicomParser.readEncapsulatedPixelData(dataSet, pixelData, 0);
            console.log('Old Image Frame length = ', imageFrame.length);
            console.log('Old Image Frame SHA1 hash = ', this.sha1(imageFrame));
    
            if(pixelData.basicOffsetTable.length) {
            var imageFrame = dicomParser.readEncapsulatedImageFrame(dataSet, pixelData, 0);
            console.log('Image Frame length = ', imageFrame.length);
            console.log('Image Frame SHA1 hash = ', this.sha1(imageFrame));
            } else {
            var imageFrame = dicomParser.readEncapsulatedPixelDataFromFragments(dataSet, pixelData, 0, pixelData.fragments.length);
            console.log('Image Frame length = ', imageFrame.length);
            console.log('Image Frame SHA1 hash = ', this.sha1(imageFrame));
            }
        }
    
        }
        catch(ex) {
        console.log(ex);
        }
    }

    static getAttributeByTag(dicomFileAsBuffer, tag) {
        try {
            var dataSet = dicomParser.parseDicom(dicomFileAsBuffer);
            return dataSet.string(tag);
        }
        catch(ex) {
            console.log(ex);
        }
    }
}

module.exports = DicomService;