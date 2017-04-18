package ca.sharcnet.nerve.docnav.selector;
import ca.sharcnet.nerve.docnav.dom.ElementNode;
import ca.sharcnet.nerve.docnav.dom.Node;
import ca.sharcnet.nerve.docnav.dom.NodeList;
import ca.sharcnet.nerve.docnav.dom.NodeType;
import java.util.Arrays;
import java.util.Collection;
import java.util.Iterator;
import java.util.List;

public class ElementList extends NodeList<ElementNode> {

    public ElementList(){
        super();
    }

    public ElementList (Collection <? extends Node> collection){
        super();
        for (Node node : collection) {
            if (node.isType(NodeType.ELEMENT)){
                this.add((ElementNode)node);
            }
        }
    }

    public Select select(){
        return new Select(this);
    }

    public ElementList keepElement(ElementNode element){
        if (this.contains(element)){
            this.clear();
            this.add(element);
        } else {
            this.clear();
        }
        return this;
    }

    public ElementList keepName(String ... aNames){
        List<String> list = Arrays.asList(aNames);

        Iterator<ElementNode> iterator = this.iterator();
        while (iterator.hasNext()){
            Node eNode = iterator.next();
            if (!list.contains(eNode.getName())){
                iterator.remove();
            }
        }
        return this;
    }

    public ElementList removeName(String ... aNames){
        List<String> list = Arrays.asList(aNames);

        Iterator<ElementNode> iterator = this.iterator();
        while (iterator.hasNext()){
            Node eNode = iterator.next();
            if (list.contains(eNode.getName())){
                iterator.remove();
            }
        }
        return this;
    }

    public ElementList keepAttribute(String key){

        Iterator<ElementNode> iterator = this.iterator();
        while (iterator.hasNext()){
            ElementNode eNode = iterator.next();
            if (!eNode.hasAttribute(key)) iterator.remove();
        }
        return this;
    }

    public ElementList removeAttribute(String key){

        Iterator<ElementNode> iterator = this.iterator();
        while (iterator.hasNext()){
            ElementNode eNode = iterator.next();
            if (eNode.hasAttribute(key)) iterator.remove();
        }
        return this;
    }

    public ElementList keepAttribute(String key, Object value){

        Iterator<ElementNode> iterator = this.iterator();
        while (iterator.hasNext()){
            ElementNode eNode = iterator.next();
            if (!eNode.hasAttribute(key, value)) iterator.remove();
        }
        return this;
    }

    public ElementList removeAttribute(String key, Object value){

        Iterator<ElementNode> iterator = this.iterator();
        while (iterator.hasNext()){
            ElementNode eNode = iterator.next();
            if (eNode.hasAttribute(key, value)) iterator.remove();
        }
        return this;
    }
}
