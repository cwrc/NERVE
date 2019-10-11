/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package ca.sharcnet.nerve.scriber.stringmatch;

import java.util.LinkedList;

/**
 *
 * @author edward
 */
public class MergeRule<TOKEN, VALUE> implements Rule<TOKEN,VALUE>{
    private final TOKEN[] tokens;
    private final TOKEN production;
    
    /**
     * Merge previously seen tokens.
     * @param production The token to merge into.
     * @param prev The previous tokens seen.
     */
    public MergeRule(TOKEN production, TOKEN ... tokens){        
        this.tokens = tokens;
        this.production = production;
    }
    
    @Override
    /**
     * Return true if the previous tokens on the stack match the rule.
     */
    public boolean test(ParserStack<Token<TOKEN, VALUE>> stack){
        for (int i = 0; i < tokens.length; i++){
            int j = tokens.length - i -1;
            Token<TOKEN, VALUE> fromStack = stack.peekLast(j);
            if (fromStack == null) return false;            
            if (tokens[i] != stack.peekLast(j).getType()) return false;
        }
        return true;
    }
    
    @Override
    public void execute(ParserStack<Token<TOKEN, VALUE>> stack){
        Token<TOKEN, VALUE> rvalue = new Token<TOKEN, VALUE>(production);
        rvalue.addValues(stack.cutLast(this.tokens.length));
        stack.addLast(rvalue);
    }   
}