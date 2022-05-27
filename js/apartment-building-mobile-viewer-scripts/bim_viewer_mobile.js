import createViewer from '../common/create_viewer.js';



export default function BIM_viewer_mobile() { //(language, debug) {
    this._viewer;
    // this._language = language;
    // this._debug = debug;
    this._modelName;
    this._walkFunc;
    this._mobileEvent;
    // this._viewCameras = [];
    this._sphereId;
    this._flatOverlayId;
    this._currentNodeId;
    this._captures = [];
    this._img;
    this._cameraWalk;
    this._cameraNavigate;
    this._selectOperatorHandle;

    this._screenConf;
    var ua = navigator.userAgent;
    //document.getElementById('info1').innerHTML = ua;
    if (ua.indexOf("iPhone") > 0 || ua.indexOf("iPod") > 0 || ua.indexOf("Android") > 0 && ua.indexOf("Mobile") > 0) {
        this._screenConf = Communicator.ScreenConfiguration.Mobile;
    } else if (ua.indexOf("iPad") > 0 || ua.indexOf("Android") > 0) {
        this._screenConf = Communicator.ScreenConfiguration.Mobile;
    } else {
        this._screenConf = Communicator.ScreenConfiguration.Desktop;
    }
}

BIM_viewer_mobile.prototype.start = function (modelName) {
    var _this = this;
    _this._modelName = modelName;

    // _this._initResources();
    _this._createViewer(_this._modelName);
    _this._initEvents();
};

// BIM_viewer_mobile.prototype._initResources = function () {
//     var _this = this;

//     if (_this._language == "ja") {

//     }
// };

BIM_viewer_mobile.prototype._createViewer = function (modelName) {
    var _this = this;
    createViewer(modelName, [modelName], "container").then(function (hwv) {
        _this._viewer = hwv;
        function sceneReadyFunc() {
            // _this._viewer.pauseRendering();
            _this._viewer.getSelectionManager().setHighlightLineElementSelection(false);
            _this._viewer.getSelectionManager().setHighlightFaceElementSelection(false);
            // _this._viewer.view.setAmbientOcclusionEnabled(true);
            _this._viewer.getSelectionManager().setNodeSelectionOutlineColor(new Communicator.Color(255, 0, 255));
            _this._viewer.getSelectionManager().setNodeSelectionColor(new Communicator.Color(128, 255, 255));
            _this._viewer.view.setDrawMode(Communicator.DrawMode.WireframeOnShaded);
            var walkOp = _this._viewer.getOperatorManager().getOperator(Communicator.OperatorId.Walk);
            walkOp._rotationSpeed = 30;
            walkOp._walkSpeed = 1000;


            _this._cameraWalk = Communicator.Camera.construct(cameraViews[1]);
            _this._viewer.getView().setCamera(_this._cameraWalk, 0);

            //         _this._viewer.getView().setCamera(_this._cameraWalk, 0);
            // $.getJSON("json/" + 'condo' + ".json", function (data) {
            //     if (data.views) {
            //         var views = data.views;
            //         for (var i = 0; i < views.length; i++) {
            //             var json = views[i];
            //             var camera = new Communicator.Camera.construct(json);
            //             _this._viewCameras.push(camera);
            //         }
            //         _this._cameraWalk = _this._viewCameras[1];
            //         _this._viewer.getView().setCamera(_this._cameraWalk, 0);
            //     }

            // Mobile
            if ((_this._screenConf == Communicator.ScreenConfiguration.Mobile) || (window.DeviceMotionEvent && typeof window.DeviceMotionEvent.requestPermission === "function")) {
                _this._mobileEvent = new MobileEventListener(_this._viewer, _this._walkFunc);
            }
            // });


        }

        function modelStructureReadyFunc() {
            var flatId = 2;
            _this._sphereId = 3;
            var overlayMgr = _this._viewer.getOverlayManager();
            _this._flatOverlayId = overlayMgr.maxIndex();
            var size = 300;
            if (_this._screenConf == Communicator.ScreenConfiguration.Mobile || (window.DeviceMotionEvent && typeof window.DeviceMotionEvent.requestPermission === "function"))
                size = 200;
            overlayMgr.setViewport(
                _this._flatOverlayId, Communicator.OverlayAnchor.LowerRightCorner,
                5, Communicator.OverlayUnit.Pixels, 10, Communicator.OverlayUnit.Pixels,
                size, Communicator.OverlayUnit.Pixels, size, Communicator.OverlayUnit.Pixels);
            overlayMgr.setVisibility(_this._flatOverlayId, false);
            overlayMgr.addNodes(_this._flatOverlayId, [flatId, _this._sphereId]);
            _this._viewer.getModel().getNodesBounding([flatId]).then(function (box) {
                var centerX = box.min.x + (box.max.x - box.min.x) / 2;
                var centerY = box.min.y + (box.max.y - box.min.y) / 2;
                var camera = new Communicator.Camera();
                var margin = 1000;
                camera.setPosition(new Communicator.Point3(centerX, centerY, box.max.z));
                camera.setTarget(new Communicator.Point3(centerX, centerY, 0));
                camera.setUp(new Communicator.Point3(0, 1, 0));
                camera.setWidth(box.max.x - box.min.x + margin * 2);
                camera.setHeight(box.max.y - box.min.y + margin * 2);
                camera.setProjection(Communicator.Projection.Orthographic);
                overlayMgr.setCamera(_this._flatOverlayId, camera);
                // _this._viewer.resumeRendering();
                _this._layoutOverray();

                $("#filter1ParentBtn").removeClass("btn-default");
                $("#filter1ParentBtn").addClass("btn-primary");
                $("#filter1Btns").slideDown();

                _this._setWalkMode();
                _this._cameraNavigate = camera;

            });
        }

        function cameraFunc(camera) {
            if (_this._viewer.getOperatorManager().indexOf(Communicator.OperatorId.Walk) != -1) {
                var vector1 = new Communicator.Point3(1, 0, 0);
                var position = camera.getPosition();
                var target = camera.getTarget();
                var vector2 = Communicator.Point3.subtract(target, position);
                var angle = Communicator.Util.computeAngleBetweenVector(vector1, vector2);
                var cross = Communicator.Point3.cross(vector1, vector2);

                var matrixT = new Communicator.Matrix();
                //matrixT.scale(0.3);
                matrixT.setTranslationComponent(position.x, position.y, 12720);
                var matrixR = new Communicator.Matrix.createFromOffAxisRotation(cross, angle);
                _this._viewer.getModel().setNodeMatrix(_this._sphereId, Communicator.Matrix.multiply(matrixR, matrixT));
            }
            var json = camera.forJson();
            var str = JSON.stringify(json);
        }

        function selectionFunc(SelectionEvent) {
            if (_this._mobileEvent != undefined) {
                _this._mobileEvent.walkStop();
                setTimeout(function () {
                    _this._mobileEvent.walkStart();
                }, 500);
            }

            var selectionItem = SelectionEvent.getSelection();
            var nodeId = selectionItem.getNodeId();
            if (nodeId > 0) {
                var parentNode = _this._viewer.getModel().getNodeParent(nodeId);
                _this.setPartInfo(parentNode);
            } else {
                _this.setPartInfo();
            }
        }

        _this._viewer.setCallbacks({
            sceneReady: sceneReadyFunc,
            modelStructureReady: modelStructureReadyFunc,
            camera: cameraFunc,
            selection: selectionFunc
        });

        _this._viewer.start();
        _this._walkFunc = new WalkFunc(_this._viewer);


        var token = hwv._params.endpointUri.split("=")[1];

        $(window).bind('beforeunload', function () {
            $.get('/api/delete_token?token=' + [token]);
        });
        console.log($(window));

    });
};

