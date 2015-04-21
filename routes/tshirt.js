/**
 * Tshirt
 * 
 * @module :: Routes
 * @description :: Maps routes and actions
 */

var Design = require('../models/tshirt.js');
var Order = require('../models/order.js');
var User = require('../models/User.js');

var mongoose = require('mongoose');
var fs = require('fs');
var gm = require('gm');
var Gridfs = require('gridfs-stream');
var cp = require('child_process');
var path = require('path')
var LOG = require('../util/wsLog');

var FILE_CONSTANT = {
    SMALL_IMAGE_WIDTH: 50,
    MID_IMAGE_WIDTH: 300,
    LARGE_IMAGE_WIDTH: 400,
    FINAL_DESIGN_WIDTH: 1600,
    FINAL_DESIGN_HEIGHT: 2000
};

module.exports = function(app) {

    /**
     * Find and retrieves all tshirts
     * 
     * @param {Object} req HTTP request object.
     * @param {Object} res HTTP response object.
     */
    findAllTshirts = function(req, res) {
        console.log("GET - /tshirts_getAllDesigns");
        return Design.find(function(err, aDesign) {
            if (!err) {
                return res.send({
                    status : 'OK',
                    designList : aDesign
                });
            } else {
                res.statusCode = 500;
                console.log('Internal error(%d): %s', res.statusCode, err.message);
                return res.send({
                    error : 'Server error'
                });
            }
        });
    };

    getMyDesigns = function(sUserId, res) {
        console.log("GET - /tshirts_getMyDesigns");
        /*
         * return Design.find({creatorId: sUserId}, function(err, aDesign) { if(!err) { return res.send({ status: 'OK',
         * designList: aDesign }); } else { res.statusCode = 500; console.log('Internal error(%d):
         * %s',res.statusCode,err.message); return res.send({ error: 'Server error' }); } });
         */

        return Design.find().populate('creatorId').find({
            access : 'public'
        }).exec(function(err, aDesign) {
            if (!err) {
                return res.send({
                    status : 'OK',
                    designList : aDesign
                });
            } else {
                res.statusCode = 500;
                console.log('Internal error(%d): %s', res.statusCode, err.message);
                return res.send({
                    error : 'Server error'
                });
            }
        });
    };

    /**
     * Find and retrieves a single tshirt by its ID
     * 
     * @param {Object} req HTTP request object.
     * @param {Object} res HTTP response object.
     */
    findById = function(sDesignId, res) {

        //console.log("GET - /tshirt/:id");
        return Design.findById(sDesignId, function(err, oDesign) {

            if (!oDesign) {
                res.statusCode = 404;
                return res.send({
                    error : 'Not found'
                });
            }

            if (!err) {
                return res.send({
                    status : 'OK',
                    designDetail : oDesign
                });
            } else {

                res.statusCode = 500;
                console.log('Internal error(%d): %s', res.statusCode, err.message);
                return res.send({
                    error : 'Server error'
                });
            }
        });
    };

    /**
     * Creates a new tshirt from the data request
     * 
     * @param {Object} req HTTP request object.
     * @param {Object} res HTTP response object.
     */
    createDesign = function(oData, res) {

        console.log('POST - /tshirt');

        if (!oData.artifacts || oData.artifacts.length < 1) {
            LOG.logger.logFunc('createCustomDesign', 'artifacts length illegal!');
            res.send({
                error : 'artifacts length illegal!'
            });
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

        var sOutParam2 = '-size 400x500 xc:none img/female_black.png -geometry 10%x-50+5 -composite '
            + 'img/female_white.png -geometry 10%x+350+5 -composite img/test.png';

        var sOutParam = '-size ' + FILE_CONSTANT.FINAL_DESIGN_WIDTH + 'x' + FILE_CONSTANT.FINAL_DESIGN_HEIGHT +
            ' xc:none ';

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
                _id : sFileId
            });

            readstream.on('error', function(err) {
                console.log(err);
            });

            var sPath = 'img/' + oData.requestedTime + '/' + sFileId + '.jpg';
            var writestream = fs.createWriteStream(sPath);

            var sFinalDesignImagePath = 'img/' + oData.requestedTime + '/' + 'final.png';

            writestream.on('close', function() {
                console.log('one file closed.' + sPath);
                iCount++;
                console.log(iCount);
                if (iCount === oData.artifacts.length) {
                    var curDir = path.resolve(process.cwd(), '.');
                    console.log(curDir);
                    cp.exec('convert ' + sOutParam, {
                        cwd : curDir
                    }, function(err, stdout, stderr) {
                        if (!err) {
                            console.log('Success!!!!');

                            saveDesignFile(res, oData, sFinalDesignImagePath);

                            // res.send({
                            //     data : 'custom design created successfully.'
                            // });
                        } else {
                            res.send({
                                error : err
                            });
                            console.log('stdout: ' + stdout);
                            console.log('stderr: ' + stderr);
                        }
                    });
                }
            });
            writestream.on('error', function(err) {
                console.log('one file error.');
            });
            readstream.pipe(writestream);
        }

        function saveDesignFile(oRes, oData, sFilePath) {
            var db = mongoose.connection.db;
            var mongoDriver = mongoose.mongo;
            var gfs = new Gridfs(db, mongoDriver);

            var ratio = 1.25;
            var iMidTargetWidth = FILE_CONSTANT.MID_IMAGE_WIDTH;
            var iMidTargetHeight = Math.round(ratio * iMidTargetWidth);

            var writestream = gfs.createWriteStream({
                filename: sFilePath,
                mode:'w',
                content_type:'binary/octet-stream',
                metadata:{
                    type: 'designImage'
                },
            });
            fs.createReadStream(sFilePath).pipe(writestream);

            writestream.on('close', function (oGridFsFile) {
                gm(sFilePath).options({imageMagick: true})
                .resize(iMidTargetWidth, iMidTargetHeight).toBuffer(function(err, buffer) {
                    if (err) {
                        oRes.send({
                            error: err,
                            msg: 'create final design image thumbnail failed.'
                        });
                    }

                    deleteFolderRecursive('img/' + oData.requestedTime);

                    var sMidBase64 = buffer.toString('base64');
                    console.log("sMidBase64 length: " + sMidBase64.length);

                    var sImgBase64 = 'data:image/png;base64,' + sMidBase64
                    saveDesign(oRes, oData, sImgBase64, oGridFsFile._id);
                    
                });
            });

            writestream.on('error', function(err) {
                LOG.logger.logFunc('createDesign', 'saveDesignFile GridFs failed.');
                oRes.send({
                    error: 'createDesign -> saveDesignFile GridFs failed.'
                });
            });
        }

        function saveDesign(oRes, oData, sDesignBase64, sDesignFileId) {
            var design = new Design({
                creatorId : oData.creatorId,
                color : oData.color,
                price : oData.price,
                desc : oData.desc,
                access : oData.access,
                previewImage64 : sDesignBase64,
                designFileId : sDesignFileId
            });

            design.save(function(err) {

                if (err) {

                    console.log('Error while saving tshirt: ' + err);
                    oRes.send({
                        error : err
                    });
                    return;

                } else {

                    console.log("design created");
                    return oRes.send({
                        status : 'OK',
                        tshirt : design
                    });

                }

            });
        }

        function deleteFolderRecursive(path) {
          if( fs.existsSync(path) ) {
            fs.readdirSync(path).forEach(function(file,index){
              var curPath = path + "/" + file;
              console.log(curPath);
              if(fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
              } else { // delete file
                fs.unlinkSync(curPath);
              }
            });
            fs.rmdirSync(path);
          }
        }
    };

    createOrder = function(data, res) {

        console.log('POST - /tshirt___createOrder');

        var sDesignId = data.designId;

        var oNewOrder = {
            creatorId : data.creatorId,
            femalePrice : data.femalePrice,
            malePrice : data.malePrice,
            kidPrice : data.kidPrice,
            totalPrice : data.totalPrice,
            maleSize : data.maleSize,
            maleQuantity : data.maleQuantity,
            femaleSize : data.femaleSize,
            femaleQuantity : data.femaleQuantity,
            kidSize : data.kidSize,
            kidQuantity : data.kidQuantity
        };

        Design.findById(sDesignId, function(err, oDesign) {
            if (!err) {
                console.log('Create order: found target design');
                oDesign.orders.push(oNewOrder);
                oDesign.save(function(err) {
                    // do something
                    if (err) {
                        console.log('Create order: save new order error' + err);
                        res.send({
                            error : err
                        });
                        return;
                    } else {
                        console.log("Order created");
                        return res.send({
                            status : 'OK',
                            order : oNewOrder
                        });
                    }
                });
            } else {
                console.log('Create order: target design not found!');
                res.send({
                    error : err
                });
                return;
            }
        });
    };

    getMyOrders = function(sUserId, res) {
        console.log("GET - /tshirts_getMyOrders");
        return Design.find({
            'orders.creatorId' : sUserId
        }).select('_id desc orders').exec(function(err, aDesign) {
            if (!err) {
                var aList = [];
                for (var i = 0; i < aDesign.length; i++) {
                    var oDesign = aDesign[i];
                    aList.push({
                        designId : oDesign._id,
                        desc : oDesign.desc,
                        orders : []
                    });
                    for (var j = 0; j < oDesign.orders.length; j++) {
                        var oOrder = oDesign.orders[j];
                        if (oOrder.creatorId === sUserId) {
                            aList[i].orders.push(oOrder);
                        }
                    }
                    ;
                }
                ;
                return res.send({
                    status : 'OK',
                    orderList : aList
                });
            } else {
                res.statusCode = 500;
                console.log('Internal error(%d): %s', res.statusCode, err.message);
                return res.send({
                    error : 'Server error'
                });
            }
        });
    };

    /**
     * Update a tshirt by its ID
     * 
     * @param {Object} req HTTP request object.
     * @param {Object} res HTTP response object.
     */
    updateTshirt = function(req, res) {

        console.log("PUT - /tshirt/:id");
        return Design.findById(req.params.id, function(err, tshirt) {

            if (!tshirt) {
                res.statusCode = 404;
                return res.send({
                    error : 'Not found'
                });
            }

            if (req.body.model != null)
                tshirt.model = req.body.model;
            if (req.body.price != null)
                tshirt.price = req.body.price;
            if (req.body.style != null)
                tshirt.style = req.body.style;
            if (req.body.size != null)
                tshirt.size = req.body.size;
            if (req.body.colour != null)
                tshirt.color = req.body.color;

            return tshirt.save(function(err) {
                if (!err) {
                    console.log('Updated');
                    return res.send({
                        status : 'OK',
                        tshirt : tshirt
                    });
                } else {
                    if (err.name == 'ValidationError') {
                        res.statusCode = 400;
                        res.send({
                            error : 'Validation error'
                        });
                    } else {
                        res.statusCode = 500;
                        res.send({
                            error : 'Server error'
                        });
                    }
                    console.log('Internal error(%d): %s', res.statusCode, err.message);
                }

                res.send(tshirt);

            });
        });
    };

    /**
     * Delete a tshirt by its ID
     * @param {Object} req HTTP request object.
     * @param {Object} res HTTP response object.
     */
    deleteTshirt = function(data, res) {

        console.log("DELETE - /tshirt/");
        return Design.findById(data.designId, function(err, tshirt) {
            if (!tshirt) {
                res.statusCode = 404;
                return res.send({
                    error : 'Not found'
                });
            }

            return tshirt.remove(function(err) {
                if (!err) {
                    console.log('Removed tshirt');
                    return res.send({
                        status : 'OK'
                    });
                } else {
                    res.statusCode = 500;
                    console.log('Internal error(%d): %s', res.statusCode, err.message);
                    return res.send({
                        error : 'Server error'
                    });
                }
            })
        });
    }

    getService = function(req, res) {
        var sAction = req.query.action;
        if (sAction === 'getAllMyDesigns') {
            findAllTshirts(req, res);
        } else if (sAction === 'getMyDesigns') {
            var sUserId = req.query.userId;
            getMyDesigns(sUserId, res);
        } else if (sAction === 'getMyDesignById') {
            var sDesignId = req.query.designId;
            findById(sDesignId, res);
        } else if (sAction === 'getMyOrders') {
            var sUserId = req.query.userId;
            getMyOrders(sUserId, res);
        }
    };

    postService = function(req, res) {
        var sAction = req.body.action;
        if (sAction && sAction !== '') {
            if (sAction === 'createDesign') {
                createDesign(req.body.data, res);
            } else if (sAction === 'deleteDesign') {
                deleteTshirt(req.body.data, res);
            } else if (sAction === 'createOrder') {
                createOrder(req.body.data, res);
            }
        }
    };

    //Link routes and actions
    app.get('/tshirt', getService);
    //app.get('/tshirt/:id', findById);
    app.post('/tshirt', postService);
    //app.put('/tshirt/:id', updateTshirt);
    //app.delete('/tshirt/:id', deleteTshirt);

}