/**
 *
 * @File: forklift.js
 * @Description: Forklift Test File
 * @Reference: http://chaijs.com/api/bdd/
 *
 */

var chai = require("chai");
var expect = chai.expect;

var fs = require("fs");
var Path = require("path");
var request = require("request");
var _ = require("lodash");
var gm = require("gm");

var Forklift = require("../lib/forklift");
var secret = require("../config/secret");

describe("Forklift", function () {

    var imageDirectory = Path.join(process.cwd(), "test/images");
    var options;
    var filePath = Path.join(imageDirectory, "forklift_test.jpg");
    var s3Path = "images/forklift_test.jpg";

    beforeEach(function (done) {
        options = {
            size: {
                width: 600,
                height: 600
            },
            upload: {
                key: secret.accessKey,
                secret: secret.secretKey,
                bucket: "kiosk_dev"
            }
        };

        // image download
        var imgStream = fs.createWriteStream(filePath);
        var imageUrl = "https://dl.dropboxusercontent.com/u/17279902/krktr/10037_10151293151069870_1984154632_n.jpg";

        request(imageUrl).pipe(imgStream);
        imgStream.on("close", done);
    });

    it("should fail to upload with missing S3 config", function () {
        _.merge(options, {
            upload: null
        });

        Forklift.uploadFile(filePath, s3Path, options, (error, remoteUrl) => {

            expect(error).to.not.exist;
            expect(remoteUrl).to.exist;
            done();
        });
    });

    it("should remove image after upload as default", function (done) {

        Forklift.uploadFile(filePath, s3Path, options, (error, remoteUrl) => {

            expect(error).to.not.exist;
            fs.exists(filePath, function (exists) {
                expect(exists).to.be.false;
                done();
            });
        });
    });

    it("should not remove image after upload if said so", function (done) {
        _.merge(options, {
            remove: false
        });

        Forklift.liftImage(filePath, s3Path, options).then(function () {
            fs.exists(filePath, function (exists) {
                expect(exists).to.be.true;
                done();
            });
        });
    });

    it("should upload image with given resolution 600x600", function (done) {
        Forklift.liftImage(filePath, s3Path, options).then(function (url) {
            // download currently uploaded image
            gm(request(url)).options({imageMagick: true})
                .size({bufferStream: true}, function (err, size) {
                    expect(err).to.not.exist;
                    expect((size.width == size.height) && (size.width == 600)).to.be.ok;
                    done();
                });

        });
    });
});