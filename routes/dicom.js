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

/* GET header attribute by filename and tag */
router.get("/:fileName/attribute", function (req, res, next) {
    const dicomAsBuffer = DicomService.getDicomFileAsBuffer(req.params.fileName);
    const attribute = DicomService.getAttributeByTag(dicomAsBuffer, req.query.tag);
    res.status(200).send(attribute);
});

/* GET PNG image by file name */
router.get("/:fileName/image", function (req, res, next) {
    res.status(200).send("Here's your image");
});

module.exports = router;
