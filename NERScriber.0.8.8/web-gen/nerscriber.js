let package = {};
package.NameSource = require("./NameSource");
package.ProgressStage = require("./ProgressStage");
package.Context = require("./Context");
package.TagInfo = require("./TagInfo");
package.Constants = require("./Constants");
package.ProgressPacket = require("./ProgressPacket");

if (typeof module !== "undefined") module.exports = package;