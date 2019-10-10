/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package ca.sharcnet.nerve.scriber.stringmatch;

import ca.sharcnet.nerve.scriber.graph.Tree;
import ca.sharcnet.nerve.scriber.graph.TreeNode;
import static ca.sharcnet.nerve.scriber.stringmatch.Token.TOKEN_TYPE.*;
import java.util.LinkedList;
import java.util.List;

/**
 *
 * @author edward
 */
public class Tokenizer <EDGE>{
    private final Tree tree;
    
    public Tokenizer(Tree tree){
        this.tree = tree;
    }
    
    public List<Token> tokenize(LinkedList<EDGE> source){
        LinkedList<Token> result = new LinkedList<>();
        TreeNode current = tree.getRoot();

        while (!source.isEmpty()){
            EDGE edge = source.pop();
            TreeNode next = current.next(edge);
            
            if (current == tree.getRoot() && next == null){
                result.add(new Token(UNKNOWN, edge));
            }
            else if(current != tree.getRoot() && next == null){
                source.push(edge);
                current = tree.getRoot();
                
                while(result.getLast().getType() != TERMINAL || result.getLast().getType() != START_TERMINAL){
                    Token<EDGE> last = result.pollLast();
                    source.push(last.getValue());
                }
            }
            else if (current == tree.getRoot() && next.isTerminal()){
                result.add(new Token(START_TERMINAL, edge));
            }
            else if (current == tree.getRoot() && !next.isTerminal()){
                result.add(new Token(START_NON_TERMINAL, edge));
            }
            else if (current != tree.getRoot() && next.isTerminal()){
                result.add(new Token(TERMINAL, edge));
            }
            else if (current != tree.getRoot() && !next.isTerminal()){
                result.add(new Token(NON_TERMINAL, edge));
            }            
        }
        
        return result;
    }
    
}
