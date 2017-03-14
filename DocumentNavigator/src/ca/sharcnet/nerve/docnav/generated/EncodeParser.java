// Generated from D:/Dropbox/Projects/groups/autoTagger/nerve-core/DocumentNavigator/src/ca/sharcnet/nerve/docnav/antlr/EncodeParser.g4 by ANTLR 4.5.3

    package ca.sharcnet.nerve.docnav.generated;
    import ca.sharcnet.nerve.docnav.dom.*;
    import ca.sharcnet.nerve.docnav.antlr.*;

import org.antlr.v4.runtime.atn.*;
import org.antlr.v4.runtime.dfa.DFA;
import org.antlr.v4.runtime.*;
import org.antlr.v4.runtime.misc.*;
import org.antlr.v4.runtime.tree.*;
import java.util.List;
import java.util.Iterator;
import java.util.ArrayList;

@SuppressWarnings({"all", "warnings", "unchecked", "unused", "cast"})
public class EncodeParser extends AbstractParser {
	static { RuntimeMetaData.checkVersion("4.5.3", RuntimeMetaData.VERSION); }

	protected static final DFA[] _decisionToDFA;
	protected static final PredictionContextCache _sharedContextCache =
		new PredictionContextCache();
	public static final int
		COMMENT=1, DTD=2, EntityRef=3, CharRef=4, SEA_WS=5, OPEN=6, TEXT=7, CATCHALL1=8, 
		CLOSE=9, SLASH_CLOSE=10, SLASH=11, EQUALS=12, STRING=13, Name=14, S=15, 
		CATCHALL2=16;
	public static final int
		RULE_start = 0, RULE_contents = 1, RULE_content = 2, RULE_element = 3, 
		RULE_startTag = 4, RULE_endTag = 5, RULE_reference = 6, RULE_attributes = 7, 
		RULE_attribute = 8, RULE_chardata = 9, RULE_miscList = 10, RULE_misc = 11;
	public static final String[] ruleNames = {
		"start", "contents", "content", "element", "startTag", "endTag", "reference", 
		"attributes", "attribute", "chardata", "miscList", "misc"
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

	@Override
	public String getGrammarFileName() { return "EncodeParser.g4"; }

	@Override
	public String[] getRuleNames() { return ruleNames; }

	@Override
	public String getSerializedATN() { return _serializedATN; }

	@Override
	public ATN getATN() { return _ATN; }

	public EncodeParser(TokenStream input) {
		super(input);
		_interp = new ParserATNSimulator(this,_ATN,_decisionToDFA,_sharedContextCache);
	}
	public static class StartContext extends ParserRuleContext {
		public MiscListContext m1;
		public ElementContext element;
		public MiscListContext m2;
		public ElementContext element() {
			return getRuleContext(ElementContext.class,0);
		}
		public List<MiscListContext> miscList() {
			return getRuleContexts(MiscListContext.class);
		}
		public MiscListContext miscList(int i) {
			return getRuleContext(MiscListContext.class,i);
		}
		public StartContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_start; }
		@Override
		public void enterRule(ParseTreeListener listener) {
			if ( listener instanceof EncodeParserListener ) ((EncodeParserListener)listener).enterStart(this);
		}
		@Override
		public void exitRule(ParseTreeListener listener) {
			if ( listener instanceof EncodeParserListener ) ((EncodeParserListener)listener).exitStart(this);
		}
	}

