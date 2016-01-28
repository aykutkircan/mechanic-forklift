/**
 *
 * Forklift, lift any file with given.
 */

"use strict";

const Fs = require("fs");

const ImageResizer = require("./image_resizer");
const FileUploader = require("./file_uploader");

/**
 * @callback UploadCallback
 * @param {error} Error
 * @param {string} [RemoteUrl]
 */

/**
 * Resize & Upload image to S3
 * @param {string} tempFilePath
 * @param {string} s3DesiredPath
 * @param [options] Resize & S3 Uploader configurations
 * @param {UploadCallback} callback
 */

exports.uploadImage = (tempFilePath, s3DesiredPath, options, callback) => {

    const resizeOptions = (options || {}).size;
    const uploadOptions = (options || {}).upload;
    const removeOption = (options || {}).remove !== false;

    let imageResizer;
    let imageUploader;

    try {
        imageResizer = new ImageResizer(resizeOptions);
        imageUploader = new FileUploader(uploadOptions);
    }
    catch (err) {
        return callback(err);
    }

    imageResizer.resize(tempFilePath, (error, filePath) => {

        if (error) {
            return callback(error);
        }

        imageUploader.upload(filePath, s3DesiredPath, (error, remoteUrl) => {

            if (error) {
                return callback(error);
            }

            if (removeOption) {
                Fs.unlink(filePath);
                if (tempFilePath != filePath) {
                    Fs.unlink(tempFilePath);
                }
            }

            return callback(null, remoteUrl);
        });
    });
};

/**
 * Upload large file to S3
 * @param {String} tempFilePath
 * @param {String} s3DesiredPath
 * @param [options] S3 uploader configurations
 * @param {UploadCallback} callback
 */
exports.uploadFile = (tempFilePath, s3DesiredPath, options, callback) => {

    const uploadOptions = (options || {}).upload;
    const removeOption = (options || {}).remove !== false;

    let fileUploader;

    try {
        fileUploader = new FileUploader(uploadOptions);
    }
    catch (err) {
        return callback(err);
    }

    fileUploader.upload(tempFilePath, s3DesiredPath, (error, remoteUrl) => {

        if (error) {
            return callback(error);
        }

        if (removeOption) {
            Fs.unlink(tempFilePath);
        }

        return callback(null, remoteUrl);
    });
};