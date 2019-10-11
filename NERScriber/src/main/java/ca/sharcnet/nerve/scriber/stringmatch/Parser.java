/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package ca.sharcnet.nerve.scriber.stringmatch;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

/**
 *
 * @author edward
 */
public class Parser<TOKEN, VALUE> {

    private final Class<TOKEN> aClass;
    private Map<TOKEN, ArrayList<Rule>> rules = new HashMap<>(); // token found -> rules
    ArrayList<Rule> anyrules = new ArrayList<>(); // apply merge for any lookahead not otherwise found
    
    private ParserStack<Token<TOKEN, VALUE>> stack = new ParserStack<>();
    private ParserStack<Token<TOKEN, VALUE>> source;

    public Parser(List<Token<TOKEN, VALUE>> source, Class aClass) {
        this.aClass = aClass;
        this.source = new ParserStack<>(source);
    }

    public List<Token<TOKEN, VALUE>> parse() {
        while (!source.isEmpty()) {
            System.out.println("----");
            for (Token token : this.stack) {
                System.out.println(" " + token);
            }
            System.out.println(">>");
            for (Token token : this.source) {
                System.out.println(" " + token);
            }
            this.step();
        }
        return this.stack;
    }

    public void addRule(Rule<TOKEN, VALUE> rule, TOKEN lookahead) {
        if (!rules.containsKey(lookahead)) rules.put(lookahead, new ArrayList<Rule>());
        ArrayList<Rule> ruleList = rules.get(lookahead);
        ruleList.add(rule);
    }

    private void step() {
        Token nextToken = source.peekFirst();

        ArrayList<Rule> ruleList = rules.get(nextToken.getType());
        if (ruleList != null) for (Rule rule : ruleList) {
            if (rule.test(stack)) {
                rule.execute(stack);
                return;
            }
        }
        
        for (Rule rule : this.anyrules) {
            if (rule.test(stack)) {
                rule.execute(stack);
                return;
            }
        }        

        stack.addLast(source.removeFirst());
    }

    public void merge(TOKEN production, TOKEN... tokens) {
        TOKEN[] copyOfRange = Arrays.copyOfRange(tokens, 0, tokens.length - 1);
        MergeRule<TOKEN, VALUE> mergeRule = new MergeRule<>(production, copyOfRange);
        
        TOKEN lookahead = tokens[tokens.length - 1];        
        if (lookahead != null) this.addRule(mergeRule, lookahead);
        else this.anyrules.add(mergeRule);
    }
}
