(function($) {
    $.fn.mergeElements = function(name = "div") {
        let range = $(this).asRange();
        let element = document.createElement(name);
        range.surroundContents(element);
        $(this).contents().unwrap();
        return $(element);
    };
}(jQuery));

(function($) {
    $.fn.wrap = function(name = "div") {
        let range = $(this).asRange();
        let element = document.createElement(name);
        range.surroundContents(element);
        return $(element);
    };
}(jQuery));

(function($) {
    $.fn.selectAsRange = function() {
        let range = $(this).asRange();
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
        return this;
    };
}(jQuery));

(function($) {
    $.fn.asRange = function() {
        let start = null;
        let end = null;

        this.each(function() {
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
(function($) {
    $.fn.xmlAttr = function(key, value) {
        var opts = $.extend( {}, $.fn.xmlAttr.defaults);

        if (typeof value === "undefined"){
            let xmlAttr = $(this).attr(opts.attrName);
            if (typeof xmlAttr === "undefined") return xmlAttr;
            jsonObj = JSON.parse(xmlAttr);
            return jsonObj[key];
        }

        return this.each(function() {
            let xmlAttr = $(this).attr(opts.attrName);
            /* all divs that come from encode will have this attribute */
            if (typeof xmlAttr !== "undefined"){
                jsonObj = JSON.parse(xmlAttr);
                jsonObj[key] = value;
                $(this).attr(opts.attrName, JSON.stringify(jsonObj));
            }
        });
    };
}(jQuery));

/**
 * Get/Set the value of the lemma attribute of this entity.
 * @param {type} $
 * @returns {undefined}
 */
(function($) {
    $.fn.lemma = function(value) {
        var opts = $.extend( {}, $.fn.xmlAttr.defaults);
        var context = opts.context;

        if (typeof value === "undefined"){
            let tagName = $(this).attr(opts.xmlTagName);
            let lemmaAttr = context.getTagInfo(tagName).lemmaAttribute;
            return $(this).xmlAttr(lemmaAttr);
        }

        return this.each(function() {
            let tagName = $(this).attr(opts.xmlTagName);
            let lemmaAttr = context.getTagInfo(tagName).lemmaAttribute;
            $(this).xmlAttr(lemmaAttr, value);
        });
    };
}(jQuery));

/**
 * Get/Set the value of the link attribute of this entity.
 * @param {type} $
 * @returns {undefined}
 */
(function($) {
    $.fn.link = function(value) {
        var opts = $.extend({}, $.fn.xmlAttr.defaults);
        var context = opts.context;

        if (typeof value === "undefined"){
            let tagName = $(this).attr(opts.xmlTagName);
            let linkAttr = context.getTagInfo(tagName).linkAttribute;
            return $(this).xmlAttr(linkAttr);
        }

        return this.each(function() {
            let tagName = $(this).attr(opts.xmlTagName);
            let linkAttr = context.getTagInfo(tagName).linkAttribute;
            $(this).xmlAttr(linkAttr, value);
        });
    };
}(jQuery));

/**
 * Get/Set the value of the tag attribute of this entity.
 * @param {type} $
 * @returns {undefined}
 */
(function($) {
    $.fn.entityTag = function(value) {
        var opts = $.extend( {}, $.fn.xmlAttr.defaults);

        if (typeof value === "undefined"){
            return $(this).attr(opts.xmlTagName);
        }

        return this.each(function() {
            return $(this).attr(opts.xmlTagName, value);
        });
    };
}(jQuery));

$.fn.xmlAttr.defaults = {
    attrName: "xmlattrs",
    xmlTagName: "xmltagname",
    context: {}
};

