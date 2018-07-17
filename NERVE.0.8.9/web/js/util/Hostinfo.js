class HostInfo {
    constructor() {
        let prequel = "ws://";
        let host = window.location.host;
        if (host === "beta.cwrc.ca") host = "dh.sharcnet.ca";
        if (window.location.protocol === "https:") prequel = "wss://";
        
        this.rootSocketAddress = `${prequel}${host}/${HostInfo.rootPath()}/NerveSocket`;
        
//        this.dictionarySocketAddress = `${prequel}${host}/${HostInfo.rootPath()}/Dictionary`;
//        this.scriberSocketAddress = `${prequel}${host}/${HostInfo.rootPath()}/Scriber`;
    }

    static getType(){ return HostInfo;}
    static rootPath(){ return window.location.pathname.split("/")[1];}
};

module.exports = HostInfo;