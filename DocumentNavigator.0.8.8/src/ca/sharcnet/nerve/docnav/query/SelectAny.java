package ca.sharcnet.nerve.docnav.query;
import ca.frar.utility.console.Console;
import ca.sharcnet.nerve.docnav.dom.Node;
import java.util.ArrayList;

class SelectAny extends Select{
    private final ArrayList<Select> selectFields = new ArrayList<>();

    SelectAny(String select){
        String[] split = select.split(",");

        for (String s : split){
            String expression = s.trim();
            selectFields.add(new SelectExpression(expression));
        }
    }

    @Override
    boolean check(Node element) {
        for (Select select : selectFields){
            if (select.check(element)) return true;
        }
        return false;
    }
}
