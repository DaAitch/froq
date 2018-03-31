"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Inspection = function () {
    function Inspection(docker, data) {
        _classCallCheck(this, Inspection);

        this._docker = docker;
        this._data = data;
    }

    _createClass(Inspection, [{
        key: "getHostAddresses",
        value: function getHostAddresses(containerPort) {
            var ports = this.ports || {};
            var bindings = ports[containerPort] || [];
            return bindings.map(function (binding) {
                return binding && binding.HostIp + ":" + binding.HostPort;
            }).filter(function (binding) {
                return binding;
            });
        }
    }, {
        key: "getFirstHostAddress",
        value: function getFirstHostAddress(containerPort) {
            var addresses = this.getHostAddresses(containerPort) || [];
            if (addresses.length > 0) {
                return addresses[0];
            }

            return undefined;
        }
    }, {
        key: "data",
        get: function get() {
            return this._data;
        }
    }, {
        key: "id",
        get: function get() {
            var data = this.data;
            return data && data.Id;
        }
    }, {
        key: "networkSettings",
        get: function get() {
            var data = this.data;
            return data && data.NetworkSettings;
        }
    }, {
        key: "ports",
        get: function get() {
            var networkSettings = this.networkSettings;
            return networkSettings && networkSettings.Ports;
        }
    }]);

    return Inspection;
}();

exports.default = Inspection;