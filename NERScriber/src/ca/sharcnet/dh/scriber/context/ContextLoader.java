package ca.sharcnet.dh.scriber.context;
import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.UnsupportedEncodingException;
import org.json.JSONObject;
import org.json.JSONTokener;

public class ContextLoader {
    private static final long serialVersionUID = 1L;

    private ContextLoader() {}

    public static Context load(InputStream stream) throws IllegalArgumentException, IOException {
        if (stream == null) throw new NullPointerException("null stream");
        Context context;

        BufferedReader fileReader = new BufferedReader(new InputStreamReader(stream));
        JSONTokener jst = new JSONTokener(fileReader);
        JSONObject root = new JSONObject(jst);
        context = new Context(root);
        return context;
    }

    public static Context load(String string) throws UnsupportedEncodingException, IllegalArgumentException, IOException{
        InputStream srcStream = new ByteArrayInputStream(string.getBytes("UTF-8"));
        return load(srcStream);
    }
}