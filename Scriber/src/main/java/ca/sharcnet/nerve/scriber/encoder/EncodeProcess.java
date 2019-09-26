package ca.sharcnet.nerve.scriber.encoder;

public enum EncodeProcess {
    NER,        /* mark up xml with recognized tags from NER, does not mark up already tagged elements */
    DICTIONARY, /* mark up xml with recognized tags from dictionary, does not mark up already tagged elements */
    LINK,       /* add link information from dictionary to element, does not change already linked elements  */
    HTML        /* conver xml to html, should be performed last */
}