	public final StartContext start() throws RecognitionException {
		StartContext _localctx = new StartContext(_ctx, getState());
		enterRule(_localctx, 0, RULE_start);
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(24);
			((StartContext)_localctx).m1 = miscList();
			setState(25);
			((StartContext)_localctx).element = element();
			setState(26);
			((StartContext)_localctx).m2 = miscList();

			        this.nodes.add(((StartContext)_localctx).m1.nodes);
			        this.nodes.add(((StartContext)_localctx).element.node);
			        this.nodes.add(((StartContext)_localctx).m2.nodes);
			    
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	public static class ContentsContext extends ParserRuleContext {
		public NodeList nodelist =  new NodeList();;
		public List<ContentContext> content() {
			return getRuleContexts(ContentContext.class);
		}
		public ContentContext content(int i) {
			return getRuleContext(ContentContext.class,i);
		}
		public ContentsContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_contents; }
		@Override
		public void enterRule(ParseTreeListener listener) {
			if ( listener instanceof EncodeParserListener ) ((EncodeParserListener)listener).enterContents(this);
		}
		@Override
		public void exitRule(ParseTreeListener listener) {
			if ( listener instanceof EncodeParserListener ) ((EncodeParserListener)listener).exitContents(this);
		}
	}

	public final ContentsContext contents() throws RecognitionException {
		ContentsContext _localctx = new ContentsContext(_ctx, getState());
		enterRule(_localctx, 2, RULE_contents);
		try {
			int _alt;
			enterOuterAlt(_localctx, 1);
			{
			setState(32);
			_errHandler.sync(this);
			_alt = getInterpreter().adaptivePredict(_input,0,_ctx);
			while ( _alt!=2 && _alt!=org.antlr.v4.runtime.atn.ATN.INVALID_ALT_NUMBER ) {
				if ( _alt==1 ) {
					{
					{
					setState(29);
					content();
					}
					} 
				}
				setState(34);
				_errHandler.sync(this);
				_alt = getInterpreter().adaptivePredict(_input,0,_ctx);
			}
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	public static class ContentContext extends ParserRuleContext {
		public NodeList nodelist =  new NodeList();;
		public ChardataContext chardata;
		public ElementContext element;
		public ReferenceContext reference;
		public Token COMMENT;
		public ChardataContext chardata() {
			return getRuleContext(ChardataContext.class,0);
		}
		public ElementContext element() {
			return getRuleContext(ElementContext.class,0);
		}
		public ReferenceContext reference() {
			return getRuleContext(ReferenceContext.class,0);
		}
		public TerminalNode COMMENT() { return getToken(EncodeParser.COMMENT, 0); }
		public ContentContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_content; }
		@Override
		public void enterRule(ParseTreeListener listener) {
			if ( listener instanceof EncodeParserListener ) ((EncodeParserListener)listener).enterContent(this);
		}
		@Override
		public void exitRule(ParseTreeListener listener) {
			if ( listener instanceof EncodeParserListener ) ((EncodeParserListener)listener).exitContent(this);
		}
	}

	public final ContentContext content() throws RecognitionException {
		ContentContext _localctx = new ContentContext(_ctx, getState());
		enterRule(_localctx, 4, RULE_content);
		try {
			setState(46);
			switch (_input.LA(1)) {
			case SEA_WS:
			case TEXT:
				enterOuterAlt(_localctx, 1);
				{
				setState(35);
				((ContentContext)_localctx).chardata = chardata();
				((ContentsContext)getInvokingContext(1)).nodelist.add(((ContentContext)_localctx).chardata.node);
				}
				break;
			case OPEN:
				enterOuterAlt(_localctx, 2);
				{
				setState(38);
				((ContentContext)_localctx).element = element();
				((ContentsContext)getInvokingContext(1)).nodelist.add(((ContentContext)_localctx).element.node);
				}
				break;
			case EntityRef:
			case CharRef:
				enterOuterAlt(_localctx, 3);
				{
				setState(41);
				((ContentContext)_localctx).reference = reference();
				((ContentsContext)getInvokingContext(1)).nodelist.add(((ContentContext)_localctx).reference.node);
				}
				break;
			case COMMENT:
				enterOuterAlt(_localctx, 4);
				{
				setState(44);
				((ContentContext)_localctx).COMMENT = match(COMMENT);
				((ContentsContext)getInvokingContext(1)).nodelist.add(new CommentNode((((ContentContext)_localctx).COMMENT!=null?((ContentContext)_localctx).COMMENT.getText():null)));
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	public static class ElementContext extends ParserRuleContext {
		public ElementNode node;
		public StartTagContext startTag;
		public ContentsContext contents;
		public Token Name;
		public AttributesContext attributes;
		public StartTagContext startTag() {
			return getRuleContext(StartTagContext.class,0);
		}
		public ContentsContext contents() {
			return getRuleContext(ContentsContext.class,0);
		}
		public EndTagContext endTag() {
			return getRuleContext(EndTagContext.class,0);
		}
		public TerminalNode Name() { return getToken(EncodeParser.Name, 0); }
		public AttributesContext attributes() {
			return getRuleContext(AttributesContext.class,0);
		}
		public ElementContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_element; }
		@Override
		public void enterRule(ParseTreeListener listener) {
			if ( listener instanceof EncodeParserListener ) ((EncodeParserListener)listener).enterElement(this);
		}
		@Override
		public void exitRule(ParseTreeListener listener) {
			if ( listener instanceof EncodeParserListener ) ((EncodeParserListener)listener).exitElement(this);
		}
	}

	public final ElementContext element() throws RecognitionException {
		ElementContext _localctx = new ElementContext(_ctx, getState());
		enterRule(_localctx, 6, RULE_element);
		try {
			setState(59);
			_errHandler.sync(this);
			switch ( getInterpreter().adaptivePredict(_input,2,_ctx) ) {
			case 1:
				enterOuterAlt(_localctx, 1);
				{
				setState(48);
				((ElementContext)_localctx).startTag = startTag();
				setState(49);
				((ElementContext)_localctx).contents = contents();
				setState(50);
				endTag();
				((ElementContext)_localctx).node =  new ElementNode(((ElementContext)_localctx).startTag.name, ((ElementContext)_localctx).startTag.list, ((ElementContext)_localctx).contents.nodelist);
				}
				break;
			case 2:
				enterOuterAlt(_localctx, 2);
				{
				setState(53);
				match(OPEN);
				setState(54);
				((ElementContext)_localctx).Name = match(Name);
				setState(55);
				((ElementContext)_localctx).attributes = attributes();
				setState(56);
				match(SLASH_CLOSE);
				((ElementContext)_localctx).node =  new ElementNode((((ElementContext)_localctx).Name!=null?((ElementContext)_localctx).Name.getText():null), ((ElementContext)_localctx).attributes.list, new NodeList());
				}
				break;
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	public static class StartTagContext extends ParserRuleContext {
		public AttributeList list;
		public String name;
		public Token Name;
		public AttributesContext attributes;
		public TerminalNode Name() { return getToken(EncodeParser.Name, 0); }
		public AttributesContext attributes() {
			return getRuleContext(AttributesContext.class,0);
		}
		public StartTagContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_startTag; }
		@Override
		public void enterRule(ParseTreeListener listener) {
			if ( listener instanceof EncodeParserListener ) ((EncodeParserListener)listener).enterStartTag(this);
		}
		@Override
		public void exitRule(ParseTreeListener listener) {
			if ( listener instanceof EncodeParserListener ) ((EncodeParserListener)listener).exitStartTag(this);
		}
	}

	public final StartTagContext startTag() throws RecognitionException {
		StartTagContext _localctx = new StartTagContext(_ctx, getState());
		enterRule(_localctx, 8, RULE_startTag);
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(61);
			match(OPEN);
			setState(62);
			((StartTagContext)_localctx).Name = match(Name);
			setState(63);
			((StartTagContext)_localctx).attributes = attributes();
			setState(64);
			match(CLOSE);

			        pushTag((((StartTagContext)_localctx).Name!=null?((StartTagContext)_localctx).Name.getText():null), ((StartTagContext)_localctx).Name);
			        ((StartTagContext)_localctx).name =  (((StartTagContext)_localctx).Name!=null?((StartTagContext)_localctx).Name.getText():null);
			        ((StartTagContext)_localctx).list =  ((StartTagContext)_localctx).attributes.list;
			    
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	public static class EndTagContext extends ParserRuleContext {
		public String name;
		public Token Name;
		public TerminalNode Name() { return getToken(EncodeParser.Name, 0); }
		public EndTagContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_endTag; }
		@Override
		public void enterRule(ParseTreeListener listener) {
			if ( listener instanceof EncodeParserListener ) ((EncodeParserListener)listener).enterEndTag(this);
		}
		@Override
		public void exitRule(ParseTreeListener listener) {
			if ( listener instanceof EncodeParserListener ) ((EncodeParserListener)listener).exitEndTag(this);
		}
	}

	public final EndTagContext endTag() throws RecognitionException {
		EndTagContext _localctx = new EndTagContext(_ctx, getState());
		enterRule(_localctx, 10, RULE_endTag);
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(67);
			match(OPEN);
			setState(68);
			match(SLASH);
			setState(69);
			((EndTagContext)_localctx).Name = match(Name);
			setState(70);
			match(CLOSE);

			        popTag((((EndTagContext)_localctx).Name!=null?((EndTagContext)_localctx).Name.getText():null), ((EndTagContext)_localctx).Name);
			        ((EndTagContext)_localctx).name =  (((EndTagContext)_localctx).Name!=null?((EndTagContext)_localctx).Name.getText():null);
			    
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	public static class ReferenceContext extends ParserRuleContext {
		public TextNode node;
		public Token EntityRef;
		public Token CharRef;
		public TerminalNode EntityRef() { return getToken(EncodeParser.EntityRef, 0); }
		public TerminalNode CharRef() { return getToken(EncodeParser.CharRef, 0); }
		public ReferenceContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_reference; }
		@Override
		public void enterRule(ParseTreeListener listener) {
			if ( listener instanceof EncodeParserListener ) ((EncodeParserListener)listener).enterReference(this);
		}
		@Override
		public void exitRule(ParseTreeListener listener) {
			if ( listener instanceof EncodeParserListener ) ((EncodeParserListener)listener).exitReference(this);
		}
	}

	public final ReferenceContext reference() throws RecognitionException {
		ReferenceContext _localctx = new ReferenceContext(_ctx, getState());
		enterRule(_localctx, 12, RULE_reference);
		try {
			setState(77);
			switch (_input.LA(1)) {
			case EntityRef:
				enterOuterAlt(_localctx, 1);
				{
				setState(73);
				((ReferenceContext)_localctx).EntityRef = match(EntityRef);
				((ReferenceContext)_localctx).node =  new TextNode((((ReferenceContext)_localctx).EntityRef!=null?((ReferenceContext)_localctx).EntityRef.getText():null));
				}
				break;
			case CharRef:
				enterOuterAlt(_localctx, 2);
				{
				setState(75);
				((ReferenceContext)_localctx).CharRef = match(CharRef);
				((ReferenceContext)_localctx).node =  new TextNode((((ReferenceContext)_localctx).CharRef!=null?((ReferenceContext)_localctx).CharRef.getText():null));
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	public static class AttributesContext extends ParserRuleContext {
		public AttributeList list =  new AttributeList();
		public List<AttributeContext> attribute() {
			return getRuleContexts(AttributeContext.class);
		}
		public AttributeContext attribute(int i) {
			return getRuleContext(AttributeContext.class,i);
		}
		public AttributesContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_attributes; }
		@Override
		public void enterRule(ParseTreeListener listener) {
			if ( listener instanceof EncodeParserListener ) ((EncodeParserListener)listener).enterAttributes(this);
		}
		@Override
		public void exitRule(ParseTreeListener listener) {
			if ( listener instanceof EncodeParserListener ) ((EncodeParserListener)listener).exitAttributes(this);
		}
	}

	public final AttributesContext attributes() throws RecognitionException {
		AttributesContext _localctx = new AttributesContext(_ctx, getState());
		enterRule(_localctx, 14, RULE_attributes);
		int _la;
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(82);
			_errHandler.sync(this);
			_la = _input.LA(1);
			while (_la==Name) {
				{
				{
				setState(79);
				attribute();
				}
				}
				setState(84);
				_errHandler.sync(this);
				_la = _input.LA(1);
			}
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	public static class AttributeContext extends ParserRuleContext {
		public Attribute attrNode;
		public Token Name;
		public Token STRING;
		public TerminalNode Name() { return getToken(EncodeParser.Name, 0); }
		public TerminalNode STRING() { return getToken(EncodeParser.STRING, 0); }
		public AttributeContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_attribute; }
		@Override
		public void enterRule(ParseTreeListener listener) {
			if ( listener instanceof EncodeParserListener ) ((EncodeParserListener)listener).enterAttribute(this);
		}
		@Override
		public void exitRule(ParseTreeListener listener) {
			if ( listener instanceof EncodeParserListener ) ((EncodeParserListener)listener).exitAttribute(this);
		}
	}

	public final AttributeContext attribute() throws RecognitionException {
		AttributeContext _localctx = new AttributeContext(_ctx, getState());
		enterRule(_localctx, 16, RULE_attribute);
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(85);
			((AttributeContext)_localctx).Name = match(Name);
			setState(86);
			match(EQUALS);
			setState(87);
			((AttributeContext)_localctx).STRING = match(STRING);

			        String value = (((AttributeContext)_localctx).STRING!=null?((AttributeContext)_localctx).STRING.getText():null);
			        value = value.substring(1, value.length() - 1);
			        ((AttributesContext)getInvokingContext(7)).list.add(new Attribute((((AttributeContext)_localctx).Name!=null?((AttributeContext)_localctx).Name.getText():null), value));
			    
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	public static class ChardataContext extends ParserRuleContext {
		public TextNode node;
		public List<TerminalNode> TEXT() { return getTokens(EncodeParser.TEXT); }
		public TerminalNode TEXT(int i) {
			return getToken(EncodeParser.TEXT, i);
		}
		public List<TerminalNode> SEA_WS() { return getTokens(EncodeParser.SEA_WS); }
		public TerminalNode SEA_WS(int i) {
			return getToken(EncodeParser.SEA_WS, i);
		}
		public ChardataContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_chardata; }
		@Override
		public void enterRule(ParseTreeListener listener) {
			if ( listener instanceof EncodeParserListener ) ((EncodeParserListener)listener).enterChardata(this);
		}
		@Override
		public void exitRule(ParseTreeListener listener) {
			if ( listener instanceof EncodeParserListener ) ((EncodeParserListener)listener).exitChardata(this);
		}
	}

	public final ChardataContext chardata() throws RecognitionException {
		ChardataContext _localctx = new ChardataContext(_ctx, getState());
		enterRule(_localctx, 18, RULE_chardata);
		int _la;
		try {
			int _alt;
			enterOuterAlt(_localctx, 1);
			{
			setState(91); 
			_errHandler.sync(this);
			_alt = 1;
			do {
				switch (_alt) {
				case 1:
					{
					{
					setState(90);
					_la = _input.LA(1);
					if ( !(_la==SEA_WS || _la==TEXT) ) {
					_errHandler.recoverInline(this);
					} else {
						consume();
					}
					}
					}
					break;
				default:
					throw new NoViableAltException(this);
				}
				setState(93); 
				_errHandler.sync(this);
				_alt = getInterpreter().adaptivePredict(_input,5,_ctx);
			} while ( _alt!=2 && _alt!=org.antlr.v4.runtime.atn.ATN.INVALID_ALT_NUMBER );
			}
			_ctx.stop = _input.LT(-1);

			        ((ChardataContext)_localctx).node =  new TextNode(_localctx.getText());
			    
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	public static class MiscListContext extends ParserRuleContext {
		public NodeList nodes =  new NodeList();;
		public List<MiscContext> misc() {
			return getRuleContexts(MiscContext.class);
		}
		public MiscContext misc(int i) {
			return getRuleContext(MiscContext.class,i);
		}
		public MiscListContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_miscList; }
		@Override
		public void enterRule(ParseTreeListener listener) {
			if ( listener instanceof EncodeParserListener ) ((EncodeParserListener)listener).enterMiscList(this);
		}
		@Override
		public void exitRule(ParseTreeListener listener) {
			if ( listener instanceof EncodeParserListener ) ((EncodeParserListener)listener).exitMiscList(this);
		}
	}

	public final MiscListContext miscList() throws RecognitionException {
		MiscListContext _localctx = new MiscListContext(_ctx, getState());
		enterRule(_localctx, 20, RULE_miscList);
		int _la;
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(98);
			_errHandler.sync(this);
			_la = _input.LA(1);
			while ((((_la) & ~0x3f) == 0 && ((1L << _la) & ((1L << COMMENT) | (1L << DTD) | (1L << SEA_WS))) != 0)) {
				{
				{
				setState(95);
				misc();
				}
				}
				setState(100);
				_errHandler.sync(this);
				_la = _input.LA(1);
			}
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	public static class MiscContext extends ParserRuleContext {
		public Token DTD;
		public Token SEA_WS;
		public Token COMMENT;
		public TerminalNode DTD() { return getToken(EncodeParser.DTD, 0); }
		public TerminalNode SEA_WS() { return getToken(EncodeParser.SEA_WS, 0); }
		public TerminalNode COMMENT() { return getToken(EncodeParser.COMMENT, 0); }
		public MiscContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_misc; }
		@Override
		public void enterRule(ParseTreeListener listener) {
			if ( listener instanceof EncodeParserListener ) ((EncodeParserListener)listener).enterMisc(this);
		}
		@Override
		public void exitRule(ParseTreeListener listener) {
			if ( listener instanceof EncodeParserListener ) ((EncodeParserListener)listener).exitMisc(this);
		}
	}

	public final MiscContext misc() throws RecognitionException {
		MiscContext _localctx = new MiscContext(_ctx, getState());
		enterRule(_localctx, 22, RULE_misc);
		try {
			setState(107);
			switch (_input.LA(1)) {
			case DTD:
				enterOuterAlt(_localctx, 1);
				{
				setState(101);
				((MiscContext)_localctx).DTD = match(DTD);
				((MiscListContext)getInvokingContext(10)).nodes.add(new MetaDataNode((((MiscContext)_localctx).DTD!=null?((MiscContext)_localctx).DTD.getText():null)));
				}
				break;
			case SEA_WS:
				enterOuterAlt(_localctx, 2);
				{
				setState(103);
				((MiscContext)_localctx).SEA_WS = match(SEA_WS);
				((MiscListContext)getInvokingContext(10)).nodes.add(new TextNode((((MiscContext)_localctx).SEA_WS!=null?((MiscContext)_localctx).SEA_WS.getText():null)));
				}
				break;
			case COMMENT:
				enterOuterAlt(_localctx, 3);
				{
				setState(105);
				((MiscContext)_localctx).COMMENT = match(COMMENT);
				((MiscListContext)getInvokingContext(10)).nodes.add(new CommentNode((((MiscContext)_localctx).COMMENT!=null?((MiscContext)_localctx).COMMENT.getText():null)));
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	public static final String _serializedATN =
		"\3\u0430\ud6d1\u8206\uad2d\u4417\uaef1\u8d80\uaadd\3\22p\4\2\t\2\4\3\t"+
		"\3\4\4\t\4\4\5\t\5\4\6\t\6\4\7\t\7\4\b\t\b\4\t\t\t\4\n\t\n\4\13\t\13\4"+
		"\f\t\f\4\r\t\r\3\2\3\2\3\2\3\2\3\2\3\3\7\3!\n\3\f\3\16\3$\13\3\3\4\3\4"+
		"\3\4\3\4\3\4\3\4\3\4\3\4\3\4\3\4\3\4\5\4\61\n\4\3\5\3\5\3\5\3\5\3\5\3"+
		"\5\3\5\3\5\3\5\3\5\3\5\5\5>\n\5\3\6\3\6\3\6\3\6\3\6\3\6\3\7\3\7\3\7\3"+
		"\7\3\7\3\7\3\b\3\b\3\b\3\b\5\bP\n\b\3\t\7\tS\n\t\f\t\16\tV\13\t\3\n\3"+
		"\n\3\n\3\n\3\n\3\13\6\13^\n\13\r\13\16\13_\3\f\7\fc\n\f\f\f\16\ff\13\f"+
		"\3\r\3\r\3\r\3\r\3\r\3\r\5\rn\n\r\3\r\2\2\16\2\4\6\b\n\f\16\20\22\24\26"+
		"\30\2\3\4\2\7\7\t\tn\2\32\3\2\2\2\4\"\3\2\2\2\6\60\3\2\2\2\b=\3\2\2\2"+
		"\n?\3\2\2\2\fE\3\2\2\2\16O\3\2\2\2\20T\3\2\2\2\22W\3\2\2\2\24]\3\2\2\2"+
		"\26d\3\2\2\2\30m\3\2\2\2\32\33\5\26\f\2\33\34\5\b\5\2\34\35\5\26\f\2\35"+
		"\36\b\2\1\2\36\3\3\2\2\2\37!\5\6\4\2 \37\3\2\2\2!$\3\2\2\2\" \3\2\2\2"+
		"\"#\3\2\2\2#\5\3\2\2\2$\"\3\2\2\2%&\5\24\13\2&\'\b\4\1\2\'\61\3\2\2\2"+
		"()\5\b\5\2)*\b\4\1\2*\61\3\2\2\2+,\5\16\b\2,-\b\4\1\2-\61\3\2\2\2./\7"+
		"\3\2\2/\61\b\4\1\2\60%\3\2\2\2\60(\3\2\2\2\60+\3\2\2\2\60.\3\2\2\2\61"+
		"\7\3\2\2\2\62\63\5\n\6\2\63\64\5\4\3\2\64\65\5\f\7\2\65\66\b\5\1\2\66"+
		">\3\2\2\2\678\7\b\2\289\7\20\2\29:\5\20\t\2:;\7\f\2\2;<\b\5\1\2<>\3\2"+
		"\2\2=\62\3\2\2\2=\67\3\2\2\2>\t\3\2\2\2?@\7\b\2\2@A\7\20\2\2AB\5\20\t"+
		"\2BC\7\13\2\2CD\b\6\1\2D\13\3\2\2\2EF\7\b\2\2FG\7\r\2\2GH\7\20\2\2HI\7"+
		"\13\2\2IJ\b\7\1\2J\r\3\2\2\2KL\7\5\2\2LP\b\b\1\2MN\7\6\2\2NP\b\b\1\2O"+
		"K\3\2\2\2OM\3\2\2\2P\17\3\2\2\2QS\5\22\n\2RQ\3\2\2\2SV\3\2\2\2TR\3\2\2"+
		"\2TU\3\2\2\2U\21\3\2\2\2VT\3\2\2\2WX\7\20\2\2XY\7\16\2\2YZ\7\17\2\2Z["+
		"\b\n\1\2[\23\3\2\2\2\\^\t\2\2\2]\\\3\2\2\2^_\3\2\2\2_]\3\2\2\2_`\3\2\2"+
		"\2`\25\3\2\2\2ac\5\30\r\2ba\3\2\2\2cf\3\2\2\2db\3\2\2\2de\3\2\2\2e\27"+
		"\3\2\2\2fd\3\2\2\2gh\7\4\2\2hn\b\r\1\2ij\7\7\2\2jn\b\r\1\2kl\7\3\2\2l"+
		"n\b\r\1\2mg\3\2\2\2mi\3\2\2\2mk\3\2\2\2n\31\3\2\2\2\n\"\60=OT_dm";
	public static final ATN _ATN =
		new ATNDeserializer().deserialize(_serializedATN.toCharArray());
	static {
		_decisionToDFA = new DFA[_ATN.getNumberOfDecisions()];
		for (int i = 0; i < _ATN.getNumberOfDecisions(); i++) {
			_decisionToDFA[i] = new DFA(_ATN.getDecisionState(i), i);
		}
	}
}