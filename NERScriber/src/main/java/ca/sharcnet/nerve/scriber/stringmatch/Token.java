/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package ca.sharcnet.nerve.scriber.stringmatch;

/**
 *
 * @author edward
 */
public class Token <EDGE> {
    private final TOKEN_TYPE type;
    private final EDGE value;
    
    public enum TOKEN_TYPE {
        START_TERMINAL, START_NON_TERMINAL, TERMINAL, NON_TERMINAL, UNKNOWN, END
    }    
    
    public Token(TOKEN_TYPE type, EDGE value){
        this.type = type;
        this.value = value;
    }

    /**
     * @return the type
     */
    public TOKEN_TYPE getType() {
        return type;
    }

    /**
     * @return the value
     */
    public EDGE getValue() {
        return value;
    }    
    
}
