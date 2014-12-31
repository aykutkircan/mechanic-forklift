var Hoek = require("hoek");
var Forklift = require("./index");
var Promise = require("bluebird");
var Fs = Promise.promisifyAll(require("fs"));
var secret = require("./config/secret");

var timerObj = new Hoek.Timer();

var imagePath = "/home/cagdas/Dropbox/karikatür/5306_540987506026686_2765585546971634349_n.jpg";
var imageStream = Fs.createReadStream(imagePath);
Fs.statAsync(imagePath).then(function (stat) {
    console.log("stat hazir");
    var imageLifter = Forklift.liftImageStream(imageStream, "img/test-image-stream.jpg", {
        size: {
            quality: 75, //default
            width: 500,
            height: 300,
            resizeOption: "!" // default
        },
        upload: {
            key: secret.accessKey,
            secret: secret.secretKey,
            bucket: "kiosk_dev"
        },
        content: {
            length: stat.size,
            type: "image/jpeg"
        },
        remove: false // default true
    });

    imageLifter.then(function (url) {
        if (url) {
            console.log(url);
            console.log("Success!");
            console.log("Elapsed time from initialization: " + timerObj.elapsed() + ' milliseconds');
        }
        else {
            console.log("why??");
        }
    }).catch(function (err) {
        console.log("S3 Image Upload Error or sth else:", err);
    });
});

var readStream = Fs.createReadStream('/home/cagdas/database_backups/zorlu_25062014.gz');
Fs.statAsync("/home/cagdas/database_backups/zorlu_25062014.gz").then(function (stat) {

    var fileLifter = Forklift.liftVideoStream(readStream, "db/test_backup.gz", {
        upload: {
            key: secret.accessKey,
            secret: secret.secretKey,
            bucket: "kiosk_dev"
        },
        content: {
            length: stat.size,
            type: "application/gzip"
        },
        remove: false // default true
    });

    fileLifter.then(function (url) {
        if (url) {
            console.log(url);
            console.log("Success!");
            console.log("Elapsed time from initialization: " + timerObj.elapsed() + ' milliseconds');
        }
        else {
            console.log("why??");
        }
    }).catch(function (err) {
        console.log("S3 File Upload Error or sth else:", err);
    });


});