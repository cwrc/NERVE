package ca.sharcnet.dh.scriber.context;

import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.Reader;
import java.io.UnsupportedEncodingException;
import org.json.JSONObject;
import org.json.JSONTokener;

public class ContextLoader {

    private static final long serialVersionUID = 1L;

    private ContextLoader() {
    }

    public static Context load(InputStream inputStream) throws IllegalArgumentException, IOException {
        final int bufferSize = 1024;
        final char[] buffer = new char[bufferSize];
        final StringBuilder out = new StringBuilder();
        Reader in = new InputStreamReader(inputStream, "UTF-8");
        
        while(true) {
            int rsz = in.read(buffer, 0, buffer.length);
            if (rsz < 0) {
                break;
            }
            out.append(buffer, 0, rsz);
        }
        return load(out.toString());
    }

    public static Context load(String string) throws UnsupportedEncodingException, IllegalArgumentException, IOException {
        Context context = new Context(string);
        return context;
    }
}
