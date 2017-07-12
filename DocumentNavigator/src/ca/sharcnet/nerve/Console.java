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

    public static void log(Object object) {
        StackTraceElement ele = Thread.currentThread().getStackTrace()[2];
        String s = "null";
        if (object != null) s = object.toString();
        if (object.getClass().isArray()) s = Arrays.toString((Object[]) object);
        out.println("[" + ele.getFileName() + ":" + ele.getLineNumber() + "] " + s);
    }

    public static void logMethod() {
        StackTraceElement ele = Thread.currentThread().getStackTrace()[2];
        log("[" + ele.getFileName() + ":" + ele.getLineNumber() + "] " + ele.getClassName().substring(ele.getClassName().lastIndexOf(".") + 1) + "." + ele.getMethodName() + "()");
    }

    public static void logMethod(Object object) {
        StackTraceElement ele = Thread.currentThread().getStackTrace()[2];
        out.println("[" + ele.getFileName() + ":" + ele.getLineNumber() + "] " + ele.getClassName().substring(ele.getClassName().lastIndexOf(".") + 1) + "." + ele.getMethodName() + "() : " + object.toString());
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
