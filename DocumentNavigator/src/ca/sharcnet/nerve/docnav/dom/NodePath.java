package ca.sharcnet.nerve.docnav.dom;
import java.util.function.Function;

public class NodePath extends NodeList<ElementNode>{

    public boolean isSubPath(String path){
        if (this.toString().contains(path)) return true;
        return false;
    }

    @Override
    public String toString(){
        StringBuilder builder = new StringBuilder();

        if (this.size() > 0) builder.append(this.get(0));
        for (int i = 1; i < this.size(); i++){
            builder.append(",").append(this.get(i));
        }
        return builder.toString();
    }

    public String simpleString() {
        StringBuilder builder = new StringBuilder();

        if (this.size() > 0) builder.append(this.get(0).startTag());
        for (int i = 1; i < this.size(); i++){
            builder.append(",").append(this.get(i).startTag());
        }
        return builder.toString();
    }
}
