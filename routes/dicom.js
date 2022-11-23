const express = require("express");
const router = express.Router();
const uploadFile = require("../services/upload.service");
const DicomService = require('../services/dicom.service');

/* Upload DICOM file */
router.post("/", async function (req, res, next) {
    try {
        await uploadFile(req, res);
        if (req.file == undefined) {
            return res.status(400).send({ message: "Please upload a file!" });
        }
        res.status(200).send({
            message: "Uploaded the file successfully: " + req.file.originalname,
        });
    } catch (err) {
        res.status(500).send({
            message: `Could not upload the file: ${req.file.originalname}. ${err}`,
        });
    }
});

/* Fetch header attribute by tag from specified file  */
router.get("/:fileName/attribute", function (req, res, next) {
    try {
        if (!req.query.tag) {
            return res.status(400).send({ message: "Please provide a tag" });
        }
        const dicomAsBuffer = DicomService.getDicomFileAsBuffer(req.params.fileName);
        const attribute = DicomService.getAttributeByTag(dicomAsBuffer, req.query.tag);
        res.status(200).send(attribute);
    } catch (err) {
        res.status(404).send({
            message: `File not found: ${req.params.fileName}. Please provide a valid file name.`,
        });
    }
});

/**
 * NOT currently working, image buffer encoding needs to be worked out
 * 
 * Create and return PNG image from specified DICOM file
 */
router.get("/:fileName/image", async function (req, res, next) {
    try {
        const dicomAsBuffer = DicomService.getDicomFileAsBuffer(req.params.fileName);
        const png = await DicomService.createPNG(dicomAsBuffer);
        res.writeHead(200, { 'Content-Type': 'image/png' });
        png.pipe(res);

    } catch (err) {
        res.status(500).send({
            message: `Could not convert file to PNG format`,
        });
    }
});

module.exports = router;
