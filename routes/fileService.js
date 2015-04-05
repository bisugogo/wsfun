/**
 * File service
 *
 * @module      :: Routes
 * @description :: Maps routes and actions
 */

//var User = require('../models/User.js');

var mongoose = require('mongoose');
var fs = require('fs');
var gm = require('gm');
var Gridfs = require('gridfs-stream');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var LOG = require('../util/wsLog');

var User = require('../models/User.js');
var Artifact = require('../models/Artifact.js');

var FILE_CONSTANT = {
    SMALL_IMAGE_WIDTH: 50,
    MID_IMAGE_WIDTH: 100,
    LARGE_IMAGE_WIDTH: 400
};

module.exports = function(app) {

    uploadFile = function(req, res) {
        var db = mongoose.connection.db;

        // The native mongo driver which is used by mongoose
        var mongoDriver = mongoose.mongo;
        var gfs = new Gridfs(db, mongoDriver);

        var oFile = req.files.file;

        var writestream = gfs.createWriteStream({
            filename: req.body.data.fileName + req.files.file.name,
            mode:'w',
            content_type:req.files.file.mimetype,
            metadata:req.body,
        });
        fs.createReadStream(req.files.file.path).pipe(writestream);

        writestream.on('close', function (file) {
            res.send({
                fileId: file._id.toString()
            });

            createImageThumbnails(oFile, file._id.toString());

            // fs.unlink(req.files.file.path, function (err) {
            //     if (err) console.error("Error: " + err);
            //     console.log('successfully deleted : '+ req.files.file.path );
            //     //res.send({status:'ended????'});
            // });
        });

        console.log(oFile.name);
        console.log(oFile.type);
        //console.log(JSON.stringify(file));
        //res.send({status:'ended????'});
    };

    createImageThumbnails = function(oFile, sGFSId) {
        gm(oFile.path).options({imageMagick: true}).size(function (err, size) {
            if (!err) {
                var iOriginHeight = size.height;
                var iOriginWidth = size.width;

                var ratio = iOriginHeight / iOriginWidth;
                var iMidTargetWidth = FILE_CONSTANT.MID_IMAGE_WIDTH;
                var iMidTargetHeight = Math.round(ratio * iMidTargetWidth);

                gm(oFile.path).options({imageMagick: true}).resize(iMidTargetWidth, iMidTargetHeight).toBuffer(function(err, buffer) {
                    var sMidBase64 = buffer.toString('base64');
                    console.log("sMidBase64 length: " + sMidBase64.length);

                    var iLargeTargetWidth = FILE_CONSTANT.LARGE_IMAGE_WIDTH;
                    var iLargeTargetHeight = Math.round(ratio * iLargeTargetWidth);
                    gm(oFile.path).options({imageMagick: true}).resize(iLargeTargetWidth, iLargeTargetHeight).toBuffer(function(err, buffer) {
                        var sLargeBase64 = buffer.toString('base64');
                        console.log("sLargeBase64 length: " + sLargeBase64.length);

                        unlinkUploadFile(oFile);

                        saveArtifact({
                            mid: sMidBase64,
                            large: sLargeBase64
                        }, sGFSId);
                    });
                });
            } else {
                console.log(err.message);
            }
        });
    };

    unlinkUploadFile = function(oFile) {
        fs.unlink(oFile.path, function (err) {
            if (err) console.error("Error: " + err);
            console.log('successfully deleted : '+ oFile.path );
            //res.send({status:'ended????'});
        });
    };

    saveArtifact = function(oArti, sGFSId) {
        var sSmallBase64 = !!oArti.small ? oArti.small : '';
        var sMidBase64 = !!oArti.mid ? oArti.mid : '';
        var sLargeBase64 = !!oArti.large ? oArti.large : '';

        var oNewArti = new Artifact({
            fileId: sGFSId,
            smallImage64: sSmallBase64,
            midImage64: sMidBase64,
            largeImage64: sLargeBase64,
        });

        oNewArti.save(function(err) {
            if (err) {
                LOG.logger.logFunc('saveArtifact', 'save new arti failed');
            } else {
                LOG.logger.logFunc('saveArtifact', 'save new arti successful!');
            }
        });
    }
    
    getFileContent = function(req, res) {
        console.log("file get service: getFileContent");
        var sFileId = req.query.fileId;

        /*var db = mongoose.connection.db;

        // The native mongo driver which is used by mongoose
        var mongoDriver = mongoose.mongo;
        var gfs = new Gridfs(db, mongoDriver);
        var readStream = gfs.createReadStream({
            _id: sFileId
        });

        readStream.setEncoding('base64');

        var buffer = '';
        readStream.on("data", function (chunk) {
            buffer += chunk;
        });

        // dump contents to console when complete
        readStream.on("end", function () {
            //var sBase64 = new Buffer(buffer).toString('base64');
            console.log("contents of file:\n\n", buffer);
            res.send({
                data: buffer
            });
        });*/

        var oQuery = Artifact.findOne({fileId: sFileId});
        oQuery.select('_id fileId midImage64 largeImage64');
        oQuery.exec(function (err, person) {
            if (err) {
                res.send({error: err.message});
            } else {
                res.send({data: person});
            }
        });
    };

    getMyArtifactThumbnails = function(req, res) {
        var db = mongoose.connection.db;

        // The native mongo driver which is used by mongoose
        // var mongoDriver = mongoose.mongo;
        // var gfs = new Gridfs(db, mongoDriver);
        // var readStream = gfs.createReadStream({
        //     _id: sFileId
        // });

        // readStream.setEncoding('base64');

        // var buffer = '';
        // readStream.on("data", function (chunk) {
        //     buffer += chunk;
        // });

        // // dump contents to console when complete
        // readStream.on("end", function () {
        //     //var sBase64 = new Buffer(buffer).toString('base64');
        //     console.log("contents of file:\n\n", buffer);
        //     res.send({
        //         data: buffer
        //     });
        // });
        res.send({
            data: "OK"
        });
    };
    
    getService = function(req, res) {
        var sAction = req.query.action;
        if (sAction === 'getFileContent') {
            console.log("********************");
            console.log("file get service: getFileContent");
            console.log("********************");

            getFileContent(req, res);
        } else if (sAction === 'getMyArtifactThumbnails') {
            LOG.logger.logFunc('getMyArtifactThumbnails');
            getMyArtifactThumbnails(req, res);
        }
    };

    //Link routes and actions
    app.post('/uploadFile', multipartMiddleware, uploadFile);
    app.get('/file', getService);
};