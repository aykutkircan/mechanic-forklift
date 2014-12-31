var Promise = require("bluebird");
var Fs = Promise.promisifyAll(require("fs"));

var ImageResizer = require("./image_resizer");
var FileUploader = require("./file_uploader");

/**
 * Resize & Upload image stream to S3
 * @param {Stream} imageStream
 * @param {String} s3DesiredPath
 * @param [options] Resize & S3 Uploader configurations
 * @returns {Promise} URL of uploaded image
 */
function _uploadBareStream(imageStream, s3DesiredPath, options) {

    var uploadOptions = (options || {}).upload;
    var contentHeaders = (options || {}).content;

    var imageUploader;

    try {
        imageUploader = new FileUploader(uploadOptions);
    }
    catch (err) {
        return new Promise(function (resolve, reject) {
            reject(err);
        });
    }

    return imageUploader.uploadStream(imageStream, s3DesiredPath, contentHeaders).then(function (url) {
        return url;
    });
}

/**
 * Resize & Upload image to S3
 * @param {String} tempFilePath
 * @param {String} s3DesiredPath
 * @param [options] Resize & S3 Uploader configurations
 * @returns {Promise} URL of uploaded image
 */
function _uploadImage(tempFilePath, s3DesiredPath, options) {
    var resizeOptions = (options || {}).size;
    var uploadOptions = (options || {}).upload;
    var removeOption = (options || {}).remove !== false;
    // first resize the image in specified path
    var imageResizer = new ImageResizer(tempFilePath, resizeOptions);

    var imageUploader;

    try {
        imageUploader = new FileUploader(uploadOptions);
    }
    catch (err) {
        return new Promise(function (resolve, reject) {
            reject(err);
        });
    }

    return imageResizer.resize().then(function (filePath) {
        return imageUploader.upload(filePath, s3DesiredPath).then(function (url) {
            if (removeOption) {
                // remove temp files
                var filesToRemove = [];
                filesToRemove.push(Fs.unlinkAsync(filePath));
                if (tempFilePath != filePath) {
                    filesToRemove.push(Fs.unlinkAsync(tempFilePath));
                }
                return Promise.all(filesToRemove).then(function () {
                    return url;
                });
            }
            else {
                return url;
            }
        });
    });
}

/**
 * Resize & Upload image stream to S3
 * @param {Stream} imageStream
 * @param {String} s3DesiredPath
 * @param [options] Resize & S3 Uploader configurations
 * @returns {Promise} URL of uploaded image
 */
function _uploadImageStream(imageStream, s3DesiredPath, options) {
    var resizeOptions = (options || {}).size;
    // add resize stream value
    resizeOptions.resizeStream = true;
    var uploadOptions = (options || {}).upload;
    var contentHeaders = (options || {}).content;

    // first resize the image in specified path
    var imageResizer = new ImageResizer(imageStream, resizeOptions);

    var imageUploader;

    try {
        imageUploader = new FileUploader(uploadOptions);
    }
    catch (err) {
        return new Promise(function (resolve, reject) {
            reject(err);
        });
    }

    return imageResizer.resize().then(function (imageStream) {
        return imageUploader.uploadStream(imageStream, s3DesiredPath, contentHeaders).then(function (url) {
            return url;
        });
    });
}

/**
 * Upload video stream to S3
 * @param {Stream} videoStream
 * @param {String} s3DesiredPath
 * @param [options] Resize & S3 Uploader configurations
 * @returns {Promise} URL of uploaded video
 */
function _uploadVideoStream(videoStream, s3DesiredPath, options) {
    return _uploadFileStream(videoStream, s3DesiredPath, options);
}

/**
 * Upload large file to S3
 * @param {String} tempFilePath
 * @param {String} s3DesiredPath
 * @param [options] S3 uploader configurations
 * @returns {Promise} URL of uploaded file
 */
function _uploadFile(tempFilePath, s3DesiredPath, options) {
    var uploadOptions = (options || {}).upload;
    var removeOption = (options || {}).remove !== false;

    var fileUploader;

    try {
        fileUploader = new FileUploader(uploadOptions);
    }
    catch (err) {
        return new Promise(function (resolve, reject) {
            reject(err);
        });
    }

    return fileUploader.upload(tempFilePath, s3DesiredPath).then(function (url) {
        if (removeOption) {
            // remove temp file
            return Fs.unlinkAsync(tempFilePath).then(function () {
                return url;
            });
        }
        else {
            return url;
        }
    });
}

/**
 * Upload file stream to S3
 * @param {Stream} fileStream
 * @param {String} s3DesiredPath
 * @param [options] S3 Uploader configurations
 * @returns {Promise} URL of uploaded file
 */
function _uploadFileStream(fileStream, s3DesiredPath, options) {
    var uploadOptions = (options || {}).upload;
    var contentHeaders = (options || {}).content;
    var fileUploader;

    try {
        fileUploader = new FileUploader(uploadOptions);
    }
    catch (err) {
        return new Promise(function (resolve, reject) {
            reject(err);
        });
    }

    return fileUploader.uploadStream(fileStream, s3DesiredPath, contentHeaders).then(function (url) {
        return url;
    });
}

module.exports = {
    liftImage: _uploadImage,
    liftImageStream: _uploadImageStream,
    liftVideoStream: _uploadVideoStream,
    liftFile: _uploadFile,
    liftFileStream: _uploadFileStream
};