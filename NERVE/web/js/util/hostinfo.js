module.exports = class HostInfo {
    constructor() {
        let prequel = "ws://";
        let host = window.location.host;
        if (host === "beta.cwrc.ca") host = "dh.sharcnet.ca";
        if (window.location.protocol === "https:") prequel = "wss://";
        this.dictionarySocketAddress = `${prequel}${host}/NERVE/Dictionary`;
        this.scriberSocketAddress = `${prequel}${host}/NERVE/Scriber`;
    }

    static getType(){ return HostInfo;}
};