package ca.sharcnet.nerve.docnav.dom;

public class UnknownKeyException extends DocNavException{

    UnknownKeyException(String string) {
        super("key value '" + string + "' is not found.");
    }
}
