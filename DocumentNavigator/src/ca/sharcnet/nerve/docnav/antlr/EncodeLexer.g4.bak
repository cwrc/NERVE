lexer grammar EncodeLexer;
@header {
    package ca.sharcnet.nerve.docnav.generated;
}

@members {
    public void println(String s){
        System.out.println(s);
    }
}

// Default "mode": Everything OUTSIDE of a tag
COMMENT     :   '<!--' (COMMENT|.)*? '-->'
            ;

INSTR       :   ('<?') (INSTR|.)*? '>'
            ;

DOCTYPE     :   ('<!') (DOCTYPE|.)*? '>'
            ;

EntityRef   :   '&' Name ';'
            ;

CharRef     :   '&#' DIGIT+ ';'
            |   '&#x' HEXDIGIT+ ';'
            ;

SEA_WS      :   (' '|'\t'|'\r'? '\n')+
            ;

OPEN        :   '<' -> pushMode(INSIDE)
            ;

TEXT        :   ~[<>&]+
            ;

CATCHALL1   : .
            ;

// ----------------- Everything INSIDE of a tag ---------------------
mode INSIDE;

CLOSE       :   '>'                     -> popMode ;
SLASH_CLOSE :   '/>'                    -> popMode ;
SLASH       :   '/' ;
EQUALS      :   '=' ;
STRING      :   '"' ~["]* '"'
            |   '\'' ~[']* '\''
            ;

Name        :   NameStartChar NameChar* ;
S           :   [ \t\r\n]               -> skip ;

fragment
HEXDIGIT    :   [a-fA-F0-9] ;

fragment
DIGIT       :   [0-9] ;

fragment
NameChar    :   NameStartChar
            |   '-' | '_' | '.' | DIGIT
            |   '\u00B7'
            |   '\u0300'..'\u036F'
            |   '\u203F'..'\u2040'
            ;

fragment
NameStartChar
            :   [:a-zA-Z]
            |   '\u2070'..'\u218F'
            |   '\u2C00'..'\u2FEF'
            |   '\u3001'..'\uD7FF'
            |   '\uF900'..'\uFDCF'
            |   '\uFDF0'..'\uFFFD'
            ;

CATCHALL2   : .
            ;