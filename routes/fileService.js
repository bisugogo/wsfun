/**
 * File service
 *
 * @module      :: Routes
 * @description :: Maps routes and actions
 */

//var User = require('../models/User.js');

var mongoose = require('mongoose');
var fs = require('fs');
var Gridfs = require('gridfs-stream');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var LOG = require('../util/wsLog');

module.exports = function(app) {

    uploadFile = function(req, res) {
        var db = mongoose.connection.db;

        // The native mongo driver which is used by mongoose
        var mongoDriver = mongoose.mongo;
        var gfs = new Gridfs(db, mongoDriver);

        var file = req.files.file;

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
            fs.unlink(req.files.file.path, function (err) {
                if (err) console.error("Error: " + err);
                console.log('successfully deleted : '+ req.files.file.path );
                //res.send({status:'ended????'});
            });
        });

        console.log(file.name);
        console.log(file.type);
        console.log(JSON.stringify(file));
        //res.send({status:'ended????'});
    };
    
    getFileContent = function(req, res) {
        console.log("file get service: getFileContent");
        var sFileId = req.query.fileId;

        var db = mongoose.connection.db;

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