BIM_viewer_mobile.prototype._layoutOverray = function () {
    var _this = this;
    let wsize = $(window).width();
    let hsize = $(window).height();

    var axisTriad = _this._viewer.getView().getAxisTriad();
    if (wsize > 380 && hsize > 380) {
        axisTriad.enable();
    } else {
        axisTriad.disable();
    }

    var size = 300;
    if (wsize < hsize) {
        if (((wsize - 72) / 2) < 300) {
            size = (wsize - 72) / 2;
        }
    } else {
        if (((hsize - 72) / 2) < 300) {
            size = (hsize - 72) / 2;
        }
    }

    var overlayMgr = _this._viewer.getOverlayManager();
    overlayMgr.setViewport(
        _this._flatOverlayId, Communicator.OverlayAnchor.LowerRightCorner,
        5, Communicator.OverlayUnit.Pixels, 10, Communicator.OverlayUnit.Pixels,
        size, Communicator.OverlayUnit.Pixels, size, Communicator.OverlayUnit.Pixels);
};

BIM_viewer_mobile.prototype._initEvents = function () {
    var _this = this;

    var resizeTimer;
    var interval = Math.floor(1000 / 60 * 10);
    $(window).resize(function () {
        if (resizeTimer !== false) {
            clearTimeout(resizeTimer);
        }
        resizeTimer = setTimeout(function () {
            layoutPage()
            _this._viewer.resizeCanvas();
            _this._layoutOverray();
        }, interval);
    });

    layoutPage();
    function layoutPage() {
        var imgWidth, imgHeight;
        if (window.orientation == 0 || window.orientation == 180) {
            imgWidth = 240;
            imgHeight = 320;
        } else {
            imgWidth = 320;
            imgHeight = 240;
        }

        var hsize = $(window).height();
        var wsize = $(window).width();
        $("#partProperty").css("max-height", hsize - (imgHeight + 53) + "px");
        $("#partProperty").css("max-width", wsize + "px");
        $("#mycanvas").css("width", imgWidth + "px");
        $("#mycanvas").css("height", imgHeight + "px");
    }

    if (_this._screenConf == Communicator.ScreenConfiguration.Mobile || (window.DeviceMotionEvent && typeof window.DeviceMotionEvent.requestPermission === "function")) {

        $("#file_image").change(function (e) {
            $("#mask_file_01").val($("#file_image").val());

            var file = e.target.files;
            var reader = new FileReader();
            reader.readAsDataURL(file[0]);
            reader.onload = function () {
                var img = readImg(reader);
                img.onload = function () {
                    _this._drawImg(img);
                    _this._img = img;
                }
            }
        });

        $(".file_mask").show();
        $("#mask_file_01").click(function () {
            $("#file_image").click();
        });
    }

    $(".inspectionBtn").on("click", function () {
        var id = $(this).data("id");
        if (id == "OK") {
            _this._viewer.getModel().setNodesFaceColor([_this._currentNodeId], new Communicator.Color(0, 255, 0));
        } else if (id == "NG") {
            _this._viewer.getModel().setNodesFaceColor([_this._currentNodeId], new Communicator.Color(255, 0, 0));
        }

        if ((id == "OK" || id == "NG") && _this._img != undefined) {
            var isExist = false;
            for (var i = 0; i < _this._captures.length; i++) {
                if (_this._captures[i].nodeId == _this._currentNodeId) {
                    _this._captures[i].img = _this._img;
                    isExist = true;
                    i = _this._captures.length;
                }
            }
            if (!isExist) {
                var obj = { nodeId: _this._currentNodeId, img: _this._img };
                _this._captures.push(obj);
            }
        }

        _this._viewer.getSelectionManager().clear();
        _this._img = undefined;
    })


    // if (_this._debug != undefined)
    //     $(".debug").show();

    // View
    $("#filter1ParentBtn").on("click", function () {
        var waitTime = 0;

        if ($("#filter1Btns").is(":visible")) {
            $("#filter1Btns").slideUp();
            $(this).removeClass("btn-primary");
            $(this).addClass("btn-default");
            _this._cameraWalk = _this._viewer.getView().getCamera();
            _this._resetWalkMode();
        } else {
            $(this).removeClass("btn-default");
            $(this).addClass("btn-primary");
            setTimeout(function () {
                $("#filter1Btns").slideDown();
            }, waitTime);
            _this._cameraNavigate = _this._viewer.getView().getCamera();
            _this._setWalkMode();
        }
    });
    $(".filter1Btn").on("click", function () {
        var id = $(this).data("id");
        _this._setWalkMode(id);

    });

    $("#testBtn").click(function (e) {
        var camera = _this._viewer.getView().getCamera();
        var json = camera.forJson();
        var str = JSON.stringify(json);
    });

    $(".arrowBtn").on("click", function () {
        var dir = $(this).data("dir");
        if (dir == "forward")
            _this._walkFunc.walkFoward(1000);
        else if (dir == "backward")
            _this._walkFunc.walkFoward(-1000);
        else if (dir == "left")
            _this._walkFunc.walkCrab(1000);
        else if (dir == "right")
            _this._walkFunc.walkCrab(-1000);
        else if (dir == "turnLeft")
            _this._walkFunc.horizontalRotation(90);
        else if (dir == "turnRight")
            _this._walkFunc.horizontalRotation(-90);
    });

    $(".flatArrowBtn").on("click", function () {
        var camera = _this._viewer.getView().getCamera();
        var width = camera.getWidth();
        var height = camera.getHeight();
        var position = camera.getPosition();
        var target = camera.getTarget();

        var dir = $(this).data("dir");
        if (dir == "up") {

        } else if (dir == "down") {

        } else if (dir == "left") {

        } else if (dir == "right") {

        }
    });

    $(".zoomBtn").on("click", function () {
        var camera = _this._viewer.getView().getCamera();
        var width = camera.getWidth();
        var height = camera.getHeight();

        var dir = $(this).data("dir");
        if (dir == "up") {
            width *= 0.8;
            height *= 0.8;
        } else if (dir == "down") {
            width *= 1.2;
            height *= 1.2;
        }
        camera.setWidth(width);
        camera.setHeight(height);
        _this._viewer.getView().setCamera(camera);
    });
};

