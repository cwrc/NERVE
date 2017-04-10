package ca.sharcnet.nerve.docnav.selector;
import ca.sharcnet.nerve.docnav.dom.ElementNode;
import ca.sharcnet.nerve.docnav.dom.NodeList;
import java.util.Arrays;
import java.util.Collection;
import java.util.Iterator;
import java.util.List;

public class Refine extends NodeList<ElementNode> {
    public Refine (Collection <ElementNode> collection){
        super(collection);
    }

    Refine(Select select) {
        super(select);
    }

    public Refine keepElement(ElementNode element){
        if (this.contains(element)){
            this.clear();
            this.add(element);
        } else {
            this.clear();
        }
        return this;
    }

    public Refine keepName(String ... aNames){
        List<String> list = Arrays.asList(aNames);

        Iterator<ElementNode> iterator = this.iterator();
        while (iterator.hasNext()){
            ElementNode eNode = iterator.next();
            if (!list.contains(eNode.getName())){
                iterator.remove();
            }
        }
        return this;
    }

    public Refine removeName(String ... aNames){
        List<String> list = Arrays.asList(aNames);

        Iterator<ElementNode> iterator = this.iterator();
        while (iterator.hasNext()){
            ElementNode eNode = iterator.next();
            if (list.contains(eNode.getName())){
                iterator.remove();
            }
        }
        return this;
    }

    public Refine keepAttribute(String key){

        Iterator<ElementNode> iterator = this.iterator();
        while (iterator.hasNext()){
            ElementNode eNode = iterator.next();
            if (!eNode.hasAttribute(key)) iterator.remove();
        }
        return this;
    }

    public Refine removeAttribute(String key){

        Iterator<ElementNode> iterator = this.iterator();
        while (iterator.hasNext()){
            ElementNode eNode = iterator.next();
            if (eNode.hasAttribute(key)) iterator.remove();
        }
        return this;
    }

    public Refine keepAttribute(String key, Object value){

        Iterator<ElementNode> iterator = this.iterator();
        while (iterator.hasNext()){
            ElementNode eNode = iterator.next();
            if (!eNode.hasAttribute(key, value)) iterator.remove();
        }
        return this;
    }

    public Refine removeAttribute(String key, Object value){

        Iterator<ElementNode> iterator = this.iterator();
        while (iterator.hasNext()){
            ElementNode eNode = iterator.next();
            if (eNode.hasAttribute(key, value)) iterator.remove();
        }
        return this;
    }
}
