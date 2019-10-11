package ca.sharcnet.nerve.scriber.stringmatch;
import java.util.Collection;
import java.util.LinkedList;
import java.util.List;

public class ParserStack<TOKEN> extends LinkedList<TOKEN> {

    public ParserStack(){
        super();
    }

    public ParserStack(Collection<? extends TOKEN> c){
        super(c);
    }
    
    public TOKEN peekFirst(int offset){
        if (offset + 1 < this.size()) return null;
        TOKEN get = this.get(offset);
        return get;        
    }

    public TOKEN peekLast(int offset){
        if (this.size() - 1 - offset < 0) return null;
        TOKEN get = this.get(this.size() - 1 - offset);
        return get;        
    }
    
    public List<TOKEN> cutLast(int size){
        LinkedList<TOKEN> list = new LinkedList<TOKEN>();
        for (int i = 0; i < size; i++) list.addFirst(this.removeLast());
        return list;
    }

    public List<TOKEN> cutFirst(int size){
        LinkedList<TOKEN> list = new LinkedList<TOKEN>();
        for (int i = 0; i < size; i++) list.add(this.removeFirst());
        return list;
    }
    
}
