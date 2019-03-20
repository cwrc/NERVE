let nerscriber = {};
nerscriber.SQLResult = require("./SQLResult");
nerscriber.SQLRecord = require("./SQLRecord");
nerscriber.SQLEntry = require("./SQLEntry");
nerscriber.ProgressStage = require("./ProgressStage");
nerscriber.ProgressPacket = require("./ProgressPacket");
nerscriber.TagInfo = require("./TagInfo");

if (typeof module !== "undefined") module.exports = nerscriber;