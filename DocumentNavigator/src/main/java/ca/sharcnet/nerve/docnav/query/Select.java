package ca.sharcnet.nerve.docnav.query;

import ca.sharcnet.nerve.docnav.dom.Node;

abstract class Select {
    abstract boolean check(Node element);
}
