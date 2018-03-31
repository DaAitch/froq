export default class PullEvent {
    constructor (event) {
        this._event = event;
    }

    get status () {
        return this._event.status;
    }

    isProgress () {
        return !!this._event.progress;
    }

    get progress () {
        return this._event.progress;
    }

    get currentBytes () {
        return this._event.progressDetail.current;
    }

    get totalBytes () {
        return this._event.progressDetail.total;
    }

    get id () {
        return this._event.id;
    }
}
