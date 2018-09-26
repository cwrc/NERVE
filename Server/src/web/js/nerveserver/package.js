let nerveserver = {};
nerveserver.Scriber = require("./Scriber");
nerveserver.NerveRoot = require("./NerveRoot");
nerveserver.EntityValues = require("./EntityValues");
nerveserver.EncodeResponse = require("./EncodeResponse");
nerveserver.Dictionary = require("./Dictionary");
nerveserver.ProgressMonitor = require("./ProgressMonitor");

if (typeof module !== "undefined") module.exports = nerveserver;