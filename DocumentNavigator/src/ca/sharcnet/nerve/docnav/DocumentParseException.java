/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package ca.sharcnet.nerve.docnav;

import ca.sharcnet.nerve.docnav.antlr.ParserError;
import java.util.ArrayList;
import java.util.List;

/**
 *
 * @author edward
 */
public class DocumentParseException extends Exception {
    private final ArrayList<ParserError> errorList;

    DocumentParseException(List<ParserError> errorList){
        this.errorList = new ArrayList<>(errorList);
    }
    
    public List<ParserError> getErrors(){
        return this.errorList;
    }
}
