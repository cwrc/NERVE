/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package ca.sharcnet.nerve.docnav.antlr;

import org.antlr.v4.runtime.Token;

/**
 *
 * @author edward
 */
public class ParserError {
    private final String message;
    private final Token currentToken;
    
    ParserError(String message, Token currentToken){
        this.message = message;
        this.currentToken = currentToken;
    }

    /**
     * @return the message
     */
    public String getMessage() {
        return message;
    }

    /**
     * @return the currentToken
     */
    public Token getCurrentToken() {
        return currentToken;
    }
    
}
