package ca.sharcnet.nerve.docnav.dom.extended;
import ca.sharcnet.nerve.docnav.dom.Attribute;
import ca.sharcnet.nerve.docnav.dom.ElementNode;
import ca.sharcnet.nerve.docnav.dom.Node;
import ca.sharcnet.nerve.docnav.dom.IsNodeType;
import ca.sharcnet.nerve.docnav.dom.NodeType;

/**
A type of Element node that is still considered an element.  Adds methods to
the Element node.
@author edward
*/
public final class HTMLElement extends ElementNode{

    public HTMLElement(String name) {
        super(name);
    }

    public HTMLElement(Node node){
        super(node.name(), node.getAttributes(), node.childNodes());
    }

    @Override
    public boolean isType(IsNodeType ... types){
        for (IsNodeType type : types){
            if (type == ExtendedNodeType.HTML_ELEMENT || type == NodeType.ELEMENT) return true;
        }
        return false;
    }

    public void setID(Object id){
        super.attr("id", id);
    }

    public String getID(){
        return super.attr("id");
    }

    public void addClassName(String classname){
        this.attr("class", this.attr("class") + " " + classname);
    }

    public void setClassName(String classname){
        this.attr("class", classname);
    }

    public String getClassNames(){
        return this.attr("class");
    }

    public boolean hasClassName(String ... names){
        if (!this.hasAttribute("class")) return false;
        String[] split = this.attr("class").split(" ");
        for (String s1 : names){
            for (String s2 : split){
                if (s1.equals(s2)) return true;
            }
        }
        return false;
    }
}
