var Promise = require("bluebird");
var knox = require('knox');

/**
 * Initialize Uplader
 * @param {{key: string, secret: string, bucket: string}} options
 */
var FileUploader = function (options) {
    this.options = {};
    this.options.public = (options || {}).public !== false;
    this.client = knox.createClient(options || {});
};

/**
 * Upload file to S3
 * @param {String} filePath
 * @param {String} s3DesiredPath
 * @returns {Promise} URL of uploaded file
 */
FileUploader.prototype.upload = function (filePath, s3DesiredPath) {
    var self = this;

    var headers = {
        "x-amz-acl": "public-read"
    };
    if (!this.options.public) {
        headers["x-amz-acl"] = "private";
    }

    return new Promise(function (resolve, reject) {
        self.client.putFile(filePath, s3DesiredPath, headers, function (err, res) {
            if (err) {
                reject(err);
            }
            else {
                // To end stream we must call res.resume or res.end ,
                // i choose resume, end streams may cause immediate new access impossible
                res.resume();

                if (res.statusCode == 200) {
                    resolve(res.req.url);
                }
                else if (res.statusCode == 403) {
                    reject(new Error("Credentials or bucket name wrong, response code:" + res.statusCode));
                }
                else {
                    reject(new Error("File may not be uploaded, response code: " + res.statusCode));
                }
            }
        });
    });
};

/**
 * Upload stream to S3
 * @param {Stream} inputStream
 * @param {String} s3DesiredPath
 * @param {{length: number, type: string}} contentHeaders
 * @returns {Promise} URL of uploaded file
 */
FileUploader.prototype.uploadStream = function (inputStream, s3DesiredPath, contentHeaders) {
    var self = this;

    // content header should contain type and length values
    if (!(contentHeaders && contentHeaders.type && contentHeaders.length)) {
        return new Promise(function (resolve, reject) {
            reject(new Error("Content header options missing, content-length or content-type"));
        });
    }

    var headers = {
        "x-amz-acl": "public-read",
        "Content-Length": contentHeaders.length,
        "Content-Type": contentHeaders.type
    };
    if (!this.options.public) {
        headers["x-amz-acl"] = "private";
    }

    return new Promise(function (resolve, reject) {
        self.client.putStream(inputStream, s3DesiredPath, headers, function (err, res) {
            if (err) {
                reject(err);
            }
            else {
                // To end stream we must call res.resume or res.end ,
                // i choose resume, end streams may cause immediate new access impossible
                res.resume();

                if (res.statusCode == 200) {
                    resolve(res.req.url);
                }
                else if (res.statusCode == 403) {
                    reject(new Error("Credentials or bucket name wrong, response code:" + res.statusCode));
                }
                else {
                    reject(new Error("File may not be uploaded or content headers may be wrong, response code: " + res.statusCode));
                }
            }
        });
    });
};

module.exports = FileUploader;