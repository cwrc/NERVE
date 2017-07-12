package ca.sharcnet.nerve.docnav.query;
import ca.sharcnet.nerve.Console;
import ca.sharcnet.nerve.docnav.dom.ElementNode;

public class SelectParent extends SelectLink {
    private final SelectTerm term;
    private ElementNode parent;

    public SelectParent(String select) {
        this.term = new SelectTerm(select);
    }

    @Override
    boolean check(ElementNode element) {
        parent = element.getParent();
        return term.check(parent);
    }

    @Override
    ElementNode getLast() {
        return parent;
    }
}
