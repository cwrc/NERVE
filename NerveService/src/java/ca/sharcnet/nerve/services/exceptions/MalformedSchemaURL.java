/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package ca.sharcnet.dh.nerve.services;

/**
 *
 * @author edward
 */
public class MalformedSchemaURL extends NullPointerException {
    public MalformedSchemaURL(String url) {
        super("Could not resolve schema URL: " + url);
    }    
}
