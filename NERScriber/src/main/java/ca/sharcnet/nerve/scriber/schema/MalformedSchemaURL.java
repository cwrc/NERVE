/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package ca.sharcnet.nerve.scriber.schema;

/**
 *
 * @author edward
 */
public class MalformedSchemaURL extends NullPointerException {
    public MalformedSchemaURL(String url, int code) {
        super(String.format("HTTP Response code %d, could not resolve schema '%s'.", code, url));
    }    
}
