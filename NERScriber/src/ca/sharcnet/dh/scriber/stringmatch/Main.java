/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package ca.sharcnet.dh.scriber.stringmatch;

import ca.frar.utility.console.Console;
import java.util.List;

/**
 *
 * @author edward
 */
public class Main {
    public static void main(String ... args){
        StringMatch stringMatch = new StringMatch();
        String[] setLine = stringMatch.setSource("I'm a little teapot");
        for (String s : setLine) Console.log(s);
    }
}
