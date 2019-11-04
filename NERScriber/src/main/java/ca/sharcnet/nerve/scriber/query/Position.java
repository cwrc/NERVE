/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package ca.sharcnet.nerve.scriber.query;

/**
 *
 * @author edward
 */
public class Position {
    public final int line;
    public final int offset;
    
    public Position(int line, int offset){
        this.line = line;
        this.offset = offset;
    }
}
