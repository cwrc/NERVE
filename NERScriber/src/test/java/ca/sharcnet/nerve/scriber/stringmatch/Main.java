/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package ca.sharcnet.nerve.scriber.stringmatch;

/**
 *
 * @author edward
 */
public class Main {
    public static void main(String ... args){
        StringMatch<Integer> stringMatch = new StringMatch<>();
        
        stringMatch.addCandidate("apple", 1);
        stringMatch.setSource("apple apple");
        
        OnAccept<Integer> accept = new OnAccept<>(){
            @Override
            public void accept(String string, Integer value) {
                System.out.println("ACCEPT : '" + string + "'");
            }
        };
        
        OnReject reject = new OnReject(){
            @Override
            public void reject(String string) {
                System.out.println("REJECT : '" + string + "'");
            }
        };
        
        stringMatch.seekLine(accept, reject);
    }
}
