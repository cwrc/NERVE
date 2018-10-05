/* global Utility, Context */

const jQuery = require("jquery");
const $ = jQuery;

(function ($) {
    $.fn.mergeElements = function (name = "div") {
        let range = $(this).asRange();
        let element = document.createElement(name);
        range.surroundContents(element);
        $(this).contents().unwrap();
        return $(element);
    };
}(jQuery));

(function ($) {
    $.fn.wrap = function (name = "div") {
        let range = $(this).asRange();
        let element = document.createElement(name);
        range.surroundContents(element);
        return $(element);
    };
}(jQuery));

(function ($) {
    $.fn.selectAsRange = function () {
        let range = $(this).asRange();
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
        return this;
    };
}(jQuery));

(function ($) {    
    $.fn.asRange = function () {
        let start = null;
        let end = null;

        this.each(function () {
            let range = new Range();
            range.setStartBefore($(this).get(0));
            range.setEndAfter($(this).get(0));
            if (start === null || range.startOffset < start.startOffset) start = range;
            if (end === null || range.endOffset > end.endOffset) end = range;
        });

        let range = new Range();
        range.setStart(start.startContainer, start.startOffset);
        range.setEnd(end.endContainer, end.endOffset);
        return range;
    };
}(jQuery));

/**
 * Get/Set an xml attribute of this entity.  An xml attribute will be present when the document is decoded.
 * @param {type} $
 * @returns {undefined}
 */
(function ($) {
    $.fn.xmlAttr = function (key, value) {
        if (key === "" && value) throw new Error("Empty key value.");

        if (typeof value === "undefined") {
            let xmlAttr = $(this).attr($.fn.xmlAttr.defaults.attrName);
            if (typeof xmlAttr === "undefined") return xmlAttr;
            let jsonObj = JSON.parse(xmlAttr);
            return jsonObj[key];
        }

        return this.each(function () {
            let xmlAttr = $(this).attr($.fn.xmlAttr.defaults.attrName);
            if (!xmlAttr) {
                $(this).attr($.fn.xmlAttr.defaults.attrName, "{}");
                xmlAttr = $(this).attr($.fn.xmlAttr.defaults.attrName);
            }

            let jsonObj = JSON.parse(xmlAttr);
            jsonObj[key] = value;
            $(this).attr($.fn.xmlAttr.defaults.attrName, JSON.stringify(jsonObj));
        });
    };
}(jQuery));

/**
 * Get/Set an xml attribute of this entity.  An xml attribute will be present when the document is decoded.
 * @param {type} $
 * @returns {undefined}
 */
(function ($) {
    $.fn.renameXMLAttr = function (fromKey, toKey) {
        if (!fromKey) return;
        if (!toKey) return;
        if (fromKey === toKey) return;

        return this.each(function () {
            let xmlAttr = $(this).attr($.fn.xmlAttr.defaults.attrName);
            /* all divs that come from encode will have this attribute */
            if (typeof xmlAttr !== "undefined") {
                let jsonObj = JSON.parse(xmlAttr);
                jsonObj[toKey] = jsonObj[fromKey];
                delete jsonObj[fromKey];
                $(this).attr($.fn.xmlAttr.defaults.attrName, JSON.stringify(jsonObj));
            }
        });
    };
}(jQuery));

/**
 * Get/Set the value of the collection attribute of this entity.  This is not
 * an xml attribute.  Will return an empty string if no collection found.
 * @param {type} $
 * @returns {undefined}
 */
(function ($) {
    $.fn.collection = function (value) {
        if (typeof value === "undefined") {
            let collection = $(this).attr("data-collection");
            if (!collection) collection = "";
            return collection;
        }

        return this.each(function () {
            if (value === "") {
                $(this).removeAttr("data-collection");
            } else {
                $(this).attr("data-collection", value);
            }
        });
    };
}(jQuery));

/**
 * Get/Set the value of the lemma attribute of this entity.
 * @param {type} $
 * @returns {undefined}
 */
(function ($) {
    $.fn.lemma = function (value) {
        var context = $.fn.xmlAttr.context;

        if (typeof value === "undefined") {
            let tagName = $(this).tag();
            let lemmaAttr = context.getTagInfo(tagName).getLemmaAttribute();
            return $(this).xmlAttr(lemmaAttr);
        }

        return this.each(function () {
            let tagName = $(this).tag();
            let lemmaAttr = context.getTagInfo(tagName).getLemmaAttribute();
            if (lemmaAttr !== "") $(this).xmlAttr(lemmaAttr, value);
        });
    };
}(jQuery));

/**
 * Get/Set the value of the link attribute of this entity.
 * @param {type} $
 * @returns {undefined}
 */
(function ($) {
    $.fn.link = function (value) {
        var context = $.fn.xmlAttr.context;

        if (typeof value === "undefined") {
            let tagName = $(this).tag();
            let linkAttr = context.getTagInfo(tagName).getLinkAttribute();
            return $(this).xmlAttr(linkAttr);
        }

        return this.each(function () {
            let tagName = $(this).tag();
            let linkAttr = context.getTagInfo(tagName).getLinkAttribute();
            $(this).xmlAttr(linkAttr, value);
        });
    };
}(jQuery));

/**
 * Get/Set the value of the tag attribute of this entity.
 * Accepts a standard tag, displays a schema tag.
 * @param {type} $
 * @returns {undefined}
 */
(function ($) {
    $.fn.tag = function (standardTag) {
        if (!standardTag) {
            return $(this).attr($.fn.xmlAttr.defaults.xmlTagName);
        }

        /* when changing the entity tag, attribute name of the link & lemma attributes may change */
        return this.each(function () {
            return $(this).attr($.fn.xmlAttr.defaults.xmlTagName, standardTag);
        });
    };
}(jQuery));

const CustomQuery = {
    instance : new CustomQuery()    
};

module.exports = CustomQuery;

$.fn.xmlAttr.defaults = {
    attrName: "xmlattrs",
    xmlTagName: "xmltagname"
};