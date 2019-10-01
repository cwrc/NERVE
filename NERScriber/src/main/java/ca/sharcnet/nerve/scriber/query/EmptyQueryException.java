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
public class EmptyQueryException extends RuntimeException {

    public EmptyQueryException() {
        super();
    }    
    
    public EmptyQueryException(String message) {
        super(message);
    }
    
}
