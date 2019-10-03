/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package ca.sharcnet.nerve.scriber.query;

import static ca.sharcnet.nerve.scriber.query.Query.LOGGER;
import org.w3c.dom.Element;
import org.w3c.dom.Node;

/**
 *
 * @author edward
 */
class Selector {

    private String tagName = null;
    private String attrKey = null;
    private String attrValue = null;

    Selector(String selector) {
        if (!selector.contains("[")) {
            this.tagName = selector;
        } else if (selector.startsWith("[")) {
            this.parseAttr(selector);
        } else {
            this.tagName = selector.substring(0, selector.indexOf("["));
            this.parseAttr(selector.substring(selector.indexOf("["), selector.length()));
        }
    }

    private void parseAttr(String selector) {
        if (!selector.contains("=")) {
            attrKey = selector.substring(1, selector.length() - 1);
        } else {
            attrKey = selector.substring(1, selector.indexOf("="));
            int start = selector.indexOf("'");
            int end = selector.lastIndexOf("'");
            attrValue = selector.substring(start + 1, end);
        }
    }

    void tagName(String value) {
        this.tagName = value;
    }

    void attrKey(String value) {
        this.attrKey = value;
    }

    void attrValue(String value) {
        this.attrValue = value;
    }

    boolean test(Query query) {
        if (tagName != null && !tagName.equals(query.tagName())) return false;
        if (attrKey != null && !query.hasAttribute(attrKey)) return false;
        if (attrValue != null && !query.attribute(attrKey).equals(attrValue)) return false;
        return true;
    }
}
