/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package ca.sharcnet.nerve.scriber.stringmatch;
import ca.sharcnet.nerve.scriber.Constants;

/**
 *
 * @author edward
 */
public class Main {
    final static org.apache.logging.log4j.Logger LOGGER = org.apache.logging.log4j.LogManager.getLogger(Constants.LOG_NAME);
    
    public static void main(String ... args){
        StringMatch stringMatch = new StringMatch();
        String[] setLine = stringMatch.setSource("I'm a little teapot");
        for (String s : setLine) LOGGER.debug(s);
    }
}
