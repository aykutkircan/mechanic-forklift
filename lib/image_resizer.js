/**
 * Resize image with given value.
 */

"use strict";

const Gm = require("gm").subClass({imageMagick: true});
const Joi = require("joi");

//const defaults = {
//    width: 500,
//    height: 500,
//    resizeOption: "!",
//    quality: 90,
//    resizeTo: null
//};

const optionSchema = Joi.object().keys({

    width: Joi.number().integer().min(1).required(),
    height: Joi.number().integer().min(1).required(),
    quality: Joi.number().integer().min(20).max(100).optional().default(90),
    resizeOption: Joi.string().optional().default("!"),
    resizeTo: Joi.string().optional().default("jpg"),
    crop: Joi.boolean().optional().default(false)
});

class ImageResizer {

    /**
     * @param options
     */
    constructor(options) {

        const validation = Joi.validate(options, optionSchema);
        if (validation.error) {
            throw validation.error;
        }

        this.options = validation.value;

    }

    /**
     *
     * @param {string} imagePath
     * @param callback
     */
    resize(imagePath, callback) {

        const gmWorker = Gm(imagePath)
            .resize(this.options.width, this.options.height, this.options.resizeOption)
            .gravity("Center")
            .quality(this.options.quality);

        if (this.options.crop) {
            gmWorker.extent(this.options.width, this.options.height)
        }

        if (this.options.resizeTo) {
            gmWorker.setFormat(this.options.resizeTo)
        }

        gmWorker.write(this.imagePath, (error) => {
            if (error) {
                return callback(error);
            }
            return callback(this.imagePath);
        });
    }

}

module.exports = ImageResizer;