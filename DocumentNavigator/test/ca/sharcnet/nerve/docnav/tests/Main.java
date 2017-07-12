package ca.sharcnet.nerve.docnav.tests;

import ca.sharcnet.nerve.HasStreams;
import ca.sharcnet.nerve.docnav.DocumentLoader;
import ca.sharcnet.nerve.docnav.dom.Document;
import ca.sharcnet.nerve.docnav.query.Query;
import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Scanner;

public class Main implements HasStreams {

    public static void main(String... args) throws IOException {
        Main main = new Main();
        main.run();
    }

    private Document doc;
    private final HashMap<String, Object> memory = new HashMap<>();

    public void run() throws IOException {
        Scanner reader = new Scanner(System.in);
        String input = "";

        while (!input.equals("quit")) {
            System.out.print("> ");
            input = reader.nextLine().trim();
            System.out.println(parseInput(input));
        }
    }

    public Object parseInput(String input) {
        try {
            if (input.startsWith("load ")) {
                String[] tokens = input.split("[ ]+");
                Document doc = DocumentLoader.documentFromStream(getResourceStream(tokens[1]));
                memory.put("document", doc);
                return null;
            } else if (input.contains("=")) {
                String[] split = input.split("=");
                memory.put(split[0], parseInput(split[1]));
                return null;
            } else if (input.startsWith("$")) {
                performQuery(input);
            } else {
                return memory.get(input);
            }
        } catch (Exception ex) {
            System.err.println(ex);
            ex.printStackTrace(System.err);
        }

        return null;
    }

    public Query performQuery(String input) {
        return null;
    }

    @Override
    public InputStream getResourceStream(String path) {
        return this.getClass().getResourceAsStream("/resources/" + path);
    }
}
