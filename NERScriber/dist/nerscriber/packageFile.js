"use strict;";
let nerscriber = {};
nerscriber.ProgressStage = require("./ProgressStage");
nerscriber.ProgressPacket = require("./ProgressPacket");
nerscriber.TagInfo = require("./TagInfo");

if (typeof module !== "undefined") module.exports = nerscriber;