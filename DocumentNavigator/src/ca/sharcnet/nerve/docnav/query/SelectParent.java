package ca.sharcnet.nerve.docnav.query;
import ca.frar.utility.console.Console;
import ca.sharcnet.nerve.docnav.dom.Node;

class SelectParent extends SelectLink {
    private final SelectTerm term;
    private Node parent;

    public SelectParent(String select) {
        this.term = new SelectTerm(select);
    }

    @Override
    boolean check(Node element) {
        parent = element.getParent();
        return term.check(parent);
    }

    @Override
    Node getLast() {
        return parent;
    }

    @Override
    public String toString(){
        return term.toString();
    }
}
