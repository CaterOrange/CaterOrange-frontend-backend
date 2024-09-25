// gidStorage.js
const gidStorage = {
    gid: 'No userId',

    setGid(gid) {
        this.gid = gid;
    },

    getGid() {
        return this.gid;
    }
};

module.exports = gidStorage;