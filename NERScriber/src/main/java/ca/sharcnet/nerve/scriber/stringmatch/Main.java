package ca.sharcnet.nerve.scriber.stringmatch;

public class Main {

    public static void main(String... args) {
        StringMatch<Integer> stringMatch = new StringMatch<Integer>();
        stringMatch.addCandidate("A", 0);
        stringMatch.addCandidate("A A", 0);
        stringMatch.addCandidate("B C", 0);
        stringMatch.addCandidate("C", 0);
        stringMatch.setSource("A A B C A B A A B");
        stringMatch.seekLine((s, n) -> {
            /**/
        },
        (s) -> {
            /**/
        });        
    }
}
