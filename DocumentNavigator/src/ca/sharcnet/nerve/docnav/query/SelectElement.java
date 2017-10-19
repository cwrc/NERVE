package ca.sharcnet.nerve.docnav.query;
import ca.fa.utility.Console;
import ca.sharcnet.nerve.docnav.dom.Node;

class SelectElement extends SelectLink {
    private final SelectTerm term;
    private Node element;

    public SelectElement(String select) {
        this.term = new SelectTerm(select);
    }

    @Override
    boolean check(Node element) {
        this.element = element;
        return term.check(element);
    }

    @Override
    Node getLast() {
        return element;
    }

    @Override
    public String toString(){
        return term.toString();
    }

}
