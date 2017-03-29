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

(function($) {
    $.fn.lemma = function(value) {
        var opts = $.extend( {}, $.fn.xmlAttr.defaults);
        var context = opts.context;

        if (typeof value === "undefined"){
            let tagName = $(this).attr(opts.xmlTagName);
            let lemmaAttr = context.getLemmaAttribute(tagName);
            return $(this).xmlAttr(lemmaAttr);
        }

        return this.each(function() {
            let tagName = $(this).attr(opts.xmlTagName);
            let lemmaAttr = context.getLemmaAttribute(tagName);
            $(this).xmlAttr(lemmaAttr, value);
        });
    };
}(jQuery));

(function($) {
    $.fn.link = function(value) {
        var opts = $.extend( {}, $.fn.xmlAttr.defaults);
        var context = opts.context;

        if (typeof value === "undefined"){
            let tagName = $(this).attr(opts.xmlTagName);
            let linkAttr = context.getLinkAttribute(tagName);
            return $(this).xmlAttr(linkAttr);
        }

        return this.each(function() {
            let tagName = $(this).attr(opts.xmlTagName);
            let linkAttr = context.getLinkAttribute(tagName);
            $(this).xmlAttr(linkAttr, value);
        });
    };
}(jQuery));

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

