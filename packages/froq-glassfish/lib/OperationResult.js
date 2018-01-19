"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Command = require("./Command");

var _Command2 = _interopRequireDefault(_Command);

var _Method = require("./Method");

var _Method2 = _interopRequireDefault(_Method);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var OperationResult = function () {
    function OperationResult(json) {
        _classCallCheck(this, OperationResult);

        this._json = json;
    }

    _createClass(OperationResult, [{
        key: "isSuccess",
        value: function isSuccess() {
            return this.exitCode === 'SUCCESS';
        }

        /**
         * The name of the resource/object that is the target
         * of the operation (in case of a successful operation)
         * or the name of the method or command executed (in
         * case of a failed operation).
         */

    }, {
        key: "asError",
        value: function asError() {
            return new Error("exit_code: " + this.exitCode + ", message: " + this.message);
        }
    }, {
        key: "command",
        get: function get() {
            return this._json.command;
        }

        /**
         * The result of the operation’s execution, either
         * SUCCESS or FAILURE.
         */

    }, {
        key: "exitCode",
        get: function get() {
            return this._json.exit_code;
        }

        /**
         * A list of child resources for the target resource.
         * Each child resource is specified as a key-value pair
         * of the resource`s name and it`s URL. This property is
         * only available for the results of query operations.
         */

    }, {
        key: "childResources",
        get: function get() {
            return this._json.extraProperties && this._json.extraProperties.childResources;
        }

        /**
         * A string detailing the exact asadmin command executed
         * on the server. This property is only available for the
         * results of add, update or delete operations.
         */

    }, {
        key: "commandLog",
        get: function get() {
            return this._json.extraProperties && this._json.extraProperties.commandLog;
        }

        /**
         * A list of metadata sets of the available non-CRUD
         * operations (asadmin subcommands) that can be executed
         * on the target resource. This property is only available
         * for the results of query operations.
         */

    }, {
        key: "commands",
        get: function get() {
            var commands = this._json.extraProperties && this._json.extraProperties.commands || [];
            return commands.map(function (command) {
                return new _Command2.default(command);
            });
        }

        /**
         * Represents the current configuration of a resource.
         * Each property of the resource is configured as a
         * key-value pair of the object itself.
         */

    }, {
        key: "entity",
        get: function get() {
            return this._json.extraProperties && this._json.extraProperties.entity;
        }

        /**
         * A list of medatada sets of available CRUD methods
         * that the target resource supports. This property
         * is only available for the results of query operations.
         */

    }, {
        key: "methods",
        get: function get() {
            var methods = this._json.extraProperties && this._json.extraProperties.methods || [];
            return methods.map(function (method) {
                return new _Method2.default(method);
            });
        }

        /**
         * Details the message the server sends in case of 
         * encountering an error in executing the operation. 
         * If no error was encountered, this property is empty.
         */

    }, {
        key: "message",
        get: function get() {
            return this._json.message;
        }
    }]);

    return OperationResult;
}();

exports.default = OperationResult;
//# sourceMappingURL=OperationResult.js.map