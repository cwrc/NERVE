package ca.sharcnet.nerve.docnav.query;
import ca.sharcnet.nerve.Console;
import ca.sharcnet.nerve.docnav.dom.ElementNode;

public class SelectElement extends SelectLink {
    private final SelectTerm term;
    private ElementNode element;

    public SelectElement(String select) {
        this.term = new SelectTerm(select);
    }

    @Override
    boolean check(ElementNode element) {
        this.element = element;
        return term.check(element);
    }

    @Override
    ElementNode getLast() {
        return element;
    }
}
