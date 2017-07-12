package ca.sharcnet.nerve.docnav.query;
import ca.sharcnet.nerve.Console;
import ca.sharcnet.nerve.docnav.dom.ElementNode;

public class SelectAncestor extends SelectLink {
    private final SelectTerm term;
    private ElementNode current;

    public SelectAncestor(String select) {
        this.term = new SelectTerm(select);
    }

    @Override
    boolean check(ElementNode element) {
        current = element;

        while(current.hasParent()){
            current = current.getParent();
            if (term.check(current)) return true;
        }
        return false;
    }

    @Override
    ElementNode getLast() {
        return current;
    }
}