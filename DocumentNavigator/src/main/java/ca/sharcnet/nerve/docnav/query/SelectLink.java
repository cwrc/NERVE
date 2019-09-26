package ca.sharcnet.nerve.docnav.query;

import ca.sharcnet.nerve.docnav.dom.Node;

abstract class SelectLink extends Select{
    abstract Node getLast();
}
