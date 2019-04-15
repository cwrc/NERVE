"use strict;";
let nerscriber = {};
nerscriber.SQLResult = require("./SQLResult");
nerscriber.SQLRecord = require("./SQLRecord");
nerscriber.SQLEntry = require("./SQLEntry");
nerscriber.ProgressStage = require("./ProgressStage");
nerscriber.ProgressPacket = require("./ProgressPacket");
nerscriber.EntityValues = require("./EntityValues");
nerscriber.Dictionary = require("./Dictionary");
nerscriber.TagInfo = require("./TagInfo");

if (typeof module !== "undefined") module.exports = nerscriber;