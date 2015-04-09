'use strict';

/*var oCreateDesign = angular.module('ntApp.createDesign', ['ngRoute', 'designServices']);

oCreateDesign.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/createDesign', {
        templateUrl: 'views/createDesign.html',
        controller: 'CreateDesignCtrl'
    });
}]);

oCreateDesign.controller('CreateDesignCtrl', ['$scope', '$routeParams', 'Design', function($scope, $routeParams, Design) {
    $scope.bPrivateDesign = false;
    $scope.defultDesc = new Date().toUTCString();
    $scope.createDesign = function (bPrivateDesign) {
        var oNewDesign = {
            color: "white",
            model: "Wave2015",
            price: 100,
            size: 42,
            style: "Casual"
        };
        Design.create(oNewDesign);
    };
}]);*/


var oCreateDesign = angular.module('ntApp.createDesign', ['ui.router', 'designServices', 'angular-gestures']);

oCreateDesign.config(['$stateProvider', 'hammerDefaultOptsProvider', function($stateProvider, hammerDefaultOptsProvider) {
    $stateProvider.state('createDesign.createDetail', {
        url: '/createDetail',
        // templateUrl: 'views/createDetail.html',
        // controller: 'CreateDetailCtrl'
        views: {
            'createDetail' : {
                templateUrl: 'views/createDetail.html',
                controller: function($scope, $state, Design) {
                    $scope.onOpenMyGallery = function() {
                        $scope.getMyArtifactThumbnails();
                        $state.go('createDesign.createDetail.myGallery');
                    };
                }
            }
        }
    }).state('createDesign.createDetail.myGallery', {
        views: {
            'personalGallery': {
                templateUrl: 'views/personalGallery.html',
                controller: function($scope, $state, Design) {
                    var i = 0;
                }
            }
        }
    }).state('createDesign.createDetail.saveDetail', {
        url: '/saveDetail',
        // templateUrl: 'views/createDetail.html',
        // controller: 'CreateDetailCtrl'
        views: {
            'saveDetail' : {
                templateUrl: 'views/saveDetail.html',
                controller: function($scope, $state, Design) {
                    $scope.saveDetailtest = "this is test string in saveDetail.";
                }
            }
        }
    });

    hammerDefaultOptsProvider.set({
        recognizers: [
          [Hammer.Tap,{ event: 'tap'}],
          [Hammer.Tap, { event: 'doubletap', taps: 2 }, [], ['tap']],
          [Hammer.Press],
          [Hammer.Pan]
        ]
    });
}]);

