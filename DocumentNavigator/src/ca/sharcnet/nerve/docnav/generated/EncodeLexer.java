// Generated from D:/Dropbox/Projects/groups/autoTagger/nerve-core/DocumentNavigator/src/ca/sharcnet/nerve/docnav/antlr/EncodeLexer.g4 by ANTLR 4.5.3

    package ca.sharcnet.nerve.docnav.generated;

import org.antlr.v4.runtime.Lexer;
import org.antlr.v4.runtime.CharStream;
import org.antlr.v4.runtime.Token;
import org.antlr.v4.runtime.TokenStream;
import org.antlr.v4.runtime.*;
import org.antlr.v4.runtime.atn.*;
import org.antlr.v4.runtime.dfa.DFA;
import org.antlr.v4.runtime.misc.*;

@SuppressWarnings({"all", "warnings", "unchecked", "unused", "cast"})
public class EncodeLexer extends Lexer {
	static { RuntimeMetaData.checkVersion("4.5.3", RuntimeMetaData.VERSION); }

	protected static final DFA[] _decisionToDFA;
	protected static final PredictionContextCache _sharedContextCache =
		new PredictionContextCache();
	public static final int
		COMMENT=1, DTD=2, EntityRef=3, CharRef=4, SEA_WS=5, OPEN=6, TEXT=7, CATCHALL1=8, 
		CLOSE=9, SLASH_CLOSE=10, SLASH=11, EQUALS=12, STRING=13, Name=14, S=15, 
		CATCHALL2=16;
	public static final int INSIDE = 1;
	public static String[] modeNames = {
		"DEFAULT_MODE", "INSIDE"
	};

	public static final String[] ruleNames = {
		"COMMENT", "DTD", "EntityRef", "CharRef", "SEA_WS", "OPEN", "TEXT", "CATCHALL1", 
		"CLOSE", "SLASH_CLOSE", "SLASH", "EQUALS", "STRING", "Name", "S", "HEXDIGIT", 
		"DIGIT", "NameChar", "NameStartChar", "CATCHALL2"
	};

	private static final String[] _LITERAL_NAMES = {
		null, null, null, null, null, null, "'<'", null, null, "'>'", "'/>'", 
		"'/'", "'='"
	};
	private static final String[] _SYMBOLIC_NAMES = {
		null, "COMMENT", "DTD", "EntityRef", "CharRef", "SEA_WS", "OPEN", "TEXT", 
		"CATCHALL1", "CLOSE", "SLASH_CLOSE", "SLASH", "EQUALS", "STRING", "Name", 
		"S", "CATCHALL2"
	};
	public static final Vocabulary VOCABULARY = new VocabularyImpl(_LITERAL_NAMES, _SYMBOLIC_NAMES);

	/**
	 * @deprecated Use {@link #VOCABULARY} instead.
	 */
	@Deprecated
	public static final String[] tokenNames;
	static {
		tokenNames = new String[_SYMBOLIC_NAMES.length];
		for (int i = 0; i < tokenNames.length; i++) {
			tokenNames[i] = VOCABULARY.getLiteralName(i);
			if (tokenNames[i] == null) {
				tokenNames[i] = VOCABULARY.getSymbolicName(i);
			}

			if (tokenNames[i] == null) {
				tokenNames[i] = "<INVALID>";
			}
		}
	}

	@Override
	@Deprecated
	public String[] getTokenNames() {
		return tokenNames;
	}

	@Override

	public Vocabulary getVocabulary() {
		return VOCABULARY;
	}


	    public void println(String s){
	        System.out.println(s);
	    }


	public EncodeLexer(CharStream input) {
		super(input);
		_interp = new LexerATNSimulator(this,_ATN,_decisionToDFA,_sharedContextCache);
	}

	@Override
	public String getGrammarFileName() { return "EncodeLexer.g4"; }

	@Override
	public String[] getRuleNames() { return ruleNames; }

	@Override
	public String getSerializedATN() { return _serializedATN; }

	@Override
	public String[] getModeNames() { return modeNames; }

	@Override
	public ATN getATN() { return _ATN; }

