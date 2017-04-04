package ca.sharcnet.nerve;

import ca.sharcnet.nerve.encoder.Encoder;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;

public class Main {

    public static void main(String ... args){
        String s = "{\"PERSON\":\"BRWWRITER\",\"SEX\":\"FEMALE\"}";
        System.out.println(s);
        String t = s.replaceAll("\"", "\\\\\"");
        System.out.println(t);
    }

    public static OutputStream getOutStream(String filepath) throws FileNotFoundException{
        File file = new File(filepath);
        FileOutputStream stream = new FileOutputStream(file);
        return stream;
    }

    public static InputStream getInStream(String filepath) throws FileNotFoundException{
        File file = new File(filepath);
        FileInputStream stream = new FileInputStream(file);
        return stream;
    }
}
