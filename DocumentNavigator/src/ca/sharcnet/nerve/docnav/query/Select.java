package ca.sharcnet.nerve.docnav.query;

import ca.sharcnet.nerve.docnav.dom.ElementNode;

abstract class Select {
    abstract boolean check(ElementNode element);
}
