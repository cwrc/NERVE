package ca.sharcnet.nerve.docnav.query;

import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner reader = new Scanner(System.in);
        String input = "";

        while(!input.equals("quit")){
            System.out.print("> ");
            input = reader.nextLine();
            System.out.println(new SelectTerm(input));
        }
    }
}
