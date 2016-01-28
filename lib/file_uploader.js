/**
 * File upload with aws-sdk
 */

"use strict";

const Fs = require("fs");
const AWS = require("aws-sdk");
const Mimos = require("mimos");
const Joi = require("joi");

const optionSchema = Joi.object().keys({

    key: Joi.string().min(15).max(30).required(),
    secret: Joi.string().required(),
    bucket: Joi.string().required(),
    region: Joi.string().optional().default("us-east-1")
});

/**
 * Initialize Uplader
 * @param {{key: string, secret: string, bucket: string, region:string}} options
 */

class FileUploader {

    constructor(options) {

        const validation = Joi.validate(options, optionSchema);
        if (validation.error) {
            throw validation.error;
        }

        this.options = validation.value;

        AWS.config.accessKeyId = this.options.key;
        AWS.config.secretAccessKey = this.options.secret;

        this.mimos = new Mimos();

        this.remoteUrl = this.options.region == "us-east-1" ?
            `https://s3.amazonaws.com/${this.options.bucket}/` :
            `https://s3-${this.options.region}.amazonaws.com/${this.options.bucket}/`;

        this.s3 = new AWS.S3({
            params: {
                Bucket: this.options.bucket,
                ACL: "public-read"
            }
        });
    }

    /**
     * @callback UploadCallback
     * @param {error} Error
     * @param {string} [RemoteUrl]
     */


    /**
     * Upload file to S3
     * @param {string} filePath
     * @param {string} s3DesiredPath
     * @param {UploadCallback} callback
     */

    upload(filePath, s3DesiredPath, callback) {

        const params = {
            "Body": Fs.createReadStream(filePath),
            "ContentType": this.mimos.path(filePath).type,
            "Key": s3DesiredPath
        };

        this.s3.putObject(params, (error) => {

            if (error) {
                return callback(error);
            }

            return callback(null, this.remoteUrl + s3DesiredPath);
        });
    }

}

module.exports = FileUploader;