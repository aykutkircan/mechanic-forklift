/**
 *
 * @File: image_resizer.js
 * @Description: Image Resizer Test File
 * @Reference: http://chaijs.com/api/bdd/
 *
 */

var chai = require("chai");
chai.use(require("chai-as-promised"));
var expect = chai.expect;

var Promise = require("bluebird");
var fs = require("fs");
var Path = require("path");
var gm = require("gm");
var request = require("request");

var ImageResizer = require("../../lib/image_resizer");

describe("Image Resizer", function () {
    var imageDirectory = Path.join(process.cwd(), "test/images");

    it("should fail to resize a non-existing file", function () {
        var filePath = Path.join(imageDirectory, "non-existing.jpg");
        var imageResizer = new ImageResizer(filePath);
        return expect(imageResizer.resize()).to.be.rejected;
    });

    describe("Resizing with downloaded files", function () {
        var filePath = Path.join(imageDirectory, "resize_test.jpg");

        beforeEach(function (done) {
            var imgStream = fs.createWriteStream(filePath);
            // image resolution is 398x480
            var imageUrl = "https://dl.dropboxusercontent.com/u/17279902/krktr/3726_10151244459834870_1142555782_n.jpg";

            request(imageUrl).pipe(imgStream);
            imgStream.on("close", done);
        });

        afterEach(function (done) {
            fs.unlink(filePath, done);
        });

        it("should resize to 500x500 as default", function(done) {
            var imageResizer = new ImageResizer(filePath);
            imageResizer.resize().then(function () {
                gm(filePath).options({imageMagick: true})
                    .size(function (err, size) {
                        expect(err).to.not.exist;
                        expect((size.width == size.height) && (size.width == 500)).to.be.ok;
                        done();
                    });
            });
        });

        it("should resize to 600x400!", function(done) {
            var imageResizer = new ImageResizer(filePath, {
                width: 600,
                height: 400
            });
            imageResizer.resize().then(function () {
                gm(filePath).options({imageMagick: true})
                    .size(function (err, size) {
                        expect(err).to.not.exist;
                        expect((size.width == 600) && (size.height == 400)).to.be.ok;
                        done();
                    });
            });
        });

        it("should resize to 200x200^", function(done) {
            var imageResizer = new ImageResizer(filePath, {
                width: 200,
                height: 200,
                resizeOption: "^"
            });
            imageResizer.resize().then(function () {
                gm(filePath).options({imageMagick: true})
                    .size(function (err, size) {
                        expect(err).to.not.exist;
                        // image should be resized to fit one of width or height
                        expect((size.width == 200) || (size.height == 200)).to.be.ok;
                        done();
                    });
            });
        });
    });


});