oCreateDesign.controller('CreateDesignCtrl', ['$scope', '$location', '$upload', '$state', 'Design', 'Auth', 
    function($scope, $location, $upload, $state, Design, Auth) {
        $scope.test = {
            larry: {
                openId: 'oMOsBtzA2Kbns3Dulc2s6upB5ZBw',
                _id: ''
            }
        };

        $scope.aSelectedArtifact = [];

    //Regist Wechat Interface
    /*var oParam = {
        action: 'getJsAPISignature'
    };

    
    var oSig = Auth.AuthManager.query(oParam, function () {
        console.log(oSig.signature);
        wx.config({
            debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
            appId: 'wxf26855bd0cda23bd', // 必填，公众号的唯一标识
            timestamp: oSig.timestamp, // 必填，生成签名的时间戳
            nonceStr: oSig.nonceStr, // 必填，生成签名的随机串
            signature: oSig.signature,// 必填，签名，见附录1
            jsApiList: ["chooseImage", "previewImage", "uploadImage", "downloadImage"] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
        });

        wx.ready(function() {
            console.log('js sdk configuration set up successfully.');
        });

        wx.error(function(res){
            console.log('js sdk configuration set up failed!!!');
        });
    });*/

        var oAuthParam = {
            action: 'getUserIdByWechatId',
            wechatId: $scope.test.larry.openId
        };
        Auth.AuthManager.query(oAuthParam, function(oData) {
            $scope.test.larry._id = oData.data._id;
        });

        $scope.constant = {
            SIZE_ARRAY: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
            BK_COLOR_ARRYA: ['黑', '白']
        };
        $scope.designInfo = {
            sCreatorId: 'MATT',
            bPrivateDesign: true,
            sDefaultDesc: new Date().toUTCString(),
            sBackgroundColor: '白',
            sSize: 'XL'
        };

        // $scope.bPrivateDesign = false;
        // $scope.defultDesc = new Date().toUTCString();
        $scope.createDesign = function () {
            var oNewDesign = {
                creatorId: $scope.designInfo.sCreatorId,
                color: $scope.designInfo.sBackgroundColor === '白' ? 'white' : 'black',
                model: "Wave2015",
                price: 100,
                size: $scope.designInfo.sSize,
                style: "Casual",
                desc: $scope.designInfo.sDefaultDesc,
                access: $scope.designInfo.bPrivateDesign ? 'private' : 'public'
            };
            var oParam = {
                action: 'createDesign',
                data: oNewDesign
            };
            Design.DesignManager.create(oParam);

            //GO TO SAVE PAGE
            $state.go('createDesign.createDetail.saveDetail');
        };

        $scope.deleteDesign = function (sId) {
            var oDesign = {
                designId: sId
            };
            var oParam = {
                action: 'deleteDesign',
                data: oDesign
            };
            Design.DesignManager.delete(oParam);
        };

        $scope.changeBackgroundColor = function(sColor) {
            $scope.designInfo.sBackgroundColor = sColor;
            ///getFileContent($scope.test.fileId);
        };

        $scope.changeSize = function(sSize) {
            $scope.designInfo.sSize = sSize;
        };

        $scope.onGenderSelected = function() {
            $state.go("createDesign.createDetail");
        };

        $scope.onCreateDesignBackClicked = function() {
            $state.go('^');
        };

        $scope.chooseImageFromGallery = function() {
            wx.chooseImage({
                success: function (res) {
                    console.log("images choosed successfully: " + res.localIds);
                }
            });
        };

        $scope.uploadImage = function() {
            console.log("asdfasdf");
        };

        $scope.fileSelected = function(aFile) {
            if (aFile && aFile.length) {
                for (var i = 0; i < aFile.length; i++) {
                    var file = aFile[i];
                    $upload.upload({
                        method: 'POST',
                        url: 'uploadFile',
                        file: file,
                        data : {
                            'action': 'uploadFile',
                            'fileName': $scope.test.larry._id + new Date().getTime(),
                            'creatorId': $scope.test.larry._id
                        }
                    }).progress(function (evt) {
                        var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                        console.log('progress: ' + progressPercentage + '% ' + evt.config.file.name);
                    }).success(function (data, status, headers, config) {
                        console.log('file ' + config.file.name + 'uploaded. Response: ' + data);
                        //$scope.imgSrc = 'file/getFileContent/' + data.fileId;
                        $scope.test.fileId = data.fileId;
                        //getFileContent(data.fileId);
                    });
                }
            }
        };
        
        $scope.getFileContent = function(sFileId) {
            var oParam = {
                action: 'getFileContent',
                fileId: $scope.test.fileId
            };
            var oFileContent = Design.FileManager.query(oParam, function(oContent) {
                $scope.midImgSrc = 'data:image/png;base64,' + oContent.data.midImage64;
                $scope.largeImgSrc = 'data:image/png;base64,' + oContent.data.largeImage64;
            });
        };

        $scope.getMyArtifactThumbnails = function() {
            var oParam = {
                action: 'getMyArtifactThumbnails',
                userId: $scope.test.larry._id
            };
            var oArtifacts = Design.FileManager.query(oParam, function(oContent) {
                //$scope.imgSrc = 'data:image/png;base64,' + oContent.data;
                $scope.aMyArtifact = oContent.data;
                $scope.aMyArtifactCarouselIndex = 0;
            });
        };

        $scope.onArtifactSelected = function(oArtifact) {
            // oArtifact.styleValue = //'top:50px;left:100px;' + 
            //     'transform:rotate(7deg);' + 
            //     '-o-transform:rotate(7deg);' + 
            //     '-webkit-transform: rotate(7deg);' + 
            //     '-moz-transform: rotate(7deg);';
            oArtifact.isEditting = false;
            oArtifact.styleValue = {};
            oArtifact.styleValue.top = 70;
            oArtifact.styleValue.left = 50;
            oArtifact.styleValue.pencilLeft = -16 + oArtifact.styleValue.left;

            oArtifact.styleStr = "top:" + oArtifact.styleValue.top + "px;" + 
                "left:" + oArtifact.styleValue.left + "px;" + 
                "width:" + 280 + "px;";

            oArtifact.pencilStyleStr = "top:" + oArtifact.styleValue.top + "px;" + 
                "left:" + oArtifact.styleValue.pencilLeft + "px;";


            var img = new Image();
            img.src = 'data:image/png;base64,' + oArtifact.largeImage64;
            //console.log(img.width);       // This might print out 0!
            img.onload = function() {
                console.log(img.width);   // This will print out the width.
                var iResizeTop = oArtifact.styleValue.top - img.height*0.7/2 + 2;//original 70% width limit
                var iResizeLeft = oArtifact.styleValue.pencilLeft - 24;//Need to consider pencil width
                oArtifact.resizeStyleStr = "top:" + iResizeTop + "px;" + 
                    "left:" + iResizeLeft + "px;";

                oArtifact.imgWidth = img.width*0.7;
                oArtifact.originImgWidth = img.width;
                oArtifact.imgHeight = img.height*0.7;
                oArtifact.originImgHeight = img.height;
                oArtifact.lastDragDistance = 0;

                $scope.aSelectedArtifact.push(oArtifact);
                $state.go('^');
            }

            // $scope.aSelectedArtifact.push(oArtifact);
            // $state.go('^');
        };

        $scope.onSelectedArtiItemDragged = function($event, oArtifact) {
            //console.log($event.gesture);
            console.log('dragging!');
            console.log($event.target.clientWidth);
            //hm-drag="onSelectedArtiItemDragged($event, oArtifact)"
            //event.gesture.preventDefault();
        };

        $scope.onSelectedArtiItemDragstart = function($event, oArtifact) {
            //console.log($event.gesture);
            console.log('dragging start!');
            //event.gesture.preventDefault();
        };

        $scope.onSelectedArtiItemDragend = function($event, oArtifact) {
            //console.log($event.gesture);
            console.log('dragging end!');
            oArtifact.styleValue.top += $event.deltaY;
            oArtifact.styleValue.left += $event.deltaX;
            oArtifact.styleValue.pencilLeft = -16 + oArtifact.styleValue.left;

            var iImgWidth = $event.target.clientWidth + 4;//Need to consider 2px border
            oArtifact.imgWidth = iImgWidth;

            oArtifact.styleStr = "top:" + oArtifact.styleValue.top + "px;" + 
                "left:" + oArtifact.styleValue.left + "px;" + 
                "width:" + iImgWidth + "px;";

            oArtifact.pencilStyleStr = "top:" + oArtifact.styleValue.top + "px;" + 
                "left:" + oArtifact.styleValue.pencilLeft + "px;";

            var iResizeTop = oArtifact.styleValue.top - $event.target.clientHeight/2 + 2;
            var iResizeLeft = oArtifact.styleValue.pencilLeft - 24;//Need to consider pencil width
            oArtifact.resizeStyleStr = "top:" + iResizeTop + "px;" + 
                "left:" + iResizeLeft + "px;";
            //event.gesture.preventDefault();
        };

        $scope.onSelectedArtiItemResizeDrag = function($event, oArtifact) {
            var iDistance = $event.distance;

            console.log('resize dragging' + iDistance);

            var iDeltaDragDistance = iDistance - oArtifact.lastDragDistance;
            if (iDeltaDragDistance > 10) {
                var iPercent = 1 - iDistance/400;
                oArtifact.styleStr = "top:" + oArtifact.styleValue.top + "px;" + 
                    "left:" + oArtifact.styleValue.left + "px;" + 
                    "width:" + oArtifact.originImgWidth*0.7*iPercent + "px;";
                //oArtifact.imgWidth = oArtifact.imgWidth*iPercent;
                //oArtifact.imgHeight = oArtifact.imgHeight*iPercent;

                var iResizeTop = oArtifact.styleValue.top - oArtifact.originImgHeight*0.7*iPercent/2 + 2;
                var iResizeLeft = oArtifact.styleValue.pencilLeft - 24;//Need to consider pencil width
                oArtifact.resizeStyleStr = "top:" + iResizeTop + "px;" + 
                    "left:" + iResizeLeft + "px;";

                console.log(oArtifact.styleStr);

                oArtifact.lastDragDistance = $event.distance;
            } else if (iDeltaDragDistance < -10) {
                var iPercent = 1 - iDistance/400;
                oArtifact.styleStr = "top:" + oArtifact.styleValue.top + "px;" + 
                    "left:" + oArtifact.styleValue.left + "px;" + 
                    "width:" + oArtifact.originImgWidth*0.7*iPercent + "px;";
                //oArtifact.imgWidth = oArtifact.originImgWidth*0.7*iPercent;
                //oArtifact.imgHeight = oArtifact.originImgHeight*0.7*iPercent;

                var iResizeTop = oArtifact.styleValue.top - oArtifact.originImgHeight*0.7*iPercent/2 + 2;
                var iResizeLeft = oArtifact.styleValue.pencilLeft - 24;//Need to consider pencil width
                oArtifact.resizeStyleStr = "top:" + iResizeTop + "px;" + 
                    "left:" + iResizeLeft + "px;";

                console.log(oArtifact.styleStr);

                oArtifact.lastDragDistance = $event.distance;
            }
        };

        $scope.onSelectedArtiItemResizeDragend = function($event, oArtifact) {
            console.log('resize dragging end!');
        };

        $scope.onTouched = function($event) {
            console.log('touched!');
            alert("touched");
            //event.gesture.preventDefault();
        };

        $scope.onTap = function($event) {
            console.log('touched!');
            alert("touched");
            //event.gesture.preventDefault();
        };

        $scope.onSelectedArtiItemPinchOut = function($event, oArtifact) {
            console.log('pinch out');
            alert('pinch out');
        };

        $scope.onSelectedArtiItemPinchIn = function($event, oArtifact) {
            console.log('pinch in');
            alert('pinch out');
        };

        $scope.onEditArtifactItemClicked = function(oArtifact) {
            oArtifact.isEditting = true;
        };

        // $scope.startDrag = function() {
        //     var i = 0;
        //     console.log("$scope start drag called.");
        //     alert("$scope start drag called.");
        // };
}]);

