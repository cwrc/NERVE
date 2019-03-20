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
public class NullSchemaStreamException extends EncoderException{
    private String path;

    public NullSchemaStreamException(Context context, String schemaFilePath) {
        super("Schema @ '" + schemaFilePath + "' not found.", context);
        this.path = schemaFilePath;
    }
    
    public String getPath(){
        return this.path;
    }
}
