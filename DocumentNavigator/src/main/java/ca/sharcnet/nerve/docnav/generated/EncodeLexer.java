// Generated from D:\project-local\trunk\nerve\DocumentNavigator/src/ca/sharcnet/nerve/docnav/antlr/EncodeLexer.g4 by ANTLR 4.7.1

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
	static { RuntimeMetaData.checkVersion("4.7.1", RuntimeMetaData.VERSION); }

	protected static final DFA[] _decisionToDFA;
	protected static final PredictionContextCache _sharedContextCache =
		new PredictionContextCache();
	public static final int
		COMMENT=1, DOCTYPE=2, EntityRef=3, CharRef=4, SEA_WS=5, INSTR_OPEN=6, 
		OPEN=7, TEXT=8, CATCHALL1=9, CLOSE=10, INSTR_CLOSE=11, SLASH_CLOSE=12, 
		SLASH=13, EQUALS=14, STRING=15, Name=16, S=17, CATCHALL2=18;
	public static final int
		INSIDE=1;
	public static String[] channelNames = {
		"DEFAULT_TOKEN_CHANNEL", "HIDDEN"
	};

	public static String[] modeNames = {
		"DEFAULT_MODE", "INSIDE"
	};

	public static final String[] ruleNames = {
		"COMMENT", "DOCTYPE", "EntityRef", "CharRef", "SEA_WS", "INSTR_OPEN", 
		"OPEN", "TEXT", "CATCHALL1", "CLOSE", "INSTR_CLOSE", "SLASH_CLOSE", "SLASH", 
		"EQUALS", "STRING", "Name", "S", "HEXDIGIT", "DIGIT", "NameChar", "NameStartChar", 
		"CATCHALL2"
	};

	private static final String[] _LITERAL_NAMES = {
		null, null, null, null, null, null, null, "'<'", null, null, "'>'", "'?>'", 
		"'/>'", "'/'", "'='"
	};
	private static final String[] _SYMBOLIC_NAMES = {
		null, "COMMENT", "DOCTYPE", "EntityRef", "CharRef", "SEA_WS", "INSTR_OPEN", 
		"OPEN", "TEXT", "CATCHALL1", "CLOSE", "INSTR_CLOSE", "SLASH_CLOSE", "SLASH", 
		"EQUALS", "STRING", "Name", "S", "CATCHALL2"
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
	public String[] getChannelNames() { return channelNames; }

	@Override
	public String[] getModeNames() { return modeNames; }

	@Override
	public ATN getATN() { return _ATN; }

	public static final String _serializedATN =
		"\3\u608b\ua72a\u8133\ub9ed\u417c\u3be7\u7786\u5964\2\24\u00be\b\1\b\1"+
		"\4\2\t\2\4\3\t\3\4\4\t\4\4\5\t\5\4\6\t\6\4\7\t\7\4\b\t\b\4\t\t\t\4\n\t"+
		"\n\4\13\t\13\4\f\t\f\4\r\t\r\4\16\t\16\4\17\t\17\4\20\t\20\4\21\t\21\4"+
		"\22\t\22\4\23\t\23\4\24\t\24\4\25\t\25\4\26\t\26\4\27\t\27\3\2\3\2\3\2"+
		"\3\2\3\2\3\2\3\2\7\28\n\2\f\2\16\2;\13\2\3\2\3\2\3\2\3\2\3\3\3\3\3\3\3"+
		"\3\3\3\7\3F\n\3\f\3\16\3I\13\3\3\3\3\3\3\4\3\4\3\4\3\4\3\5\3\5\3\5\3\5"+
		"\6\5U\n\5\r\5\16\5V\3\5\3\5\3\5\3\5\3\5\3\5\3\5\6\5`\n\5\r\5\16\5a\3\5"+
		"\3\5\5\5f\n\5\3\6\3\6\5\6j\n\6\3\6\6\6m\n\6\r\6\16\6n\3\7\3\7\3\7\3\7"+
		"\3\7\3\b\3\b\3\b\3\b\3\t\6\t{\n\t\r\t\16\t|\3\n\3\n\3\13\3\13\3\13\3\13"+
		"\3\f\3\f\3\f\3\f\3\f\3\r\3\r\3\r\3\r\3\r\3\16\3\16\3\17\3\17\3\20\3\20"+
		"\7\20\u0095\n\20\f\20\16\20\u0098\13\20\3\20\3\20\3\20\7\20\u009d\n\20"+
		"\f\20\16\20\u00a0\13\20\3\20\5\20\u00a3\n\20\3\21\3\21\7\21\u00a7\n\21"+
		"\f\21\16\21\u00aa\13\21\3\22\3\22\3\22\3\22\3\23\3\23\3\24\3\24\3\25\3"+
		"\25\3\25\3\25\5\25\u00b8\n\25\3\26\5\26\u00bb\n\26\3\27\3\27\49G\2\30"+
		"\4\3\6\4\b\5\n\6\f\7\16\b\20\t\22\n\24\13\26\f\30\r\32\16\34\17\36\20"+
		" \21\"\22$\23&\2(\2*\2,\2.\24\4\2\3\f\4\2\13\13\"\"\5\2((>>@@\3\2$$\3"+
		"\2))\5\2\13\f\17\17\"\"\5\2\62;CHch\3\2\62;\4\2/\60aa\5\2\u00b9\u00b9"+
		"\u0302\u0371\u2041\u2042\n\2<<C\\c|\u2072\u2191\u2c02\u2ff1\u3003\ud801"+
		"\uf902\ufdd1\ufdf2\uffff\2\u00ca\2\4\3\2\2\2\2\6\3\2\2\2\2\b\3\2\2\2\2"+
		"\n\3\2\2\2\2\f\3\2\2\2\2\16\3\2\2\2\2\20\3\2\2\2\2\22\3\2\2\2\2\24\3\2"+
		"\2\2\3\26\3\2\2\2\3\30\3\2\2\2\3\32\3\2\2\2\3\34\3\2\2\2\3\36\3\2\2\2"+
		"\3 \3\2\2\2\3\"\3\2\2\2\3$\3\2\2\2\3.\3\2\2\2\4\60\3\2\2\2\6@\3\2\2\2"+
		"\bL\3\2\2\2\ne\3\2\2\2\fl\3\2\2\2\16p\3\2\2\2\20u\3\2\2\2\22z\3\2\2\2"+
		"\24~\3\2\2\2\26\u0080\3\2\2\2\30\u0084\3\2\2\2\32\u0089\3\2\2\2\34\u008e"+
		"\3\2\2\2\36\u0090\3\2\2\2 \u00a2\3\2\2\2\"\u00a4\3\2\2\2$\u00ab\3\2\2"+
		"\2&\u00af\3\2\2\2(\u00b1\3\2\2\2*\u00b7\3\2\2\2,\u00ba\3\2\2\2.\u00bc"+
		"\3\2\2\2\60\61\7>\2\2\61\62\7#\2\2\62\63\7/\2\2\63\64\7/\2\2\649\3\2\2"+
		"\2\658\5\4\2\2\668\13\2\2\2\67\65\3\2\2\2\67\66\3\2\2\28;\3\2\2\29:\3"+
		"\2\2\29\67\3\2\2\2:<\3\2\2\2;9\3\2\2\2<=\7/\2\2=>\7/\2\2>?\7@\2\2?\5\3"+
		"\2\2\2@A\7>\2\2AB\7#\2\2BG\3\2\2\2CF\5\6\3\2DF\13\2\2\2EC\3\2\2\2ED\3"+
		"\2\2\2FI\3\2\2\2GH\3\2\2\2GE\3\2\2\2HJ\3\2\2\2IG\3\2\2\2JK\7@\2\2K\7\3"+
		"\2\2\2LM\7(\2\2MN\5\"\21\2NO\7=\2\2O\t\3\2\2\2PQ\7(\2\2QR\7%\2\2RT\3\2"+
		"\2\2SU\5(\24\2TS\3\2\2\2UV\3\2\2\2VT\3\2\2\2VW\3\2\2\2WX\3\2\2\2XY\7="+
		"\2\2Yf\3\2\2\2Z[\7(\2\2[\\\7%\2\2\\]\7z\2\2]_\3\2\2\2^`\5&\23\2_^\3\2"+
		"\2\2`a\3\2\2\2a_\3\2\2\2ab\3\2\2\2bc\3\2\2\2cd\7=\2\2df\3\2\2\2eP\3\2"+
		"\2\2eZ\3\2\2\2f\13\3\2\2\2gm\t\2\2\2hj\7\17\2\2ih\3\2\2\2ij\3\2\2\2jk"+
		"\3\2\2\2km\7\f\2\2lg\3\2\2\2li\3\2\2\2mn\3\2\2\2nl\3\2\2\2no\3\2\2\2o"+
		"\r\3\2\2\2pq\7>\2\2qr\7A\2\2rs\3\2\2\2st\b\7\2\2t\17\3\2\2\2uv\7>\2\2"+
		"vw\3\2\2\2wx\b\b\2\2x\21\3\2\2\2y{\n\3\2\2zy\3\2\2\2{|\3\2\2\2|z\3\2\2"+
		"\2|}\3\2\2\2}\23\3\2\2\2~\177\13\2\2\2\177\25\3\2\2\2\u0080\u0081\7@\2"+
		"\2\u0081\u0082\3\2\2\2\u0082\u0083\b\13\3\2\u0083\27\3\2\2\2\u0084\u0085"+
		"\7A\2\2\u0085\u0086\7@\2\2\u0086\u0087\3\2\2\2\u0087\u0088\b\f\3\2\u0088"+
		"\31\3\2\2\2\u0089\u008a\7\61\2\2\u008a\u008b\7@\2\2\u008b\u008c\3\2\2"+
		"\2\u008c\u008d\b\r\3\2\u008d\33\3\2\2\2\u008e\u008f\7\61\2\2\u008f\35"+
		"\3\2\2\2\u0090\u0091\7?\2\2\u0091\37\3\2\2\2\u0092\u0096\7$\2\2\u0093"+
		"\u0095\n\4\2\2\u0094\u0093\3\2\2\2\u0095\u0098\3\2\2\2\u0096\u0094\3\2"+
		"\2\2\u0096\u0097\3\2\2\2\u0097\u0099\3\2\2\2\u0098\u0096\3\2\2\2\u0099"+
		"\u00a3\7$\2\2\u009a\u009e\7)\2\2\u009b\u009d\n\5\2\2\u009c\u009b\3\2\2"+
		"\2\u009d\u00a0\3\2\2\2\u009e\u009c\3\2\2\2\u009e\u009f\3\2\2\2\u009f\u00a1"+
		"\3\2\2\2\u00a0\u009e\3\2\2\2\u00a1\u00a3\7)\2\2\u00a2\u0092\3\2\2\2\u00a2"+
		"\u009a\3\2\2\2\u00a3!\3\2\2\2\u00a4\u00a8\5,\26\2\u00a5\u00a7\5*\25\2"+
		"\u00a6\u00a5\3\2\2\2\u00a7\u00aa\3\2\2\2\u00a8\u00a6\3\2\2\2\u00a8\u00a9"+
		"\3\2\2\2\u00a9#\3\2\2\2\u00aa\u00a8\3\2\2\2\u00ab\u00ac\t\6\2\2\u00ac"+
		"\u00ad\3\2\2\2\u00ad\u00ae\b\22\4\2\u00ae%\3\2\2\2\u00af\u00b0\t\7\2\2"+
		"\u00b0\'\3\2\2\2\u00b1\u00b2\t\b\2\2\u00b2)\3\2\2\2\u00b3\u00b8\5,\26"+
		"\2\u00b4\u00b8\t\t\2\2\u00b5\u00b8\5(\24\2\u00b6\u00b8\t\n\2\2\u00b7\u00b3"+
		"\3\2\2\2\u00b7\u00b4\3\2\2\2\u00b7\u00b5\3\2\2\2\u00b7\u00b6\3\2\2\2\u00b8"+
		"+\3\2\2\2\u00b9\u00bb\t\13\2\2\u00ba\u00b9\3\2\2\2\u00bb-\3\2\2\2\u00bc"+
		"\u00bd\13\2\2\2\u00bd/\3\2\2\2\25\2\3\679EGVaeiln|\u0096\u009e\u00a2\u00a8"+
		"\u00b7\u00ba\5\7\3\2\6\2\2\b\2\2";
	public static final ATN _ATN =
		new ATNDeserializer().deserialize(_serializedATN.toCharArray());
	static {
		_decisionToDFA = new DFA[_ATN.getNumberOfDecisions()];
		for (int i = 0; i < _ATN.getNumberOfDecisions(); i++) {
			_decisionToDFA[i] = new DFA(_ATN.getDecisionState(i), i);
		}
	}
}