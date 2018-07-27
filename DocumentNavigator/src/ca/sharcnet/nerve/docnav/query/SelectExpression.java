package ca.sharcnet.nerve.docnav.query;

import ca.frar.utility.console.Console;
import ca.sharcnet.nerve.docnav.dom.Node;
import java.util.ArrayList;
import java.util.List;

/**
A series of one or more select terms seperated by either " ", or ">".
@author edward
*/
class SelectExpression extends Select {
    private String selectString;
    private final ArrayList<SelectLink> terms = new ArrayList<>();

    public SelectExpression(String select) {
        this.selectString = select.trim();
        if (selectString.isEmpty()) return;
        String[] tokens = tokenize(selectString);

        terms.add(new SelectElement(tokens[tokens.length - 1]));

        for (int i = tokens.length - 2; i >= 0; i -= 2){
            switch (tokens[i]){
                case " ":
                    terms.add(new SelectAncestor(tokens[i-1]));
                break;
                case ">":
                    terms.add(new SelectParent(tokens[i-1]));
                break;
            }
        }
    }

    @Override
    public String toString(){
        return selectString;
    }

    @Override
    boolean check(Node element) {
        if (terms.isEmpty()) return false;
        boolean rvalue = true;

        for (SelectLink select : terms){
            if (!select.check(element)){
                rvalue = false;
                break;
            } else {
                element = select.getLast();
            }
        }
        return rvalue;
    }

    private String[] tokenize(String select){
        select = select.trim();
        List<String> rvalue = new ArrayList<>();

        String[] childSplit = select.split(">");

        for (int i = 0; i < childSplit.length; i++){
            String trim = childSplit[i].trim();
            String[] desSplit = trim.split("[ ]+");

            for (int j = 0; j < desSplit.length; j++){
                rvalue.add(desSplit[j]);
                if (j != desSplit.length - 1) rvalue.add(" ");
            }

            if (i != childSplit.length - 1) rvalue.add(">");
        }

        return rvalue.toArray(new String[rvalue.size()]);
    }

}
