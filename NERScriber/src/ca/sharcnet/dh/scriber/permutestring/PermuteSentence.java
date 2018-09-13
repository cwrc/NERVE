/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package ca.sharcnet.dh.scriber.permutestring;

import java.util.ArrayList;
import java.util.Collection;

public class PermuteSentence extends ArrayList<PermuteFragment>{
    private final static String sentenceRegex = "[^ a-zA-Z0-9'-]";

    public static void main(String[] args) {
        Collection<PermuteFragment> permute = new PermuteSentence("Mary had a little lamb, it's fleece as white as snow, it's name was lamb-chop");
        for (PermuteFragment cs : permute) {
            for (PermuteResult s : cs) {
                System.out.println(s);
            }
            System.out.println("--------------------------------");
        }
    }

    public  PermuteSentence(String source) {
        String[] sentences = source.split(sentenceRegex);
        for (String sentence : sentences) {
            this.add(new PermuteFragment(sentence.trim()));
        }
    }
}