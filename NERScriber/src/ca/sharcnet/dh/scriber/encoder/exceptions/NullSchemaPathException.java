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
public class NullSchemaPathException extends EncoderException{

    public NullSchemaPathException(Context context) {
        super(context);
    }
}
