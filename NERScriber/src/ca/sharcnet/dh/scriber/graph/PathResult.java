package ca.sharcnet.dh.scriber.graph;

import java.util.Arrays;

public class PathResult <KEY, VALUE> {
    KEY[] source;
    VALUE value;
    int start = -1;
    int end = -1;

    PathResult(KEY[] source){
        this.source = source;
    }

    public VALUE getValue(){
        return value;
    }

    public KEY[] getSource() {
        return Arrays.copyOf(source, source.length);
    }

    public int getStart() {
        return start;
    }

    public int getEnd() {
        return end;
    }

    @Override
    public String toString(){
        return "{" + start + ", " + end + ", " + value + "}";
    }
}
