/**
 * Tshirt
 * 
 * @module :: Routes
 * @description :: Maps routes and actions
 */

var Design = require('../models/tshirt.js');
var Order = require('../models/order.js');
var User = require('../models/User.js');
var Coupon = require('../models/Coupon.js');
var Artifact = require('../models/Artifact.js');
var CouponSource = require('../models/CouponSource.js');

var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;
var fs = require('fs');
var gm = require('gm');
var Gridfs = require('gridfs-stream');
var cp = require('child_process');
var path = require('path')
var LOG = require('../util/wsLog');

var FILE_CONSTANT = {
    SMALL_IMAGE_WIDTH: 50,
    MID_IMAGE_WIDTH: 250,
    LARGE_IMAGE_WIDTH: 400,
    FINAL_DESIGN_WIDTH: 1500,
    FINAL_DESIGN_HEIGHT: 2250
};

var ORDER_CONSTANT = {
    ORIGIN_PRICE: 99
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

    getMyDesigns = function(req, res) {
        LOG.logger.logFunc('getMyDesigns');
        var iOffset = req.query.offset;
        var iSize = req.query.size;
        var sUserId = req.query.userId;
        /*
         * return Design.find({creatorId: sUserId}, function(err, aDesign) { if(!err) { return res.send({ status: 'OK',
         * designList: aDesign }); } else { res.statusCode = 500; console.log('Internal error(%d):
         * %s',res.statusCode,err.message); return res.send({ error: 'Server error' }); } });
         */

        var oQuery = Design.find({
            creatorId: sUserId
        });
        oQuery.sort({'modified': -1});
        oQuery.skip(iOffset);
        oQuery.limit(iSize);
        oQuery.populate('creatorId');
        oQuery.exec(function(err, aDesign) {
            if (!err) {
                LOG.logger.logFunc('getMyDesigns', 'Find ' + aDesign.length + ' private designs.');
                Design.find({
                    creatorId: sUserId
                }).count(function(err, count) {
                    return res.send({
                        status : 'OK',
                        designList : aDesign,
                        totalSize: count
                    });
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

    getDesigns = function(req, res) {
        LOG.logger.logFunc('getDesigns');
        var iOffset = req.query.offset;
        var iSize = req.query.size;

        var oQuery = Design.find({
            access: 'public'
        });
        oQuery.sort({'modified': -1});

        if (!!iOffset && !!iSize) {
            oQuery.skip(iOffset);
            oQuery.limit(iSize);
        }

        oQuery.populate('creatorId');
        oQuery.exec(function(err, aDesign) {
            if (!err) {
                LOG.logger.logFunc('getDesigns', 'Find ' + aDesign.length + ' designs.');
                Design.find({
                    access: 'public'
                }).count(function(err, count) {
                    return res.send({
                        status : 'OK',
                        designList : aDesign,
                        totalSize: count
                    });
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

    getReviewDesigns = function(req, res) {
        LOG.logger.logFunc('getReviewDesigns');
        var sTargetAccess = req.query.access;

        var oQuery = Design.find({
            access: sTargetAccess
        });
        oQuery.sort({'modified': -1});

        oQuery.populate('creatorId');
        oQuery.exec(function(err, aDesign) {
            if (!err) {
                LOG.logger.logFunc('getReviewDesigns', 'Find ' + aDesign.length + ' designs.');
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
    getDesignById = function(sDesignId, res) {

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
                    data : oDesign
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

    guessDesignCreated = function(oData, res) {
        var sCreatorId = oData.creatorId;
        var sDesc = oData.desc;
        var sColor = oData.color;
        var sAccess = oData.access;
        var sGender = oData.gender;
        var iRequestSentTime = oData.requestSentTime;

        var oQuery = Design.find({
            creatorId: sCreatorId,
            desc: sDesc,
            color: sColor,
            access: sAccess,
            gender: sGender
        });
        oQuery.sort({'modified': -1});
        oQuery.exec(function(err, oDBRet) {
            if (err) {
                LOG.logger.logFunc('guessDesignCreated', err.message);
                res.send({
                    error: 'guessDesignCreated ' + err.message
                });
            } else {
                if (!oDBRet) {
                    res.send({
                        status: 'OK',
                        data: 'NOT_FOUND'
                    });
                } else {
                    var oGuessItem = null;
                    if (oDBRet.length && oDBRet.length > 1) {
                        oGuessItem = oDBRet[0];
                    } else {
                        
                    }
                    if (oGuessItem) {
                        var oCreateTime = oGuessItem.modified;
                        var iDelta = oCreateTime.getTime() - iRequestSentTime;
                        LOG.logger.logFunc('guessDesignCreated', 'delta time: ' + iDelta);
                        if (iDelta < 60*1000) {
                            oGuessItem.designId = oGuessItem._id;
                            res.send({
                                status: 'OK',
                                data: oGuessItem
                            });
                        } else {
                            res.send({
                                status: 'OK',
                                data: 'NOT_FOUND'
                            });
                        }
                    } else {
                        res.send({
                            status: 'OK',
                            data: 'NOT_FOUND'
                        });
                    }
                    
                }
            }
        });
    }

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

        // var sOutParam2 = '-size 400x500 xc:none img/female_black.png -geometry 10%x-50+5 -composite '
        //     + 'img/female_white.png -geometry 10%x+350+5 -composite img/test.png';

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
                console.log('readstream error while creating design: ' + err);
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

            var sRandomSurffix = Math.floor((Math.random() * 1000));

            var sFinalImageFileName = oData.requestedTime + sRandomSurffix + '_final.png';
            var writestream = gfs.createWriteStream({
                //filename: sFilePath,
                filename: sFinalImageFileName,
                mode:'w',
                content_type:'binary/octet-stream',
                metadata:{
                    type: 'designImage',
                    creatorId: oData.creatorId
                },
            });
            var sPreviewImageFileName = oData.requestedTime + sRandomSurffix + '_preview.png';

            var previewFileWritestream = gfs.createWriteStream({
                filename: sPreviewImageFileName,
                mode:'w',
                content_type:'binary/octet-stream',
                metadata:{
                    type: 'designPreviewImage',
                    creatorId: oData.creatorId
                },
            });

            fs.createReadStream(sFilePath).pipe(writestream);

            writestream.on('close', function (oGridFsFile) {
                gm(sFilePath).options({imageMagick: true})
                // .resize(iMidTargetWidth, iMidTargetHeight).toBuffer(function(err, buffer) {
                //     if (err) {
                //         oRes.send({
                //             error: err,
                //             msg: 'create final design image thumbnail failed.'
                //         });
                //     }

                //     deleteFolderRecursive('img/' + oData.requestedTime);

                //     var sMidBase64 = buffer.toString('base64');
                //     console.log("sMidBase64 length: " + sMidBase64.length);

                //     var sImgBase64 = 'data:image/png;base64,' + sMidBase64
                //     saveDesign(oRes, oData, sImgBase64, oGridFsFile._id);
                    
                // });
                .resize(iMidTargetWidth, iMidTargetHeight).stream(function(err, stdout, stderr) {
                    if (err) {
                        oRes.send({
                            error: err,
                            msg: 'create final design preview image stream to GFS failed.'
                        });
                    }

                    //deleteFolderRecursive('img/' + oData.requestedTime);
                    

                    stdout.pipe(previewFileWritestream);
                    
                });
            });

            writestream.on('error', function(err) {
                LOG.logger.logFunc('createDesign', 'saveDesignFile GridFs failed.');
                oRes.send({
                    error: 'createDesign -> saveDesignFile GridFs failed.'
                });
            });

            previewFileWritestream.on('close', function (oPreviewGridFsFile) {
                deleteFolderRecursive('img/' + oData.requestedTime);
                saveDesign(oRes, oData, oPreviewGridFsFile.filename, oPreviewGridFsFile._id);
            });

            previewFileWritestream.on('error', function(err) {
                LOG.logger.logFunc('createDesign', 'saveDesignFile preview GridFs failed.');
                oRes.send({
                    error: 'createDesign -> saveDesignFile preview GridFs failed.'
                });
            });
        }

        function saveDesign(oRes, oData, sPreviewFileName, sDesignFileId) {
            var oDesignJson = {
                creatorId : oData.creatorId,
                color : oData.color,
                price : oData.price,
                desc : oData.desc,
                gender: oData.gender,
                access : oData.access,
                previewImageFile : sPreviewFileName,
                designFileId : sDesignFileId
            };
            var design = new Design(oDesignJson);

            design.save(function(err, oDBRet) {

                if (err) {

                    console.log('Error while saving tshirt: ' + err);
                    oRes.send({
                        error : err
                    });
                    return;

                } else {

                    console.log("design created");
                    // var output = '';
                    // for (property in oDesignJson) {
                    //     output += property + ': ' + oDesignJson[property]+';\n';
                    // }
                    // //console.log(output);
                    // LOG.logger.logFunc('saveDesign', output);

                    oDesignJson.designId = oDBRet._doc._id.toString();
                    // var base64ChunkSize = 100000;
                    // if (oDBRet.previewImage64.length > base64ChunkSize) {
                    //     oDesignJson.previewImage64Array = [];
                    //     var batchCount = Math.floor(oDBRet.previewImage64.length / base64ChunkSize);
                    //     for (var i = 0; i < batchCount; i++) {
                    //         var iStart = i * base64ChunkSize;
                    //         oDesignJson.previewImage64Array.push(oDBRet.previewImage64.substr(iStart, iStart + base64ChunkSize));
                    //     }
                    //     if (oDBRet.previewImage64.length % base64ChunkSize > 0) {
                    //         oDesignJson.previewImage64Array.push(oDBRet.previewImage64.substr(batchCount * base64ChunkSize, oDBRet.previewImage64.length));
                    //     }
                    //     delete oDesignJson.previewImage64;
                    // }

                    //delete oDesignJson.previewImage64;
                    return oRes.send({
                        status : 'OK',
                        data : oDesignJson
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
        var sUserId = data.creatorId;
        //var sMailInfo = data.mailInfo;

        var sContact = data.contact;
        var sContactMobile = data.contactMobile;
        //var sProvince = data.province;
        //var sCity = data.city;
        //var sDistrict = data.district;
        var sPostCode = data.postCode;
        var sDetailAddress = data.detailAddress;
        var sInfo = data.info;

        var oNewOrder = {
            designId: data.designId,
            creatorId : sUserId,
            //mailInfo: sMailInfo,
            contact: sContact,
            contactMobile: sContactMobile,
            //province: sProvince,
            //city: sCity,
            //district: sDistrict,
            postCode: sPostCode,
            detailAddress: sDetailAddress,
            femalePrice : ORDER_CONSTANT.ORIGIN_PRICE,
            malePrice : ORDER_CONSTANT.ORIGIN_PRICE,
            kidPrice : ORDER_CONSTANT.ORIGIN_PRICE,
            totalPrice : 0,
            maleSize : '',
            maleQuantity : 0,
            femaleSize : '',
            femaleQuantity : 0,
            kidSize : '',
            kidQuantity : 0,
            info: sInfo,
            coupons: data.coupons
        };

        var aCoupons = data.coupons;
        var aValidCoupons = [];
        var oMaleInfo = data.maleInfo;
        var oFemaleInfo = data.femaleInfo;
        var oKidInfo = data.kidInfo;

        if (oMaleInfo.quantity > 0) {
            oNewOrder.maleQuantity = oMaleInfo.quantity;
            oNewOrder.maleSize = oMaleInfo.clothesSize;
        }
        if (oFemaleInfo.quantity > 0) {
            oNewOrder.femaleQuantity = oFemaleInfo.quantity;
            oNewOrder.femaleSize = oFemaleInfo.clothesSize;
        }
        if (oKidInfo.quantity > 0) {
            oNewOrder.kidQuantity = oKidInfo.quantity;
            oNewOrder.kidSize = oKidInfo.clothesSize;
        }

        createOrder_1_findDesign(oNewOrder);

        
        function createOrder_1_findDesign(oNewOrder) {
            var sTargetDesignId = oNewOrder.designId;

            Design.findById(sTargetDesignId, function(err, oDesign) {
                if (!err) {
                    console.log('Create order: found target design');

                    var aClaimedCoupon = oNewOrder.coupons;
                    if (aClaimedCoupon && aClaimedCoupon.length > 0) {
                        createOrder_2_findValidCoupon(oNewOrder);
                    } else {
                        createOrder_4_createOrder(oNewOrder);
                    }
                } else {
                    console.log('Create order: target design not found!');
                    res.send({
                        error : err
                    });
                    return;
                }
            });
        }

        function createOrder_2_findValidCoupon(oNewOrder) {
            var sTargetUserId = oNewOrder.creatorId;
            User.findById(sTargetUserId).populate('coupons').exec(function(err, oUser) {
                if (err) {
                    LOG.logger.logFunc('createOrder_2_findValidCoupon', 'invalid user id.');
                    res.send({
                        error: 'invalid user id.'
                    });
                } else {
                    //Only support usage of one coupon for now
                    var aUserCoupons = oUser.coupons;
                    for (var i = 0; i < aUserCoupons.length; i++) {
                        if (aUserCoupons[i]._id.toString() === aCoupons[0]._id &&
                            aUserCoupons[i].status === 'new') {
                            aValidCoupons.push(aUserCoupons[i]);
                            break;
                        }
                    };

                    if (aValidCoupons.length > 0) {
                        createOrder_3_updateCouponStatus(oNewOrder, aValidCoupons, 'used');
                    } else {
                        res.send({
                            error: 'Coupon invalid'
                        });
                    }
                }
            });
        }

        function createOrder_3_updateCouponStatus(oNewOrder, aValidCoupons, sNewStatus) {
            Coupon.findById(aValidCoupons[0]._id).exec(function(err, oCouponFound) {
                oCouponFound.status = sNewStatus;
                oCouponFound.save(function(err) {
                    if (err) {
                        LOG.logger.logFunc('createOrder_3_updateCouponStatus', 'update coupon status failed.');
                        res.send({
                            error: 'update coupon status failed.'
                        });
                    } else {
                        LOG.logger.logFunc('createOrder', 'update coupon status successfully to ' + sNewStatus);
                        oNewOrder.coupons = [oCouponFound];
                        createOrder_4_createOrder(oNewOrder);
                    }
                });
            });
        }

        function createOrder_4_createOrder(oNewOrderJson) {
            var sTargetUserId = oNewOrderJson.creatorId;
            oNewOrderJson.totalPrice = calcPrice(oNewOrderJson);

            User.findById(sTargetUserId).exec(function(err, oUser) {
                oNewOrderJson._id = new ObjectId();
                oNewOrderJson.creatorId = oUser._id;
                //oNewOrderJson.designId = new ObjectId(oNewOrderJson.designId);
                var oNewOrder2Create = new Order(oNewOrderJson);

                oNewOrder2Create.save(function(err) {
                    if (err) {
                        LOG.logger.logFunc('createOrder_4_createOrder', 'failed to create new order object.');
                        res.send({
                            error: 'failed to create new order object.'
                        });
                    } else {
                        oUser.orders.push(oNewOrderJson._id);
                        oUser.save(function(err) {
                            if (err) {
                                LOG.logger.logFunc('createOrder_4_createOrder', 'update user order list failed.');
                                res.send({
                                    error: 'update user order list failed.'
                                });
                            } else {
                                LOG.logger.logFunc('createOrder_4_createOrder', 'update user order list successfully.');
                                res.send({
                                    status: 'OK',
                                    data: oNewOrderJson
                                });
                            }
                        });
                    }
                });
            });
        }
    };

    calcPrice = function(oOrderInfo) {
        var iRet = 0;
        var aCoupons = oOrderInfo.coupons;

        if (oOrderInfo.maleQuantity > 0) {
            iRet += oOrderInfo.maleQuantity * oOrderInfo.malePrice;
        }
        if (oOrderInfo.femaleQuantity > 0) {
            iRet += oOrderInfo.femaleQuantity * oOrderInfo.femalePrice;
        }
        if (oOrderInfo.kidQuantity > 0) {
            iRet += oOrderInfo.kidQuantity * oOrderInfo.kidPrice;
        }

        if (aCoupons && aCoupons.length > 0) {
            var oValidCoupon = aCoupons[0];//Only support usage of one coupon per order for now
            iRet -= oValidCoupon.couponValue;
            return iRet;
        } else {
            return iRet;
        }
    };

    updateOrderStatus = function(oData, res) {
        if (oData) {
            var sOrderId = oData.orderId;
            var sTargetStatus = oData.targetStatus;
            var sTargetExpressInfo = oData.expressInfo;

            var updateInfo = {};
            if (sTargetStatus) {
                updateInfo.status = sTargetStatus;
            }
            if (sTargetExpressInfo) {
                updateInfo.expressInfo = sTargetExpressInfo;
            }
            updateInfo.lastModified = new Date();

            Order.findByIdAndUpdate(sOrderId, updateInfo, {'new': true}, function(err, oDBRet) {
                if (err) {
                    LOG.logger.logFunc('updateOrderStatus', err.message);
                    res.send({
                        error: 'updateOrderStatus failed ' + err.message
                    });
                } else {
                    res.send({
                        status: 'OK',
                        data: oDBRet
                    });
                }
            });
        } else {
            LOG.logger.logFunc('updateOrderStatus', 'No Param provided.');
            res.send({
                error: 'No Param provided.'
            });
        }
    };

    getMyOrders = function(sUserId, res) {
        var oQuery = Order.find({
            creatorId: sUserId
        });
        oQuery.sort({'lastModified': -1});
        oQuery.populate('designId');

        oQuery.exec(function(err, aOrder) {
            if (err) {
                LOG.logger.logFunc('getMyOrders', err.message);
                res.send({
                    error: 'getMyOrders' + err.message
                });
            } else {
                res.send({
                    status: 'OK',
                    data: aOrder
                });
            }
        });
        /*console.log("GET - /tshirts_getMyOrders");
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
        });*/
    };

    getOrderById = function(sOrderId, res) {
        Order.findById(sOrderId, function(err, oOrder) {
            if (err) {
                LOG.logger.logFunc('getOrderById', err.message);
                res.send({
                    error: 'getOrderById' + err.message
                });
            } else {
                oOrder.orderId = oOrder._id;
                res.send({
                    status: 'OK',
                    data: oOrder
                });
            }
        });
    };

    getOrders = function(req, res) {
        var sParamType = req.query.type;
        var oFindParam = {};
        if (sParamType === 'paid') {
            oFindParam.status = '待发货';
        } else if (sParamType === 'shipped') {
            oFindParam.status = '已发货';
        } else if (sParamType === 'all') {

        }

        var oQuery = null;
        if (!oFindParam.status) {
            oQuery = Order.find();
        } else {
            oQuery = Order.find(oFindParam);
        }
        oQuery.populate('designId');
        oQuery.exec(function(err, aOrders) {
            if (err) {
                LOG.logger.logFunc('getOrders', err.message);
                res.send({
                    error: 'getOrders:' + err.message
                });
            } else {
                res.send({
                    status: 'OK',
                    data: aOrders
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

    createCoupon = function(data, res) {
        console.log('POST - /tshirt___createCoupon');

        var sUserId = data.userId;

        var oNewCouponJson = {
            couponNumber: data.couponNumber,
            status: 'new',
            couponValue: data.couponValue,
            scope: 'unlimited',
            validFrom: data.validFrom,
            validTo: data.validTo
        };

        /*var oNewUser = new User({
            _id: new ObjectId(),
            wechatId: 'oMOsBtzA2Kbns3Dulc2s6upB5ZBw',
            status: 1
        });

        oNewUser.save(function(err) {
            res.send('ok');
        });*/

        User.findById(sUserId).populate('coupons').exec(function(err, oUser) {
            var bLegal = true;
            if (!oUser) {
                res.send({
                    error: 'User not found'
                });
                return;
            }

            var aCoupon = oUser.coupons;
            if (aCoupon && aCoupon.length > 0) {
                for (var i = 0; i < aCoupon.length; i++) {
                    if (aCoupon[i].couponNumber === data.couponNumber) {
                        bLegal = false;//Everyone can only get coupon once
                        break;
                    }
                }
            }

            if (bLegal) {
                oNewCouponJson._ownerId = oUser._id;
                var oNewCoupon = new Coupon(oNewCouponJson);
                oNewCoupon.save(function (err, oDBRet) {
                    if (err) {
                        res.send({
                            error: 'failed to create coupon.'
                        });

                    } else {
                        oUser.coupons.push(oDBRet._doc._id);
                        oUser.save(function (err) {
                            if (err) {
                                res.send({
                                    error: 'failed to add coupon to user.'
                                });
                            }
                            res.send({
                                status : 'OK',
                                data: oNewCouponJson
                            });
                        })
                    }
                });
                
            } else {
                res.send({
                    error: 'already got coupon.'
                });
            }
        });
    };

    createCouponSource = function (data, res) {
        var oNewSourceJson = {
            couponNumber: data.couponNumber,
            couponValue: data.couponValue,
            scope: data.scope,
            imgSrc: data.imgSrc,
            validFrom: data.validFrom,
            validTo: data.validTo
        };
        var oNewSource = new CouponSource(oNewSourceJson);
        oNewSource.save(function(err) {
            if (err) {
                LOG.logger.logFunc('createCouponSource', 'Create coupon source failed.');
                res.send({
                    error: 'Create coupon source failed.'
                });
            } else {
                LOG.logger.logFunc('createCouponSource', 'Create coupon source successfully.');
                res.send({
                    status: 'OK',
                    data: 'Create coupon source successfully.'
                });
            }
        });
    };

    getCouponSources = function(res) {
        CouponSource.find().exec(function(err, aSource) {
            if (err) {
                LOG.logger.logFunc('getCouponSources', 'Get coupon sources failed.');
                res.send({
                    error: 'Get coupon sources failed.'
                });
            } else {
                LOG.logger.logFunc('getCouponSources', 'Get coupon sources successfully.');
                res.send({
                    status: 'OK',
                    data: aSource
                });
            }
        });
    };

    getMyCoupons = function(userId, res) {
        User.findById(userId).populate('coupons').exec(function(err, oUser) {
            if (err) {
                LOG.logger.logFunc('getMyCoupons', 'Find user by Id error.');
                res.send({
                    error: 'Find user by Id error.'
                });
            } else {
                var aCoupon = oUser.coupons;
                var aRet = [];
                for (var i = 0; i < aCoupon.length; i++) {
                    if (aCoupon[i].status === 'new') {
                        aRet.push(aCoupon[i]);
                    }
                }
                res.send({
                    status: 'OK',
                    data: aRet
                });
            }
        });
    };

    updateArtifactType = function(data, res) {
        var sArtifactId = data.artifactId;
        var updateInfo = {
            'type': data['type']
        };
        Artifact.findByIdAndUpdate(sArtifactId, updateInfo, {'new': true}, function(err, oDBRet) {
            if (err) {
                LOG.logger.logFunc('updateArtifactType', err.message);
                res.send({
                    error: 'updateArtifactType failed ' + err.message
                });
            } else {
                res.send({
                    status: 'OK',
                    data: oDBRet
                });
            }
        });
    };

    updateDesignAccess = function(data, res) {
        var sDesignId = data.designId;
        var updateInfo = {
            'access': data['access']
        };
        Design.findByIdAndUpdate(sDesignId, updateInfo, {'new': true}, function(err, oDBRet) {
            if (err) {
                LOG.logger.logFunc('updateDesignAccess', err.message);
                res.send({
                    error: 'updateDesignAccess failed ' + err.message
                });
            } else {
                res.send({
                    status: 'OK',
                    data: oDBRet
                });
            }
        });
    };

    getService = function(req, res) {
        var sAction = req.query.action;
        if (sAction === 'getAllMyDesigns') {
            findAllTshirts(req, res);
        } else if (sAction === 'getMyDesigns') {
            if (!req.query || !req.query.userId) {
                res.send({
                    error: 'No user id provided.'
                });
                return;
            }
            getMyDesigns(req, res);
        } else if (sAction === 'getDesigns') {
            getDesigns(req, res);
        } else if (sAction === 'getReviewDesigns') {
            getReviewDesigns(req, res);
        } else if (sAction === 'getDesignById') {
            var sDesignId = req.query.designId;
            getDesignById(sDesignId, res);
        } else if (sAction === 'getMyOrders') {
            if (!req.query || !req.query.userId) {
                res.send({
                    error: 'No user id provided.'
                });
                return;
            }
            var sUserId = req.query.userId;
            getMyOrders(sUserId, res);
        } else if (sAction === 'getCouponSources') {
            getCouponSources(res);
        } else if (sAction === 'getMyCoupons') {
            if (!req.query || !req.query.userId) {
                res.send({
                    error: 'No user id provided.'
                });
                return;
            }
            var sUserId = req.query.userId;
            getMyCoupons(sUserId, res);
        } else if (sAction === 'getOrderById') {
            if (!req.query || !req.query.orderId) {
                res.send({
                    error: 'No order id provided.'
                });
                return;
            }
            var sOrderId = req.query.orderId;
            getOrderById(sOrderId, res);
        } else if (sAction === 'getOrders') {
            getOrders(req, res);
        } else {
            console.log("design get service, action: empty.");
            res.send({
                error: 'NOT supported get action.'
            })
        }
    };

    postService = function(req, res) {
        var sAction = req.body.action;
        if (sAction && sAction !== '') {
            console.log("design post service, action: " + sAction);
            if (sAction === 'createDesign') {
                createDesign(req.body.data, res);
            } else if (sAction === 'deleteDesign') {
                deleteTshirt(req.body.data, res);
            } else if (sAction === 'createOrder') {
                createOrder(req.body.data, res);
            } else if (sAction === 'createCoupon') {
                createCoupon(req.body.data, res);
            } else if (sAction === 'createCouponSource') {
                createCouponSource(req.body.data, res);
            } else if (sAction === 'updateOrderStatus') {
                updateOrderStatus(req.body.data, res);
            } else if (sAction === 'guessDesignCreated') {
                guessDesignCreated(req.body.data, res);
            } else if (sAction === 'updateArtifactType') {
                updateArtifactType(req.body.data, res);
            } else if (sAction === 'updateDesignAccess') {
                updateDesignAccess(req.body.data, res);
            }
        } else {
            console.log("design post service, action: empty.");
            res.send({
                error: 'NOT supported post action.'
            })
        }
        
    };

    //Link routes and actions
    app.get('/tshirt', getService);
    //app.get('/tshirt/:id', findById);
    app.post('/tshirt', postService);
    //app.put('/tshirt/:id', updateTshirt);
    //app.delete('/tshirt/:id', deleteTshirt);

}