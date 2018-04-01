'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _Exec = require('./Exec');

var _Exec2 = _interopRequireDefault(_Exec);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

class Container {

    /**
     * @param {Docker} docker
     * @param {string} id
     */
    constructor(docker, id) {
        this._docker = docker;
        this._id = id;
    }

    get id() {
        return this._id;
    }

    start(detachKeys = undefined) {
        var _this = this;

        return _asyncToGenerator(function* () {
            return yield _this._docker.startContainer({
                id: _this._id,
                detachKeys
            });
        })();
    }

    stop(t = undefined) {
        var _this2 = this;

        return _asyncToGenerator(function* () {
            return yield _this2._docker.stopContainer({
                id: _this2._id,
                t
            });
        })();
    }

    wait(condition = undefined) {
        var _this3 = this;

        return _asyncToGenerator(function* () {
            return yield _this3._docker.waitForContainer({
                id: _this3._id,
                condition
            });
        })();
    }

    remove({ force = undefined, link = undefined, v = undefined } = {}) {
        var _this4 = this;

        return _asyncToGenerator(function* () {
            return yield _this4._docker.removeContainer({
                id: _this4._id,
                force,
                link,
                v
            });
        })();
    }

    inspect(size = undefined) {
        var _this5 = this;

        return _asyncToGenerator(function* () {
            return yield _this5._docker.inspectContainer({
                id: _this5._id,
                size
            });
        })();
    }

    attach(streamCb) {
        var _this6 = this;

        return _asyncToGenerator(function* () {
            return yield _this6._docker.attachContainer({
                id: _this6._id
            }, streamCb);
        })();
    }

    createExec(data) {
        var _this7 = this;

        return _asyncToGenerator(function* () {
            const result = yield _this7._docker.createContainerExec({
                id: _this7._id,
                data
            });

            return new _Exec2.default(_this7._docker, result && result.Id);
        })();
    }

}
exports.default = Container;