/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package ca.sharcnet.nerve.scriber.stringmatch;

import ca.sharcnet.nerve.scriber.graph.Tree;
import ca.sharcnet.nerve.scriber.graph.TreeNode;
import static ca.sharcnet.nerve.scriber.stringmatch.Tokenizer.TOKEN_TYPE.*;
import java.util.LinkedList;

/**
 *
 * @author edward
 */
public class Tokenizer<EDGE, VALUE> {
    private final Tree tree;

    public enum TOKEN_TYPE{
        UNKNOWN, START_TERMINAL, START_NON_TERMINAL, TERMINAL, NON_TERMINAL, EOS,
        partial, reject, accept
    }
    
    public Tokenizer(Tree tree) {
        this.tree = tree;
    }

    public LinkedList<Token<TOKEN_TYPE, EDGE>> tokenize(EDGE[] source) {
        LinkedList<EDGE> linkedList = new LinkedList<>();
        for (EDGE edge : source) linkedList.add(edge);
        return tokenize(linkedList);
    }

    public LinkedList<Token<TOKEN_TYPE, EDGE>> tokenize(LinkedList<EDGE> source) {
        LinkedList<Token<TOKEN_TYPE, EDGE>> result = new LinkedList<>();
        TreeNode<EDGE, VALUE> current = tree.getRoot();

        while (!source.isEmpty()) {
            current = step(source, result, current);
        }

        result.add(new Token(EOS));
        
        return result;
    }

    private TreeNode step(LinkedList<EDGE> source, LinkedList<Token<TOKEN_TYPE, EDGE>> result, TreeNode<EDGE, VALUE> current) {
        EDGE edge = source.pop();
        TreeNode next = current.next(edge);

        System.out.println("'" + edge + "' " + (next != null));

        if (current == tree.getRoot() && next == null) {
            result.add(new Token(UNKNOWN, edge));
            return tree.getRoot();
        } else if (current != tree.getRoot() && next == null) {
            source.push(edge);
            return tree.getRoot();
        } else if (current == tree.getRoot() && next.isTerminal()) {
            result.add(new Token(START_TERMINAL, edge));
        } else if (current == tree.getRoot() && !next.isTerminal()) {
            result.add(new Token(START_NON_TERMINAL, edge));
        } else if (current != tree.getRoot() && next.isTerminal()) {
            result.add(new Token(TERMINAL, edge));
        } else if (current != tree.getRoot() && !next.isTerminal()) {
            result.add(new Token(NON_TERMINAL, edge));
        }

        return next;
    }


}
