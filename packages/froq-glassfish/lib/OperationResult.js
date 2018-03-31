'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _Command = require('./Command');

var _Command2 = _interopRequireDefault(_Command);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class OperationResult {
    constructor(json) {
        this._json = json;
    }

    isSuccess() {
        return this.exitCode === 'SUCCESS';
    }

    /**
     * The name of the resource/object that is the target
     * of the operation (in case of a successful operation)
     * or the name of the method or command executed (in
     * case of a failed operation).
     */
    get command() {
        return this._json.command;
    }

    /**
     * The result of the operation’s execution, either
     * SUCCESS or FAILURE.
     */
    get exitCode() {
        return this._json.exit_code;
    }

    /**
     * A list of child resources for the target resource.
     * Each child resource is specified as a key-value pair
     * of the resource`s name and it`s URL. This property is
     * only available for the results of query operations.
     */
    get childResources() {
        return this._json.extraProperties && this._json.extraProperties.childResources;
    }

    /**
     * A string detailing the exact asadmin command executed
     * on the server. This property is only available for the
     * results of add, update or delete operations.
     */
    get commandLog() {
        return this._json.extraProperties && this._json.extraProperties.commandLog;
    }

    /**
     * A list of metadata sets of the available non-CRUD
     * operations (asadmin subcommands) that can be executed
     * on the target resource. This property is only available
     * for the results of query operations.
     */
    get commands() {
        const commands = this._json.extraProperties && this._json.extraProperties.commands || [];
        return commands.map(command => new _Command2.default(command));
    }

    /**
     * Represents the current configuration of a resource.
     * Each property of the resource is configured as a
     * key-value pair of the object itself.
     */
    get entity() {
        return this._json.extraProperties && this._json.extraProperties.entity;
    }

    /**
     * Details the message the server sends in case of
     * encountering an error in executing the operation.
     * If no error was encountered, this property is empty.
     */
    get message() {
        return this._json.message;
    }

    asError() {
        return new Error(`exit_code: ${this.exitCode}, message: ${this.message}`);
    }
}
exports.default = OperationResult;