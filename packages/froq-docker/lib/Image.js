"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

class Image {

    /**
     * @param {Docker} docker
     */
    constructor(docker, name) {
        this._docker = docker;
        this._name = name;
    }

    get name() {
        return this._name;
    }

    createContainer({ data = {}, name = undefined }) {
        var _this = this;

        return _asyncToGenerator(function* () {
            return yield _this._docker.createContainer({
                data: Object.assign({}, data, {
                    Image: _this._name
                }),
                name
            });
        })();
    }

    remove({ force = undefined, noprune = undefined } = {}) {
        var _this2 = this;

        return _asyncToGenerator(function* () {
            return yield _this2._docker.removeImage({ name: _this2._name, force, noprune });
        })();
    }
}
exports.default = Image;