BIM_viewer_mobile.prototype._resetWalkMode = function () {
    var _this = this;

    _this.setPartInfo();
    _this._viewer.getSelectionManager().clear();

    _this._viewer.getModel().setNodesVisibility([5], false)
    _this._viewer.getView().setCamera(_this._cameraNavigate, 0);
    _this._viewer.getOperatorManager().clear();
    _this._viewer.getOperatorManager().push(Communicator.OperatorId.Navigate);
    _this._viewer.getOperatorManager().push(Communicator.OperatorId.Select);

    $("#arrowBtns").hide();
    $(".arrowBtnRL").hide();
    $("#zoomBtns").show();
    //    $(".flatArrowBtns").show();
    _this._viewer.getOverlayManager().setVisibility(_this._flatOverlayId, false);
};

BIM_viewer_mobile.prototype._setWalkMode = function (cameraId) {
    var _this = this;

    _this.setPartInfo();
    _this._viewer.getSelectionManager().clear();

    _this._viewer.getModel().setNodesVisibility([5], true);
    if (cameraId != undefined)

        _this._cameraWalk = Communicator.Camera.construct(cameraViews[cameraId]);
    _this._viewer.getView().setCamera(_this._cameraWalk, 0);

    _this._viewer.getOperatorManager().clear();
    _this._viewer.getOperatorManager().push(Communicator.OperatorId.Select);
    //    _this._viewer.getOperatorManager().push(_this._selectOperatorHandle);
    _this._viewer.getOperatorManager().push(Communicator.OperatorId.Walk);

    $("#arrowBtns").show();
    $(".arrowBtnRL").show();
    $("#zoomBtns").hide();
    //    $(".flatArrowBtns").hide();
    _this._viewer.getOverlayManager().setVisibility(_this._flatOverlayId, true);

    if (_this._mobileEvent != undefined)
        _this._mobileEvent.ResetPrevious();

    document.getElementById('rotationRateGamma').innerHTML = "";
};

