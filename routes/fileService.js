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
var ObjectId = mongoose.Types.ObjectId;
var Gridfs = require('gridfs-stream');
var cp = require('child_process');
var path = require('path')
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var LOG = require('../util/wsLog');

var User = require('../models/User.js');
var Artifact = require('../models/Artifact.js');

var FILE_CONSTANT = {
    SMALL_IMAGE_WIDTH: 50,
    MID_IMAGE_WIDTH: 200,
    LARGE_IMAGE_WIDTH: 400,
    FINAL_DESIGN_WIDTH: 1600,
    FINAL_DESIGN_HEIGHT: 2000
};

module.exports = function(app) {

    uploadFile = function(req, res) {
        var db = mongoose.connection.db;

        // The native mongo driver which is used by mongoose
        var mongoDriver = mongoose.mongo;
        var gfs = new Gridfs(db, mongoDriver);

        var oFile = req.files.file;

        var writestream = gfs.createWriteStream({
            filename: req.body.data.fileName + '_' + req.files.file.name,
            mode:'w',
            content_type:req.files.file.mimetype,
            metadata:req.body,
        });
        fs.createReadStream(req.files.file.path).pipe(writestream);

        writestream.on('close', function (file) {
            // res.send({
            //     fileId: file._id.toString()
            // });

            createImageThumbnails(oFile, file, res);

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

    createImageThumbnails = function(oFile, oGFSFile, res) {
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
                        }, oGFSFile, res);
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

    saveArtifact = function(oArti, oGFSFile, res) {
        var sSmallBase64 = !!oArti.small ? oArti.small : '';
        var sMidBase64 = !!oArti.mid ? oArti.mid : '';
        var sLargeBase64 = !!oArti.large ? oArti.large : '';

        var oMetadata = JSON.parse(oGFSFile.metadata.data);
        var oCreatorObjectId = oMetadata.creatorId;
        var sFileName = oMetadata.fileName;
        var sAccess = 'private';
        if (oMetadata.access && oMetadata.access === 'public') {
            sAccess = 'public';
        }
        var oNewArti = new Artifact({
            fileId: oGFSFile._id.toString(),
            fileName: sFileName,
            creatorId: oCreatorObjectId,
            access: sAccess,
            smallImage64: 'data:image/png;base64,' + sSmallBase64,
            midImage64: 'data:image/png;base64,' + sMidBase64,
            largeImage64: 'data:image/png;base64,' + sLargeBase64,
        });

        oNewArti.save(function(err) {
            if (err) {
                LOG.logger.logFunc('saveArtifact', 'save new arti failed');
            } else {
                LOG.logger.logFunc('saveArtifact', 'save new arti successful!');

                res.send({
                    status: 'OK',
                    data: {
                        fileId: oGFSFile._id.toString(),
                        midImage64: 'data:image/png;base64,' + sMidBase64,
                        largeImage64: 'data:image/png;base64,' + sLargeBase64
                    }
                });
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
        
        var sUserId = req.query.userId;
        var oQuery = Artifact.find({'creatorId': sUserId});
        oQuery.select('_id fileId midImage64 largeImage64');
        oQuery.exec(function (err, aArtifact) {
            if (err) {
                res.send({error: err.message});
            } else {
                var oRet = {
                    data: []
                }
                if(!!aArtifact && aArtifact.length > 0) {
                    oRet.data = aArtifact;
                }
                res.send(oRet);
            }
        });
    };

    getPublicArtifactThumbnails = function(req, res) {
        var sType = req.query.artifactType;
        var db = mongoose.connection.db;
        var oFilter = {
            'access': 'public'
        };
        if (!!sType) {
            oFilter['type'] = sType;
        }
        var oQuery = Artifact.find(oFilter);
        oQuery.select('_id type fileId midImage64 largeImage64');
        oQuery.exec(function (err, aArtifact) {
            if (err) {
                res.send({error: err.message});
            } else {
                var oRet = {
                    data: []
                }
                if(!!aArtifact && aArtifact.length > 0) {
                    oRet.data = aArtifact;
                }
                res.send(oRet);
            }
        });
    };

    createCustomDesign = function(req, res) {
        var oData = req.body.data;

        oData = {
            userId: 'asdf',
            artifacts:[
                {
                    fileId: '552fb66a8903900c7bea3edb',
                    relativeWidth: 0.6,
                    relativeTop: 0.1,
                    relativeLeft: 0.1
                },
                {
                    fileId: '5533745c6ce76dc029da49a2',
                    relativeWidth: 0.6,
                    relativeTop: 0.5,
                    relativeLeft: 0.2
                },
                {
                    fileId: '5533746e6ce76dc029da49ca',
                    relativeWidth: 0.6,
                    relativeTop: 0.3,
                    relativeLeft: 0.5
                },
            ]
        };

        if (!oData.artifacts || oData.artifacts.length < 1) {
            LOG.logger.logFunc('createCustomDesign', 'artifacts length illegal!');
            res.send({error: 'artifacts length illegal!'});
            return;
        }

        // var sOutParam = 'img/female_black.png -geometry 100x200-20+5 -composite ' + 
        //     'img/female_white -geometry 100x200+350+5 -composite img/test.png';
        // gm(400, 500, "#00ff55aa").options({imageMagick: true})
        // .command('composite')
        // .geometry('100x200+20+5')
        // .in('img/female_black.png')
        // .command('composite')
        // .geometry('100x200+200+5')
        // .in('img/female_white.png')
        // .write('img/test.png', function(err) {
        //     if (!err) {
        //         console.log('Success!!!!');
        //     }
        // });
        oData.requestedTime = new Date().getTime();
        fs.mkdirSync('img/' + oData.requestedTime);

        var sOutParam2 = '-size 400x500 xc:none img/female_black.png -geometry 10%x-50+5 -composite ' + 
        'img/female_white.png -geometry 10%x+350+5 -composite img/test.png';

        var sOutParam = '-size ' + FILE_CONSTANT.FINAL_DESIGN_WIDTH + 'x' + FILE_CONSTANT.FINAL_DESIGN_HEIGHT + ' xc:none ';

        for (var i = 0; i < oData.artifacts.length; i++) {
            var oCurArti = oData.artifacts[i];
            sOutParam += 'img/' + oData.requestedTime + '/' + oCurArti.fileId + '.jpg'
            sOutParam += ' -geometry ';
            sOutParam += oCurArti.relativeWidth * FILE_CONSTANT.FINAL_DESIGN_WIDTH;
            sOutParam += 'x';

            if (oCurArti.relativeLeft < 0) {
                sOutParam += '-';
            } else {
                sOutParam += '+';
            }
            sOutParam += oCurArti.relativeLeft * FILE_CONSTANT.FINAL_DESIGN_WIDTH;

            if (oCurArti.relativeTop < 0) {
                sOutParam += '-';
            } else {
                sOutParam += '+';
            }
            sOutParam += oCurArti.relativeTop * FILE_CONSTANT.FINAL_DESIGN_HEIGHT;
            sOutParam += ' -composite ';
        }
        sOutParam += 'img/' + oData.requestedTime + '/' + 'final.png';

        var db = mongoose.connection.db;
        var mongoDriver = mongoose.mongo;
        var gfs = new Gridfs(db, mongoDriver);

        var iCount = 0;

        for (var i = 0; i < oData.artifacts.length; i++) {
            var sFileId = oData.artifacts[i].fileId;

            // gfs.exist({
            //     _id: sFileId
            // }, function(err, found) {
            //     if (err) {
            //         LOG.logger.logFunc('gfs.exist error');
            //     } else {
            //         if (found) {
            //             var readstream = gfs.createReadStream({
            //                 _id: sFileId
            //             });
            //         }
            //     }

            // });

            var readstream = gfs.createReadStream({
                _id: sFileId
            });

            readstream.on('error', function(err) {
                console.log(err);
            });

            var sPath = 'img/' + oData.requestedTime + '/' + sFileId + '.jpg';
            var writestream = fs.createWriteStream(sPath);

            writestream.on('close', function() {
                console.log('one file closed.' + sPath);
                iCount++;
                console.log(iCount);
                if (iCount === oData.artifacts.length) {
                    var curDir = path.resolve(process.cwd(), '.');
                    console.log(curDir);
                    cp.exec('convert ' + sOutParam, {cwd: curDir}, function(err, stdout, stderr) {
                        if (!err) {
                            console.log('Success!!!!');
                            res.send({data: 'custom design created successfully.'});
                        } else {
                            res.send({error: err});
                            console.log('stdout: ' + stdout);
                            console.log('stderr: ' + stderr);
                        }
                    });
                }
            });
            writestream.on('error', function() {
                console.log('one file error.');
            });
            readstream.pipe(writestream);
        }

        // var curDir = path.resolve(process.cwd(), '.');
        // console.log(curDir);
        // cp.exec('convert ' + sOutParam2, {cwd: curDir}, function(err, stdout, stderr) {
        //     if (!err) {
        //         console.log('Success!!!!');
        //         res.send({data: 'custom design created successfully.'});
        //     } else {
        //         res.send({error: err});
        //         console.log('stdout: ' + stdout);
        //         console.log('stderr: ' + stderr);
        //     }
        // });
        
    };

    // prepareSourceArtifact = function(aArtifact) {
    //     if (!aArtifact || aArtifact.length < 1) {
    //         return null;
    //     }


    // };

    downloadDesignFile = function(sFiled, res) {
        var db = mongoose.connection.db;

        // The native mongo driver which is used by mongoose
        var mongoDriver = mongoose.mongo;
        var gfs = new Gridfs(db, mongoDriver);

        //var oFileId = new ObjectID(sFiled);

        var readstream = gfs.createReadStream({
            _id: sFiled
        });

        res.setHeader("content-type", "application/octet-stream");
        res.setHeader("content-disposition", "attachment; filename=text.png");
        //res.setHeader("content-encoding", "gzip");
        readstream.pipe(res);

        // var bufs = [];
        // readstream.on('data', function(d){
        //     bufs.push(d);
        // });
        // readstream.on('end', function(){
        //     var buf = Buffer.concat(bufs);
        //     res.send(buf);
        // });

        // res.on('data', function(data) {  
        //         file.write(data);  
        //     }).on('end', function() {  
        //         file.end();  
        //         console.log(file_name + ' downloaded to ' + DOWNLOAD_DIR);  
        //     });  
        // });
    };

    deleteArtifact = function(req, res) {
        LOG.logger.logFunc('deleteArtifact');
        var oReqData = req.body.data;
        var sArtifactId = oReqData.artifactId;
        Artifact.findById(sArtifactId, function(err, artifact) {
            if (!artifact) {
                LOG.logger.logFunc('deleteArtifact', 'artifact id:' + sArtifactId + ' not found.');
                res.statusCode = 404;
                return res.send({
                    error : 'Target artifact not found'
                });
            }

            var sArtifactFileId = oReqData.artifactFileId;

            var db = mongoose.connection.db;
            var mongoDriver = mongoose.mongo;
            var gfs = new Gridfs(db, mongoDriver);
            gfs.remove({
                _id: artifact.fileId
            }, function (err) {
                if (err) {
                    LOG.logger.logFunc('deleteArtifact', 'delete artifact source image file with id:' + sArtifactFileId + 
                        ' failed. Error message: ' + err.message);
                    res.send({
                        error : 'Delete artifact image file failed.'
                    });
                }
                
                artifact.remove(function(err) {
                    if (!err) {
                        console.log('Removed tshirt');
                        return res.send({
                            status : 'OK',
                            data: {
                                removedArtifactId: sArtifactId
                            }
                        });
                    } else {
                        res.statusCode = 500;
                        LOG.logger.logFunc('deleteArtifact', 'delete artifact with id:' + sArtifactId + 
                        ' failed. Error message: ' + err.message);
                        return res.send({
                            error : err.message
                        });
                    }
                })
            });
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
        } else if (sAction === 'getPublicArtifactThumbnails') {
            LOG.logger.logFunc('getPublicArtifactThumbnails');
            getPublicArtifactThumbnails(req, res);
        } else if (sAction === 'downloadDesignFile') {
            LOG.logger.logFunc('downloadDesignFile');
            var sFileId = req.query.designFileId;
            downloadDesignFile(sFileId, res);
        }
    };

    postService = function(req, res) {
        var sAction = req.body.action;
        if (sAction === 'createCustomDesign') {
            LOG.logger.logFunc('createCustomDesign');
            createCustomDesign(req, res);
        } else if (sAction === 'deleteArtifact') {
            deleteArtifact(req, res);
        } else {
            res.send({error: 'Funtion not implemented.'});
        }
    };

    //Link routes and actions
    app.post('/uploadFile', multipartMiddleware, uploadFile);
    app.get('/file', getService);
    app.post('/file', postService);
};