import Docker from './Docker';

export default {
    fromSocket: socketFile => {
        return Docker.fromSocket(socketFile);
    }
};