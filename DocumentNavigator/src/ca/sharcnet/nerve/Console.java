package ca.sharcnet.nerve;

import java.io.PrintStream;
import java.util.Arrays;

/**
 * Utility class for printing debugging information to terminal.
 *
 * @author Ed Armstrong
 */
public class Console {

    private Console() {
    }
    public static PrintStream out = System.out;

    public static void log(Object ... objects) {
        StackTraceElement ele = Thread.currentThread().getStackTrace()[2];

        out.print("[" + ele.getFileName() + ":" + ele.getLineNumber() + "] ");
        for (Object object : objects){
            String s = "null";
            if (object != null) s = object.toString();
            else if (object.getClass().isArray()) s = Arrays.toString((Object[]) object);
            out.print(s + " ");
        }
        out.println();
    }

    public static void logMethod(Object ... objects) {
        StackTraceElement ele = Thread.currentThread().getStackTrace()[2];
        out.print("[" + ele.getClassName().substring(ele.getClassName().lastIndexOf(".") + 1) + "." + ele.getMethodName() + "():" + ele.getLineNumber() +"] ");

        for (Object object : objects){
            String s = "null";
            if (object != null) s = object.toString();
            else if (object.getClass().isArray()) s = Arrays.toString((Object[]) object);
            out.print(s + " ");
        }
        out.println();
    }

    public static void trace(Object object) {
        StackTraceElement[] eles = Thread.currentThread().getStackTrace();
        out.println("TRACE:");
        for (int i = 2; i < eles.length; i++) out.println(eles[i]);

        String s = "null";
        if (object != null) s= object.toString();
        if (object != null && object.getClass().isArray()) s = Arrays.toString((Object[]) object);
        out.println(s);
    }

    public static void trace() {
        StackTraceElement[] eles = Thread.currentThread().getStackTrace();
        out.println("TRACE:");
        for (int i = 2; i < eles.length; i++) out.println(eles[i]);
    }
}
