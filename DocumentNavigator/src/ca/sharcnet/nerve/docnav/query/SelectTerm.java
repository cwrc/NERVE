package ca.sharcnet.nerve.docnav.query;
import ca.frar.utility.console.Console;
import ca.sharcnet.nerve.docnav.dom.Attribute;
import ca.sharcnet.nerve.docnav.dom.Node;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

class SelectTerm extends Select {
    String id;
    String name;
    ArrayList<Attribute> attributes = new ArrayList<>();
    ArrayList<String> wants;

    SelectTerm(String term){
        while (term.contains("[")){
            int start = term.indexOf('[');
            int end = term.indexOf(']', start);
            String attrString = term.substring(start, end + 1);
            term = term.replace(attrString, "");
            attrString = attrString.substring(1, attrString.length() - 1);

            String[] attrSplit = attrString.split("=");
            String attrName = attrSplit[0];
            String attrValue = "";
            if (attrSplit.length > 1) attrValue = attrSplit[1].substring(1, attrSplit[1].length() - 1);
            Attribute attr = new Attribute(attrName, attrValue);
            attributes.add(attr);
        }

        id = "";
        wants = new ArrayList<>(Arrays.asList(term.split("[.]")));
        name = wants.get(0);

        if (name.contains("#")){
            int start = name.indexOf('#');
            int end = name.indexOf('.');
            if (end == -1) end = name.length();
            id = name.substring(start + 1, end);
            if (start > 0) name = name.substring(0, start);
            else name = "";
        }

        if (name.equals("*")) name = "";
        wants.remove(0);
    }

    @Override
    public String toString(){
        StringBuilder builder = new StringBuilder();
        builder.append("name: ").append(name).append("\n");
        builder.append("id: ").append(id).append("\n");
        builder.append("classes: ").append(Arrays.toString(wants.toArray())).append("\n");
        builder.append("attributes: ").append(Arrays.toString(attributes.toArray())).append("\n");
        return builder.toString();
    }

    @Override
    boolean check(Node element) {
        if (!this.name.isEmpty() && !element.name().equals(this.name)) return false;
        if (!this.id.isEmpty() && !element.attr("id").equals(this.id)) return false;

        for (Attribute attr : attributes){
            if (!element.hasAttribute(attr.getKey())) return false;
            if (!attr.getValue().isEmpty() && !element.hasAttribute(attr.getKey(), attr.getValue())) return false;
        }

        List<String> haves = Arrays.asList(element.attr("class").split(" "));
        for (String want : wants) if (!haves.contains(want)) return false;

        return true;
    }
}