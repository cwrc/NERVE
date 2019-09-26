/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package ca.sharcnet.nerve.scriber.sql;

/**
 *
 * @author edward
 */
public class SQLPropertyNotFoundException extends RuntimeException {

    public SQLPropertyNotFoundException(String property) {
        super("Propery not found: " + property);
    }
    
}