/*oCreateDesign.directive('designArtifact', ['$document', function($document) {
    return {
        // scope: {
        //     dragStart:'&startDragging',
        // },
        priority: 1001,
        link: function(scope, element, attr) {
            var startX = 0, startY = 0, x = 0, y = 0;
            element.css({
                position: 'relative',
                //border: '1px solid red'
                //background-color: 'lightgrey',
                cursor: 'pointer',
                transform: 'rotate(7deg)',
                oTransform: 'rotate(7deg)',
                webkitTransform: 'rotate(7deg)',
                mozTransform: 'rotate(7deg)'
            });

            var dragStartCallback = function(event) {
                //alert('dragStartCallback!');
                //scope.dragStart({e: event});
                console.log('dragStartCallback!');
                //event.preventDefault();
                startX = event.pageX - x;
                startY = event.pageY - y;
                // element[0].addEventListener('drag', dragCallback, false);
                // element[0].addEventListener('dragend', dragEndCallback, false);
            };

            var dragEndCallback = function(event) {
                //alert('dragStartCallback!');
                //scope.dragStart({e: event});
                console.log('dragEndCallback!');
                element[0].removeEventListener('drag');
                element[0].removeEventListener('dragend');
            };

            var dragCallback = function(event) {
                console.log('dragging!');
                y = event.pageY - startY;
                x = event.pageX - startX;
                element.css({
                    top: y + 'px',
                    left:  x + 'px'
                });
            };

            element[0].draggable = true;

            element[0].addEventListener('dragstart', dragStartCallback, false);
            element[0].addEventListener('dragend', dragEndCallback, false);
            element[0].addEventListener('drag', dragCallback, false);
            
            

            // element.on('mousedown', function(event) {
            // // Prevent default dragging of selected content
            //     event.preventDefault();
            //     startX = event.pageX - x;
            //     startY = event.pageY - y;
            //     $document.on('mousemove', mousemove);
            //     $document.on('mouseup', mouseup);
            // });

            // element.on('draggstart', function(event) {
            // // Prevent default dragging of selected content
            //     event.preventDefault();
            //     alert("asdf");
            //     startX = event.pageX - x;
            //     startY = event.pageY - y;
            //     $document.on('mousemove', mousemove);
            //     $document.on('mouseup', mouseup);
            // });

            // element.on('onStart', function(event) {
            // // Prevent default dragging of selected content
            //     event.preventDefault();
            //     startX = event.pageX - x;
            //     startY = event.pageY - y;
            //     $document.on('dragmove', mousemove);
            //     $document.on('dragend', mouseup);
            // });

            // function mousemove(event) {
            //     y = event.pageY - startY;
            //     x = event.pageX - startX;
            //     element.css({
            //         top: y + 'px',
            //         left:  x + 'px'
            //     });
            // }

            // function mouseup() {
            //     $document.off('mousemove', mousemove);
            //     $document.off('mouseup', mouseup);
            // }
        }
    };
}]);*/