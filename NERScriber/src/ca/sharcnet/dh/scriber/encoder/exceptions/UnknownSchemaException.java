/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package ca.sharcnet.dh.scriber.encoder.exceptions;

import ca.sharcnet.dh.scriber.context.Context;

/**
 *
 * @author edward
 */
public class UnknownSchemaException extends EncoderException{
    private String schemaName;

    public UnknownSchemaException(Context context, String schemaName) {
        super("Unknown schema: " + schemaName, context);
        this.schemaName = schemaName;
    }
    
    public String getName(){
        return this.schemaName;
    }
}
