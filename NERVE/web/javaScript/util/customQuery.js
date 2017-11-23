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
        var opts = $.extend({}, $.fn.xmlAttr.defaults);

        if (typeof value === "undefined") {
            let xmlAttr = $(this).attr(opts.attrName);
            if (typeof xmlAttr === "undefined") return xmlAttr;
            let jsonObj = JSON.parse(xmlAttr);
            if (!jsonObj[key]) return "";
            return jsonObj[key];
        }

        return this.each(function () {
            let xmlAttr = $(this).attr(opts.attrName);
            if (!xmlAttr) {
                $(this).attr($.fn.xmlAttr.defaults.attrName, "{}");
                xmlAttr = $(this).attr(opts.attrName);
            }

            let jsonObj = JSON.parse(xmlAttr);
            jsonObj[key] = value;
            $(this).attr(opts.attrName, JSON.stringify(jsonObj));
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
        var opts = $.extend({}, $.fn.xmlAttr.defaults);

        if (!fromKey) return;
        if (!toKey) return;
        if (fromKey === toKey) return;

        return this.each(function () {
            let xmlAttr = $(this).attr(opts.attrName);
            /* all divs that come from encode will have this attribute */
            if (typeof xmlAttr !== "undefined") {
                let jsonObj = JSON.parse(xmlAttr);
                jsonObj[toKey] = jsonObj[fromKey];
                delete jsonObj[fromKey];
                $(this).attr(opts.attrName, JSON.stringify(jsonObj));
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
        var opts = $.extend({}, $.fn.xmlAttr.defaults);

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
        var opts = $.extend({}, $.fn.xmlAttr.defaults);
        var context = opts.context;

        if (typeof value === "undefined") {
            let tagName = $(this).attr(opts.xmlTagName);
            let lemmaAttr = context.getTagInfo(tagName, NameSource.NAME).getLemmaAttribute();
            return $(this).xmlAttr(lemmaAttr);
        }

        return this.each(function () {
            let tagName = $(this).attr(opts.xmlTagName);
            let lemmaAttr = context.getTagInfo(tagName, NameSource.NAME).getLemmaAttribute();
            $(this).xmlAttr(lemmaAttr, value);
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
        var opts = $.extend({}, $.fn.xmlAttr.defaults);
        var context = opts.context;

        if (typeof value === "undefined") {
            let tagName = $(this).attr(opts.xmlTagName);
            let linkAttr = context.getTagInfo(tagName, NameSource.NAME).getLinkAttribute();
            return $(this).xmlAttr(linkAttr);
        }

        return this.each(function () {
            let tagName = $(this).attr(opts.xmlTagName);
            let linkAttr = context.getTagInfo(tagName, NameSource.NAME).getLinkAttribute();
            $(this).xmlAttr(linkAttr, value);
        });
    };
}(jQuery));

/**
 * Get/Set the value of the tag attribute of this entity.
 * @param {type} $
 * @returns {undefined}
 */
(function ($) {
    $.fn.entityTag = function (value) {
        var opts = $.extend({}, $.fn.xmlAttr.defaults);
        var context = opts.context;

        if (!value) {
            return $(this).attr(opts.xmlTagName);
        }

        /* when changing the entity tag, attribute name of the link & lemma attributes may change */
        return this.each(function () {
            let oldEntityTag = $(this).attr(opts.xmlTagName);
            if (oldEntityTag) {
                $(this).renameXMLAttr(context.getTagInfo(oldEntityTag, NameSource.NAME).getLinkAttribute(), context.getTagInfo(value, NameSource.NAME).getLinkAttribute());
                $(this).renameXMLAttr(context.getTagInfo(oldEntityTag, NameSource.NAME).getLemmaAttribute(), context.getTagInfo(value, NameSource.NAME).getLemmaAttribute());
            }
            return $(this).attr(opts.xmlTagName, value);
        });
    };
}(jQuery));

$.fn.xmlAttr.defaults = {
    attrName: "xmlattrs",
    xmlTagName: "xmltagname",
    context: {}
};