BIM_viewer_mobile.prototype.setPartInfo = function (nodeId) {
    var _this = this;

    if (nodeId == undefined) {
        $("#inspectionToolbar").hide();
        $("#partProperty").hide();
        $("#mycanvas").hide();
        _this._currentNodeId = -1;
        return;
    }

    $("#inspectionToolbar").show();

    _this._viewer.getModel().getNodeProperties(nodeId).then(function (properties) {
        if (properties) {
            $("#partProperty").show();
            var table = document.getElementById("partPropertyTable");

            var rowCount = table.rows.length;
            for (var i = 2; i < rowCount; i++) {
                table.deleteRow(-1);
            }

            if (Object.keys(properties).length <= 3) {
                checkParentNode(table, properties, nodeId)
            }
            else {
                for (var elementName in properties) {
                    var row = table.insertRow(-1);
                    var cell = row.insertCell(-1);
                    cell.innerHTML = elementName;
                    var cell = row.insertCell(-1);
                    cell.innerHTML = properties[elementName];
                }

                $("#mycanvas").hide();
                if (_this._captures != undefined) {
                    for (var i = 0; i < _this._captures.length; i++) {
                        if (_this._captures[i].nodeId == nodeId) {
                            var img = _this._captures[i].img;
                            _this._drawImg(img);
                            i = _this._captures.length
                        }
                    }
                }
                _this._currentNodeId = nodeId;
            }
        }
    });

    function checkParentNode(table, properties, nodeId) {
        var parentNodeId = _this._viewer.model.getNodeParent(nodeId);
        _this._viewer.getModel().getNodeProperties(parentNodeId).then(function (parentProperties) {
            if (parentProperties) {

                var combinedProperties = Object.assign({}, properties, parentProperties);

                for (var elementName in combinedProperties) {
                    var row = table.insertRow(-1);
                    var cell = row.insertCell(-1);
                    cell.innerHTML = elementName;
                    var cell = row.insertCell(-1);
                    cell.innerHTML = combinedProperties[elementName];
                    //                row.style.backgroundColor = "#ffffff";
                }

                $("#mycanvas").hide();
                if (_this._captures != undefined) {
                    for (var i = 0; i < _this._captures.length; i++) {
                        if (_this._captures[i].nodeId == nodeId) {
                            var img = _this._captures[i].img;
                            _this._drawImg(img);
                            i = _this._captures.length
                        }
                    }
                }

                _this._currentNodeId = nodeId;

            }
        });
    }
};

BIM_viewer_mobile.prototype._drawImg = function (img) {
    var _this = this;
    var canvas = document.getElementById('mycanvas');
    var rad;
    switch (window.orientation) {
        case 0: //portrait 
            rad = 90;
            break;
        case 180:   //this is upside down I think 
            rad = -90;
            break;
        case -90: // right til
            rad = 180;
            break;
        default:    //left tilt for iphone 
            rad = 0;
            break;
    }
    readDrawImg(img, canvas, 0, 0, rad);

    var hsize = $("#partProperty").height();
    $("#mycanvas").css("top", hsize + 53 + "px");
    $("#mycanvas").show();
};

