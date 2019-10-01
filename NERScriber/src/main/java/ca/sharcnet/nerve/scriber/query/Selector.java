/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package ca.sharcnet.nerve.scriber.query;

import static ca.sharcnet.nerve.scriber.query.Query.LOGGER;
import org.w3c.dom.Element;

/**
 *
 * @author edward
 */
public class Selector {

    private String tagName = null;
    private String attrKey = null;
    private String attrValue = null;

    public Selector(String selector) {
        if (!selector.contains("[")){
            this.tagName = selector;
        }
        else if (selector.startsWith("[")){
            this.parseAttr(selector);
        } else {
            this.tagName = selector.substring(0, selector.indexOf("["));
            this.parseAttr(selector.substring(selector.indexOf("["), selector.length()));
        }
    }
    
    private void parseAttr(String selector) {
        if (!selector.contains("=")){
            attrKey = selector.substring(1, selector.length() - 1);
        } else {
            attrKey = selector.substring(1, selector.indexOf("="));
            int start = selector.indexOf("'");
            int end = selector.lastIndexOf("'");            
            attrValue = selector.substring(start + 1, end);
        }
    }    
    
    public void tagName(String value) {
        this.tagName = value;
    }

    public void attrKey(String value) {
        this.attrKey = value;
    }

    public void attrValue(String value) {
        this.attrValue = value;
    }

    public boolean test(Element element) {
        if (tagName != null && !tagName.equals(element.getTagName())) return false;
        if (attrKey != null && !element.hasAttribute(attrKey)) return false;
        if (attrValue != null && !element.getAttribute(attrKey).equals(attrValue)) return false;
        return true;
    }

    public String toString() {
        return "'" + tagName + "' '" + attrKey + "' '" + attrValue + "'";
    }


}
