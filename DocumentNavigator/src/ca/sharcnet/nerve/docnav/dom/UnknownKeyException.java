package ca.sharcnet.nerve.docnav.dom;

import ca.sharcnet.docnav.DocNavException;

public class UnknownKeyException extends DocNavException{

    UnknownKeyException(String string) {
        super("key value '" + string + "' is not found.");
    }
}