	public static final String _serializedATN =
		"\3\u0430\ud6d1\u8206\uad2d\u4417\uaef1\u8d80\uaadd\2\22\u00b3\b\1\b\1"+
		"\4\2\t\2\4\3\t\3\4\4\t\4\4\5\t\5\4\6\t\6\4\7\t\7\4\b\t\b\4\t\t\t\4\n\t"+
		"\n\4\13\t\13\4\f\t\f\4\r\t\r\4\16\t\16\4\17\t\17\4\20\t\20\4\21\t\21\4"+
		"\22\t\22\4\23\t\23\4\24\t\24\4\25\t\25\3\2\3\2\3\2\3\2\3\2\3\2\3\2\7\2"+
		"\64\n\2\f\2\16\2\67\13\2\3\2\3\2\3\2\3\2\3\3\3\3\3\3\3\3\5\3A\n\3\3\3"+
		"\3\3\7\3E\n\3\f\3\16\3H\13\3\3\3\3\3\3\4\3\4\3\4\3\4\3\5\3\5\3\5\3\5\6"+
		"\5T\n\5\r\5\16\5U\3\5\3\5\3\5\3\5\3\5\3\5\3\5\6\5_\n\5\r\5\16\5`\3\5\3"+
		"\5\5\5e\n\5\3\6\3\6\5\6i\n\6\3\6\6\6l\n\6\r\6\16\6m\3\7\3\7\3\7\3\7\3"+
		"\b\6\bu\n\b\r\b\16\bv\3\t\3\t\3\n\3\n\3\n\3\n\3\13\3\13\3\13\3\13\3\13"+
		"\3\f\3\f\3\r\3\r\3\16\3\16\7\16\u008a\n\16\f\16\16\16\u008d\13\16\3\16"+
		"\3\16\3\16\7\16\u0092\n\16\f\16\16\16\u0095\13\16\3\16\5\16\u0098\n\16"+
		"\3\17\3\17\7\17\u009c\n\17\f\17\16\17\u009f\13\17\3\20\3\20\3\20\3\20"+
		"\3\21\3\21\3\22\3\22\3\23\3\23\3\23\3\23\5\23\u00ad\n\23\3\24\5\24\u00b0"+
		"\n\24\3\25\3\25\4\65F\2\26\4\3\6\4\b\5\n\6\f\7\16\b\20\t\22\n\24\13\26"+
		"\f\30\r\32\16\34\17\36\20 \21\"\2$\2&\2(\2*\22\4\2\3\f\4\2\13\13\"\"\5"+
		"\2((>>@@\4\2$$>>\4\2))>>\5\2\13\f\17\17\"\"\5\2\62;CHch\3\2\62;\4\2/\60"+
		"aa\5\2\u00b9\u00b9\u0302\u0371\u2041\u2042\n\2<<C\\c|\u2072\u2191\u2c02"+
		"\u2ff1\u3003\ud801\uf902\ufdd1\ufdf2\uffff\u00c0\2\4\3\2\2\2\2\6\3\2\2"+
		"\2\2\b\3\2\2\2\2\n\3\2\2\2\2\f\3\2\2\2\2\16\3\2\2\2\2\20\3\2\2\2\2\22"+
		"\3\2\2\2\3\24\3\2\2\2\3\26\3\2\2\2\3\30\3\2\2\2\3\32\3\2\2\2\3\34\3\2"+
		"\2\2\3\36\3\2\2\2\3 \3\2\2\2\3*\3\2\2\2\4,\3\2\2\2\6@\3\2\2\2\bK\3\2\2"+
		"\2\nd\3\2\2\2\fk\3\2\2\2\16o\3\2\2\2\20t\3\2\2\2\22x\3\2\2\2\24z\3\2\2"+
		"\2\26~\3\2\2\2\30\u0083\3\2\2\2\32\u0085\3\2\2\2\34\u0097\3\2\2\2\36\u0099"+
		"\3\2\2\2 \u00a0\3\2\2\2\"\u00a4\3\2\2\2$\u00a6\3\2\2\2&\u00ac\3\2\2\2"+
		"(\u00af\3\2\2\2*\u00b1\3\2\2\2,-\7>\2\2-.\7#\2\2./\7/\2\2/\60\7/\2\2\60"+
		"\65\3\2\2\2\61\64\5\4\2\2\62\64\13\2\2\2\63\61\3\2\2\2\63\62\3\2\2\2\64"+
		"\67\3\2\2\2\65\66\3\2\2\2\65\63\3\2\2\2\668\3\2\2\2\67\65\3\2\2\289\7"+
		"/\2\29:\7/\2\2:;\7@\2\2;\5\3\2\2\2<=\7>\2\2=A\7#\2\2>?\7>\2\2?A\7A\2\2"+
		"@<\3\2\2\2@>\3\2\2\2AF\3\2\2\2BE\5\6\3\2CE\13\2\2\2DB\3\2\2\2DC\3\2\2"+
		"\2EH\3\2\2\2FG\3\2\2\2FD\3\2\2\2GI\3\2\2\2HF\3\2\2\2IJ\7@\2\2J\7\3\2\2"+
		"\2KL\7(\2\2LM\5\36\17\2MN\7=\2\2N\t\3\2\2\2OP\7(\2\2PQ\7%\2\2QS\3\2\2"+
		"\2RT\5$\22\2SR\3\2\2\2TU\3\2\2\2US\3\2\2\2UV\3\2\2\2VW\3\2\2\2WX\7=\2"+
		"\2Xe\3\2\2\2YZ\7(\2\2Z[\7%\2\2[\\\7z\2\2\\^\3\2\2\2]_\5\"\21\2^]\3\2\2"+
		"\2_`\3\2\2\2`^\3\2\2\2`a\3\2\2\2ab\3\2\2\2bc\7=\2\2ce\3\2\2\2dO\3\2\2"+
		"\2dY\3\2\2\2e\13\3\2\2\2fl\t\2\2\2gi\7\17\2\2hg\3\2\2\2hi\3\2\2\2ij\3"+
		"\2\2\2jl\7\f\2\2kf\3\2\2\2kh\3\2\2\2lm\3\2\2\2mk\3\2\2\2mn\3\2\2\2n\r"+
		"\3\2\2\2op\7>\2\2pq\3\2\2\2qr\b\7\2\2r\17\3\2\2\2su\n\3\2\2ts\3\2\2\2"+
		"uv\3\2\2\2vt\3\2\2\2vw\3\2\2\2w\21\3\2\2\2xy\13\2\2\2y\23\3\2\2\2z{\7"+
		"@\2\2{|\3\2\2\2|}\b\n\3\2}\25\3\2\2\2~\177\7\61\2\2\177\u0080\7@\2\2\u0080"+
		"\u0081\3\2\2\2\u0081\u0082\b\13\3\2\u0082\27\3\2\2\2\u0083\u0084\7\61"+
		"\2\2\u0084\31\3\2\2\2\u0085\u0086\7?\2\2\u0086\33\3\2\2\2\u0087\u008b"+
		"\7$\2\2\u0088\u008a\n\4\2\2\u0089\u0088\3\2\2\2\u008a\u008d\3\2\2\2\u008b"+
		"\u0089\3\2\2\2\u008b\u008c\3\2\2\2\u008c\u008e\3\2\2\2\u008d\u008b\3\2"+
		"\2\2\u008e\u0098\7$\2\2\u008f\u0093\7)\2\2\u0090\u0092\n\5\2\2\u0091\u0090"+
		"\3\2\2\2\u0092\u0095\3\2\2\2\u0093\u0091\3\2\2\2\u0093\u0094\3\2\2\2\u0094"+
		"\u0096\3\2\2\2\u0095\u0093\3\2\2\2\u0096\u0098\7)\2\2\u0097\u0087\3\2"+
		"\2\2\u0097\u008f\3\2\2\2\u0098\35\3\2\2\2\u0099\u009d\5(\24\2\u009a\u009c"+
		"\5&\23\2\u009b\u009a\3\2\2\2\u009c\u009f\3\2\2\2\u009d\u009b\3\2\2\2\u009d"+
		"\u009e\3\2\2\2\u009e\37\3\2\2\2\u009f\u009d\3\2\2\2\u00a0\u00a1\t\6\2"+
		"\2\u00a1\u00a2\3\2\2\2\u00a2\u00a3\b\20\4\2\u00a3!\3\2\2\2\u00a4\u00a5"+
		"\t\7\2\2\u00a5#\3\2\2\2\u00a6\u00a7\t\b\2\2\u00a7%\3\2\2\2\u00a8\u00ad"+
		"\5(\24\2\u00a9\u00ad\t\t\2\2\u00aa\u00ad\5$\22\2\u00ab\u00ad\t\n\2\2\u00ac"+
		"\u00a8\3\2\2\2\u00ac\u00a9\3\2\2\2\u00ac\u00aa\3\2\2\2\u00ac\u00ab\3\2"+
		"\2\2\u00ad\'\3\2\2\2\u00ae\u00b0\t\13\2\2\u00af\u00ae\3\2\2\2\u00b0)\3"+
		"\2\2\2\u00b1\u00b2\13\2\2\2\u00b2+\3\2\2\2\26\2\3\63\65@DFU`dhkmv\u008b"+
		"\u0093\u0097\u009d\u00ac\u00af\5\7\3\2\6\2\2\b\2\2";
	public static final ATN _ATN =
		new ATNDeserializer().deserialize(_serializedATN.toCharArray());
	static {
		_decisionToDFA = new DFA[_ATN.getNumberOfDecisions()];
		for (int i = 0; i < _ATN.getNumberOfDecisions(); i++) {
			_decisionToDFA[i] = new DFA(_ATN.getDecisionState(i), i);
		}
	}
}