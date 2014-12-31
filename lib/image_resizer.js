var Promise = require("bluebird");
var gm = require("gm");
var Hoek = require("hoek");

var defaults = {
    width: 500,
    height: 500,
    resizeOption: "!",
    quality: 90,
    resizeTo: null
};

var ImageResizer = function (imagePathOrStream, options) {
    this.options = Hoek.applyToDefaults(defaults, options || {});
    // if stream option available
    if (this.options.resizeStream) {
        // set image stream
        this.imageStream = imagePathOrStream;
    }
    else {
        // set image path
        this.imagePath = imagePathOrStream;
    }

};

/**
 * @returns {Promise} filePath Path of the resized file
 */
ImageResizer.prototype.resize = function () {
    var self = this;
    return new Promise(function (resolve, reject) {
        // if stream option available
        if (self.options.resizeStream) {
            resolve(gm(self.imageStream)
                .options({imageMagick: true, bufferStream: true})
                .resize(self.options.width, self.options.height, self.options.resizeOption)
                .quality(self.options.quality)
                .setFormat(self.options.resizeTo)
                .stream());
        }
        else {
            if(self.options.resizeOption == "^") {
                gm(self.imagePath)
                    .options({imageMagick: true})
                    .resize(self.options.width, self.options.height, self.options.resizeOption)
                    .gravity("Center")
                    .crop(self.options.width, self.options.height, 0, 0)
                    .quality(self.options.quality)
                    .write(self.imagePath, function (err) {
                        if (err) {
                            reject(err);
                        }
                        else {
                            resolve(self.imagePath);
                        }
                    });
            }
            else {
                gm(self.imagePath)
                    .options({imageMagick: true})
                    .resize(self.options.width, self.options.height, self.options.resizeOption)
                    .quality(self.options.quality)
                    .write(self.imagePath, function (err) {
                        if (err) {
                            reject(err);
                        }
                        else {
                            resolve(self.imagePath);
                        }
                    });
            }

        }
    });
};

module.exports = ImageResizer;