/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package ca.sharcnet.nerve.docnav.query;

import ca.sharcnet.nerve.docnav.dom.Attribute;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Scanner;

/**
 *
 * @author edward
 */
public class SelectTermInfo {

    public static void main(String[] args) {
        Scanner reader = new Scanner(System.in);
        String input = "";

        while(!input.equals("quit")){
            System.out.print("> ");
            input = reader.nextLine();
            System.out.println(new SelectTermInfo(input));
        }
    }

    String id;
    String name;
    ArrayList<Attribute> attributes = new ArrayList<>();
    ArrayList<String> wants;

    SelectTermInfo(String term){
        while (term.contains("[")){
            int start = term.indexOf('[');
            int end = term.indexOf(']', start);
            String attrString = term.substring(start, end + 1);
            term = term.replace(attrString, "");
            attrString = attrString.substring(1, attrString.length() - 1);

            String[] attrSplit = attrString.split("=");
            String name = attrSplit[0];
            String value = "";
            if (attrSplit.length > 1) value = attrSplit[1].substring(1, attrSplit[1].length() - 1);
            Attribute attr = new Attribute(name, value);
            attributes.add(attr);
        }

        id = "";
        wants = new ArrayList<>(Arrays.asList(term.split("[.]")));
        name = wants.get(0);

        if (name.contains("#")){
            int start = name.indexOf('#');
            int end = name.indexOf('.');
            if (end == -1) end = name.length();
            id = name.substring(start + 1, end);
            if (start > 0) name = name.substring(0, start);
        }

        wants.remove(0);
    }

    public String toString(){
        StringBuilder builder = new StringBuilder();
        builder.append("name: ").append(name);
        builder.append("id: ").append(id);
        builder.append("classes: " + Arrays.toString(wants.toArray()));
        builder.append("attributes: ").append(Arrays.toString(attributes.toArray()));
        return builder.toString();
    }

}
