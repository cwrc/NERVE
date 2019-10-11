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
public interface Rule <TOKEN, VALUE>{
    public void execute(ParserStack<Token<TOKEN,VALUE>> stack);
    public boolean test(ParserStack<Token<TOKEN,VALUE>> stack);
}
