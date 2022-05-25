var currentMobileEventListener;
let requesPermissionButton = document.getElementById("enable-device-motion");

function MobileEventListener(viewer, op) {
    this._viewer = viewer;
    this._walkOperator = op;

    this._walkStop = false;
    this._previousHOrient;
    this._previousVOrient;
    this._VMax;
    this._VMin;
    this._rollStop = false;

    if (window.DeviceMotionEvent && typeof window.DeviceMotionEvent.requestPermission === "function") {
        currentMobileEventListener = this;
        document.getElementById("enable-device-motion").style.visibility = "visible"
        document.getElementById("transparent-div").style.visibility = "visible";
    }
    else {
        this._start();
    }
}

requesPermissionButton.onclick = function (e) {
    e.preventDefault();
    window.DeviceMotionEvent.requestPermission();
    document.getElementById("enable-device-motion").style.visibility = "hidden"
    document.getElementById("transparent-div").style.visibility = "hidden";
    currentMobileEventListener._start();
}

MobileEventListener.prototype.ResetPrevious = function () {
    var _this = this;

    _this._previousHOrient = undefined;
    _this._previousVOrient = undefined;
    _this._previousROrient = undefined;

    _this._maxX = -100;
    _this._minX = 100;
    _this._maxY = -100;
    _this._minY = 100;
    _this._maxZ = -100;
    _this._minZ = 100;

}

MobileEventListener.prototype.walkStop = function () {
    var _this = this;
    _this._walkStop = true;
};

MobileEventListener.prototype.walkStart = function () {
    var _this = this;
    _this._walkStop = false;
};

MobileEventListener.prototype._start = function () {
    var _this = this;
    window.addEventListener('deviceorientation', function (event) {
        document.getElementById('orientation').innerHTML = "Orientation = " + window.orientation;
        document.getElementById('compassHeading').innerHTML = "Compass Heading = " + Math.round(event.webkitCompassHeading * 10) / 10 + ", Accuracy = " + event.webkitCompassAccuracy;

        function GetVOrient() {
            switch (window.orientation) {
                case 0:
                    return event.beta;
                    break;
                case 180:
                    return -event.beta;
                    break;
                case 90:
                    var ang = -event.gamma;
                    if (-90 < ang && ang < -25)
                        return 90 + 90 + ang;
                    else
                        return ang;
                    break;
                case -90:
                    var ang = event.gamma;
                    if (-90 < ang && ang < -25)
                        return 90 + 90 + ang;
                    else
                        return ang;
                    break;
            }
        }

        function GetROrient() {
            switch (window.orientation) {
                case 0:
                    return event.gamma;
                    break;
                case 180:
                    return -event.gamma;
                    break;
                case 90:
                    return event.beta;
                    break;
                case -90:
                    return -event.beta;
                    break;
            }
        }

        if (_this._viewer == undefined)
            return;


        if (_this._viewer.getOperatorManager().indexOf(Communicator.OperatorId.Walk) == -1)
            return;

        var upLimit, downLimit;
        if (_this._previousHOrient == undefined)
            _this._previousHOrient = event.alpha;

        if (_this._previousVOrient == undefined) {
            _this._previousVOrient = GetVOrient();
            _this._VMax = _this._previousVOrient + 90;
            if (_this._VMax > 140)
                _this._VMax = 140;
            _this._VMin = _this._previousVOrient - 90;
            if (_this._VMin < -25)
                _this._VMin = -25;
        }
        if (_this._previousROrient == undefined)
            _this._previousROrient = GetROrient();

        var vOrient = GetVOrient();
        if (_this._VMin < vOrient && vOrient < _this._VMax && Math.abs(_this._previousVOrient - vOrient) > 2) {
            var angle = _this._previousVOrient - vOrient;
            _this._walkOperator.verticalRotation(angle);

            _this._previousVOrient = vOrient;
        }

        if (vOrient < -10)
            return;

        if (87 < vOrient && vOrient < 93)
            return;

        var alpha = event.alpha;
        if (window.orientation == 90 || window.orientation == -90) {
            if (90 < vOrient) {
                if (alpha < 180)
                    alpha += 180;
                else
                    alpha -= 180;
            }
        }
        if ((_this._VMin + 2) < _this._previousVOrient && _this._previousVOrient < (_this._VMax - 5)) {
            if (Math.abs(_this._previousHOrient - alpha) > 2) {
                var angle = alpha - _this._previousHOrient;
                _this._walkOperator.horizontalRotation(angle);

                _this._previousHOrient = alpha;
            }
        }

        var rOrient = GetROrient();
    });

    window.addEventListener('devicemotion', function (event) {
        if (_this._viewer == undefined)
            return;

        if (_this._viewer.getOperatorManager().indexOf(Communicator.OperatorId.Walk) == -1)
            return;

        switch (window.orientation) {
            case 0:
                var x = event.acceleration.x; // 左右
                var y = event.acceleration.y; // 上下
                break;
            case 180:
                var x = -event.acceleration.x; // 左右
                var y = -event.acceleration.y; // 上下
                break;
            case 90:
                var y = - event.acceleration.x; // 左右
                var x = - event.acceleration.y; // 上下
                break;
            case -90:
                var y = event.acceleration.x; // 左右
                var x = event.acceleration.y; // 上下
                break;
        }
        var z = event.acceleration.z; // 前後

        document.getElementById('info1').innerHTML = y;
        if (!_this._walkStop && Math.abs(y) > 1.5) {
            _this._walkStop = true;

        }

        x = Math.round(x * 10) / 10;
        y = Math.round(y * 10) / 10;
        z = Math.round(z * 10) / 10;

        if (_this._maxX < x)
            _this._maxX = x;
        if (_this._minX > x)
            _this._minX = x;
        if (_this._maxY < y)
            _this._maxY = y;
        if (_this._minY > y)
            _this._minY = y;
        if (_this._maxZ < z)
            _this._maxZ = z;
        if (_this._minZ > z)
            _this._minZ = z;

        document.getElementById('rotationRateAlpha').innerHTML = "左右 = " + ", " + _this._minX + ", " + _this._maxX + x;
        document.getElementById('rotationRateBeta').innerHTML = "上下 = " + ", " + _this._minY + ", " + _this._maxY + y;
        document.getElementById('rotationRateGamma').innerHTML = "前後 = " + ", " + _this._minZ + ", " + _this._maxZ + z;

    }
    );
}



