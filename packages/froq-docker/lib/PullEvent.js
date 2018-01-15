"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PullEvent = function () {
    function PullEvent(event) {
        _classCallCheck(this, PullEvent);

        this._event = event;
    }

    _createClass(PullEvent, [{
        key: "isProgress",
        value: function isProgress() {
            return !!this._event.progress;
        }
    }, {
        key: "status",
        get: function get() {
            return this._event.status;
        }
    }, {
        key: "progress",
        get: function get() {
            return this._event.progress;
        }
    }, {
        key: "currentBytes",
        get: function get() {
            return this._event.progressDetail.current;
        }
    }, {
        key: "totalBytes",
        get: function get() {
            return this._event.progressDetail.total;
        }
    }, {
        key: "id",
        get: function get() {
            return this._event.id;
        }
    }]);

    return PullEvent;
}();

exports.default = PullEvent;
//# sourceMappingURL=PullEvent.js.map