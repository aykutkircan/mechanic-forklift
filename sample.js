var Hoek = require("hoek");
var Forklift = require("./index");
var Promise = require("bluebird");

var secret = require("./config/secret");

var timerObj = new Hoek.Timer();

var imagePath = "test/images/karikatur-1.jpg";
var imageLifter = Forklift.liftImage(imagePath, "img/test.jpg", {
    size: {
        width: 500,
        height: 300,
        resizeOption: "!" // default
    },
    upload: {
        key: secret.accessKey,
        secret: secret.secretKey,
        bucket: "kiosk_dev",
        public: false
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
/*
var fileLifter = Forklift.liftFile("/home/cagdas/database_backups/zorlu_25062014.gz", "db/test_backup.gz", {
    upload: {
        key: secret.accessKey,
        secret: secret.secretKey,
        bucket: "kiosk_dev"
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
*/