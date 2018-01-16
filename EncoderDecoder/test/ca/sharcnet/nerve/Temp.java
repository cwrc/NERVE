package ca.sharcnet.nerve;

import ca.fa.utility.Console;

public class Temp {
    public static void main(String[] args) {
        String s = "I am a \"teapot\"";
        System.out.println(s);
        System.out.println(s.replaceAll("\"", "\\"));
    }
}
