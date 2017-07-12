package ca.sharcnet.nerve.docnav.query;

import ca.sharcnet.nerve.docnav.dom.ElementNode;

abstract class SelectLink extends Select{
    abstract ElementNode getLast();
}
