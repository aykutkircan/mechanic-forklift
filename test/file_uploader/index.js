/**
 *
 * @File: image_uploader.js
 * @Description: Image Uploader Test File
 * @Reference: http://chaijs.com/api/bdd/
 *
 */

var chai = require("chai");
chai.use(require("chai-as-promised"));
var expect = chai.expect;

var Promise = require("bluebird");
var fs = require("fs");
var Path = require("path");
var request = require("request");

var FileUploader = require("../../lib/file_uploader");
var secret = require("../../config/secret");

describe("Image Uploader", function () {
    var imageDirectory = Path.join(process.cwd(), "test/images");
    var imageUploader;
    var filePath = Path.join(imageDirectory, "upload_test.jpg");
    var s3Path = "images/upload_test.jpg";

    beforeEach(function (done) {
        var options = {
            key: secret.accessKey,
            secret: secret.secretKey,
            bucket: "kiosk_dev"
        };
        imageUploader = new FileUploader(options);
        done();
    });

    it("should fail to upload a non-existing file", function () {
        var nonExistingFilePath = Path.join(imageDirectory, "non-existing.jpg");
        return expect(imageUploader.upload(nonExistingFilePath, s3Path)).to.be.rejected;
    });

    describe("Uploading existing files", function () {
        before(function (done) {
            // image download
            var imgStream = fs.createWriteStream(filePath);
            var imageUrl = "https://dl.dropboxusercontent.com/u/17279902/krktr/10037_10151293151069870_1984154632_n.jpg";

            request(imageUrl).pipe(imgStream);
            imgStream.on("close", done);
        });

        after(function (done) {
            fs.unlink(filePath, done);
        });

        it("should fail to upload with wrong credentials", function () {
            imageUploader = new FileUploader({
                key: "asdasdasdzcSDGSasd!24",
                secret: "asdazxczxcasd31asdQWT+Hasd2as",
                bucket: "kiosk_dev"
            });
            return expect(imageUploader.upload(filePath, s3Path)).to.be.rejected;
        });

        it("should fail to upload with wrong bucket name", function () {
            imageUploader = new FileUploader({
                key: secret.accessKey,
                secret: secret.secretKey,
                bucket: "non-existing-bucket"
            });
            return expect(imageUploader.upload(filePath, s3Path)).to.be.rejected;
        });

        it("should upload successfully", function (done) {
            var minS3Path = "https://s3.amazonaws.com/";
            imageUploader.upload(filePath, s3Path).then(function (url) {
                expect(url).to.be.a("string");
                expect(url).to.have.length.above(minS3Path.length);

                // download currently uploaded image
                request(url, function (err, response, body) {
                   if (err) {
                       done(err);
                   }
                   else {
                       expect(response.statusCode).to.equal(200);
                       expect(response.headers["content-type"]).to.equal("image/jpeg");
                       expect(response.headers['content-length']).to.above(0);
                       done();
                   }
                });
            });
        });

    });

});