/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package ca.sharcnet.nerve.scriber.stringmatch;

import java.util.ArrayList;
import java.util.List;

/**
 *
 * @author edward
 * @param <TOKEN>
 * @param <VALUE>
 */
public class Token <TOKEN, VALUE> {
    private final TOKEN type;
    private final List<VALUE> values = new ArrayList<>();
    
    public Token(TOKEN type){
        this.type = type;
    }    
    
    public Token(TOKEN type, VALUE ... values){
        this.type = type;
        for (VALUE e : values){
            this.values.add(e);
        }
    }

    public Token(TOKEN type, Token<TOKEN, VALUE> ... tokens){
        this.type = type;
        for (Token<TOKEN, VALUE> t : tokens){
            this.values.addAll(t.getValues());
        }
    }
    
    void addValues(List<Token<TOKEN, VALUE>> tokens){
        for (Token<TOKEN, VALUE> t : tokens){
            this.values.addAll(t.getValues());
        }
    }
    
    /**
     * @return the type
     */
    public TOKEN getType() {
        return type;
    }

    /**
     * @return the value
     */
    public List<VALUE> getValues() {
        return new ArrayList<VALUE>(this.values);
    }    
 
    public String toString(){
        StringBuilder builder = new StringBuilder();
        builder.append(this.getType()).append(" : ");
        for (VALUE value : this.values) builder.append("[").append(value).append("]");
        return builder.toString();
    }
}
