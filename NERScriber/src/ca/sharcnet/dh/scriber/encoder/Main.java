/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package ca.sharcnet.dh.scriber.encoder;

import ca.frar.utility.console.Console;

/**
 *
 * @author Ed Armstrong
 */
public class Main {
    public static void main(String ... args){
        String string = "Putnam's and the Reader";
        Console.log(string);
        Console.log(string.replaceAll("'", "\\\\'"));
    }
}
