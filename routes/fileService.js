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

module.exports = function(app) {

    uploadFile = function(req, res) {
        var db = mongoose.connection.db;

        // The native mongo driver which is used by mongoose
        var mongoDriver = mongoose.mongo;
        var gfs = new Gridfs(db, mongoDriver);

        var file = req.files.file;

        var writestream = gfs.createWriteStream({
            filename: req.files.file.name,
            mode:'w',
            content_type:req.files.file.mimetype,
            metadata:req.body,
        });
        fs.createReadStream(req.files.file.path).pipe(writestream);

        writestream.on('close', function (file) {
            res.send("Success!");
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

    //Link routes and actions
    app.post('/uploadFile', multipartMiddleware, uploadFile);
};