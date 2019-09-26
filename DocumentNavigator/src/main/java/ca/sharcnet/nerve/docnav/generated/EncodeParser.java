// Generated from D:\project-local\trunk\nerve\DocumentNavigator/src/ca/sharcnet/nerve/docnav/antlr/EncodeParser.g4 by ANTLR 4.7.1

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
	static { RuntimeMetaData.checkVersion("4.7.1", RuntimeMetaData.VERSION); }

	protected static final DFA[] _decisionToDFA;
	protected static final PredictionContextCache _sharedContextCache =
		new PredictionContextCache();
	public static final int
		COMMENT=1, DOCTYPE=2, EntityRef=3, CharRef=4, SEA_WS=5, INSTR_OPEN=6, 
		OPEN=7, TEXT=8, CATCHALL1=9, CLOSE=10, INSTR_CLOSE=11, SLASH_CLOSE=12, 
		SLASH=13, EQUALS=14, STRING=15, Name=16, S=17, CATCHALL2=18;
	public static final int
		RULE_start = 0, RULE_contents = 1, RULE_content = 2, RULE_element = 3, 
		RULE_startTag = 4, RULE_endTag = 5, RULE_reference = 6, RULE_attributes = 7, 
		RULE_attribute = 8, RULE_chardata = 9, RULE_miscList = 10, RULE_misc = 11, 
		RULE_instr = 12;
	public static final String[] ruleNames = {
		"start", "contents", "content", "element", "startTag", "endTag", "reference", 
		"attributes", "attribute", "chardata", "miscList", "misc", "instr"
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
		public ContentsContext contents;
		public MiscListContext m2;
		public ContentsContext contents() {
			return getRuleContext(ContentsContext.class,0);
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
			setState(26);
			((StartContext)_localctx).m1 = miscList();
			setState(27);
			((StartContext)_localctx).contents = contents();
			setState(28);
			((StartContext)_localctx).m2 = miscList();

			            this.nodes.add(((StartContext)_localctx).m1.nodes);
			            this.nodes.add(((StartContext)_localctx).contents.nodelist);
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
		public NodeList nodelist = new NodeList();;
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
			setState(34);
			_errHandler.sync(this);
			_alt = getInterpreter().adaptivePredict(_input,0,_ctx);
			while ( _alt!=2 && _alt!=org.antlr.v4.runtime.atn.ATN.INVALID_ALT_NUMBER ) {
				if ( _alt==1 ) {
					{
					{
					setState(31);
					content();
					}
					} 
				}
				setState(36);
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
		public NodeList nodelist = new NodeList();;
		public ChardataContext chardata;
		public InstrContext instr;
		public ElementContext element;
		public ReferenceContext reference;
		public Token COMMENT;
		public ChardataContext chardata() {
			return getRuleContext(ChardataContext.class,0);
		}
		public InstrContext instr() {
			return getRuleContext(InstrContext.class,0);
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
			setState(51);
			_errHandler.sync(this);
			switch (_input.LA(1)) {
			case SEA_WS:
			case TEXT:
				enterOuterAlt(_localctx, 1);
				{
				setState(37);
				((ContentContext)_localctx).chardata = chardata();
				((ContentsContext)getInvokingContext(1)).nodelist.add(((ContentContext)_localctx).chardata.node);
				}
				break;
			case INSTR_OPEN:
				enterOuterAlt(_localctx, 2);
				{
				setState(40);
				((ContentContext)_localctx).instr = instr();
				((ContentsContext)getInvokingContext(1)).nodelist.add(((ContentContext)_localctx).instr.node);
				}
				break;
			case OPEN:
				enterOuterAlt(_localctx, 3);
				{
				setState(43);
				((ContentContext)_localctx).element = element();
				((ContentsContext)getInvokingContext(1)).nodelist.add(((ContentContext)_localctx).element.node);
				}
				break;
			case EntityRef:
			case CharRef:
				enterOuterAlt(_localctx, 4);
				{
				setState(46);
				((ContentContext)_localctx).reference = reference();
				((ContentsContext)getInvokingContext(1)).nodelist.add(((ContentContext)_localctx).reference.node);
				}
				break;
			case COMMENT:
				enterOuterAlt(_localctx, 5);
				{
				setState(49);
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
			setState(64);
			_errHandler.sync(this);
			switch ( getInterpreter().adaptivePredict(_input,2,_ctx) ) {
			case 1:
				enterOuterAlt(_localctx, 1);
				{
				setState(53);
				((ElementContext)_localctx).startTag = startTag();
				setState(54);
				((ElementContext)_localctx).contents = contents();
				setState(55);
				endTag();
				((ElementContext)_localctx).node =  new ElementNode(((ElementContext)_localctx).startTag.name, ((ElementContext)_localctx).startTag.list, ((ElementContext)_localctx).contents.nodelist);
				}
				break;
			case 2:
				enterOuterAlt(_localctx, 2);
				{
				setState(58);
				match(OPEN);
				setState(59);
				((ElementContext)_localctx).Name = match(Name);
				setState(60);
				((ElementContext)_localctx).attributes = attributes();
				setState(61);
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
			setState(66);
			match(OPEN);
			setState(67);
			((StartTagContext)_localctx).Name = match(Name);
			setState(68);
			((StartTagContext)_localctx).attributes = attributes();
			setState(69);
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
			setState(72);
			match(OPEN);
			setState(73);
			match(SLASH);
			setState(74);
			((EndTagContext)_localctx).Name = match(Name);
			setState(75);
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
			setState(82);
			_errHandler.sync(this);
			switch (_input.LA(1)) {
			case EntityRef:
				enterOuterAlt(_localctx, 1);
				{
				setState(78);
				((ReferenceContext)_localctx).EntityRef = match(EntityRef);
				((ReferenceContext)_localctx).node =  new TextNode((((ReferenceContext)_localctx).EntityRef!=null?((ReferenceContext)_localctx).EntityRef.getText():null));
				}
				break;
			case CharRef:
				enterOuterAlt(_localctx, 2);
				{
				setState(80);
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
		public AttributeList list = new AttributeList();
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
			setState(87);
			_errHandler.sync(this);
			_la = _input.LA(1);
			while (_la==Name) {
				{
				{
				setState(84);
				attribute();
				}
				}
				setState(89);
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
			setState(90);
			((AttributeContext)_localctx).Name = match(Name);
			setState(91);
			match(EQUALS);
			setState(92);
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
			setState(96); 
			_errHandler.sync(this);
			_alt = 1;
			do {
				switch (_alt) {
				case 1:
					{
					{
					setState(95);
					_la = _input.LA(1);
					if ( !(_la==SEA_WS || _la==TEXT) ) {
					_errHandler.recoverInline(this);
					}
					else {
						if ( _input.LA(1)==Token.EOF ) matchedEOF = true;
						_errHandler.reportMatch(this);
						consume();
					}
					}
					}
					break;
				default:
					throw new NoViableAltException(this);
				}
				setState(98); 
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
		public NodeList nodes = new NodeList();;
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
		try {
			int _alt;
			enterOuterAlt(_localctx, 1);
			{
			setState(103);
			_errHandler.sync(this);
			_alt = getInterpreter().adaptivePredict(_input,6,_ctx);
			while ( _alt!=2 && _alt!=org.antlr.v4.runtime.atn.ATN.INVALID_ALT_NUMBER ) {
				if ( _alt==1 ) {
					{
					{
					setState(100);
					misc();
					}
					} 
				}
				setState(105);
				_errHandler.sync(this);
				_alt = getInterpreter().adaptivePredict(_input,6,_ctx);
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
		public InstrContext instr;
		public Token DOCTYPE;
		public Token SEA_WS;
		public Token COMMENT;
		public InstrContext instr() {
			return getRuleContext(InstrContext.class,0);
		}
		public TerminalNode DOCTYPE() { return getToken(EncodeParser.DOCTYPE, 0); }
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
			setState(115);
			_errHandler.sync(this);
			switch (_input.LA(1)) {
			case INSTR_OPEN:
				enterOuterAlt(_localctx, 1);
				{
				setState(106);
				((MiscContext)_localctx).instr = instr();
				((MiscListContext)getInvokingContext(10)).nodes.add(((MiscContext)_localctx).instr.node);
				}
				break;
			case DOCTYPE:
				enterOuterAlt(_localctx, 2);
				{
				setState(109);
				((MiscContext)_localctx).DOCTYPE = match(DOCTYPE);
				((MiscListContext)getInvokingContext(10)).nodes.add(new DoctypeNode((((MiscContext)_localctx).DOCTYPE!=null?((MiscContext)_localctx).DOCTYPE.getText():null)));
				}
				break;
			case SEA_WS:
				enterOuterAlt(_localctx, 3);
				{
				setState(111);
				((MiscContext)_localctx).SEA_WS = match(SEA_WS);
				((MiscListContext)getInvokingContext(10)).nodes.add(new TextNode((((MiscContext)_localctx).SEA_WS!=null?((MiscContext)_localctx).SEA_WS.getText():null)));
				}
				break;
			case COMMENT:
				enterOuterAlt(_localctx, 4);
				{
				setState(113);
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

	public static class InstrContext extends ParserRuleContext {
		public InstructionNode node;
		public Token Name;
		public AttributesContext attributes;
		public TerminalNode INSTR_OPEN() { return getToken(EncodeParser.INSTR_OPEN, 0); }
		public TerminalNode Name() { return getToken(EncodeParser.Name, 0); }
		public AttributesContext attributes() {
			return getRuleContext(AttributesContext.class,0);
		}
		public TerminalNode INSTR_CLOSE() { return getToken(EncodeParser.INSTR_CLOSE, 0); }
		public InstrContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_instr; }
		@Override
		public void enterRule(ParseTreeListener listener) {
			if ( listener instanceof EncodeParserListener ) ((EncodeParserListener)listener).enterInstr(this);
		}
		@Override
		public void exitRule(ParseTreeListener listener) {
			if ( listener instanceof EncodeParserListener ) ((EncodeParserListener)listener).exitInstr(this);
		}
	}

	public final InstrContext instr() throws RecognitionException {
		InstrContext _localctx = new InstrContext(_ctx, getState());
		enterRule(_localctx, 24, RULE_instr);
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(117);
			match(INSTR_OPEN);
			setState(118);
			((InstrContext)_localctx).Name = match(Name);
			setState(119);
			((InstrContext)_localctx).attributes = attributes();
			setState(120);
			match(INSTR_CLOSE);
			((InstrContext)_localctx).node =  new InstructionNode((((InstrContext)_localctx).Name!=null?((InstrContext)_localctx).Name.getText():null), ((InstrContext)_localctx).attributes.list);
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
		"\3\u608b\ua72a\u8133\ub9ed\u417c\u3be7\u7786\u5964\3\24~\4\2\t\2\4\3\t"+
		"\3\4\4\t\4\4\5\t\5\4\6\t\6\4\7\t\7\4\b\t\b\4\t\t\t\4\n\t\n\4\13\t\13\4"+
		"\f\t\f\4\r\t\r\4\16\t\16\3\2\3\2\3\2\3\2\3\2\3\3\7\3#\n\3\f\3\16\3&\13"+
		"\3\3\4\3\4\3\4\3\4\3\4\3\4\3\4\3\4\3\4\3\4\3\4\3\4\3\4\3\4\5\4\66\n\4"+
		"\3\5\3\5\3\5\3\5\3\5\3\5\3\5\3\5\3\5\3\5\3\5\5\5C\n\5\3\6\3\6\3\6\3\6"+
		"\3\6\3\6\3\7\3\7\3\7\3\7\3\7\3\7\3\b\3\b\3\b\3\b\5\bU\n\b\3\t\7\tX\n\t"+
		"\f\t\16\t[\13\t\3\n\3\n\3\n\3\n\3\n\3\13\6\13c\n\13\r\13\16\13d\3\f\7"+
		"\fh\n\f\f\f\16\fk\13\f\3\r\3\r\3\r\3\r\3\r\3\r\3\r\3\r\3\r\5\rv\n\r\3"+
		"\16\3\16\3\16\3\16\3\16\3\16\3\16\2\2\17\2\4\6\b\n\f\16\20\22\24\26\30"+
		"\32\2\3\4\2\7\7\n\n\2}\2\34\3\2\2\2\4$\3\2\2\2\6\65\3\2\2\2\bB\3\2\2\2"+
		"\nD\3\2\2\2\fJ\3\2\2\2\16T\3\2\2\2\20Y\3\2\2\2\22\\\3\2\2\2\24b\3\2\2"+
		"\2\26i\3\2\2\2\30u\3\2\2\2\32w\3\2\2\2\34\35\5\26\f\2\35\36\5\4\3\2\36"+
		"\37\5\26\f\2\37 \b\2\1\2 \3\3\2\2\2!#\5\6\4\2\"!\3\2\2\2#&\3\2\2\2$\""+
		"\3\2\2\2$%\3\2\2\2%\5\3\2\2\2&$\3\2\2\2\'(\5\24\13\2()\b\4\1\2)\66\3\2"+
		"\2\2*+\5\32\16\2+,\b\4\1\2,\66\3\2\2\2-.\5\b\5\2./\b\4\1\2/\66\3\2\2\2"+
		"\60\61\5\16\b\2\61\62\b\4\1\2\62\66\3\2\2\2\63\64\7\3\2\2\64\66\b\4\1"+
		"\2\65\'\3\2\2\2\65*\3\2\2\2\65-\3\2\2\2\65\60\3\2\2\2\65\63\3\2\2\2\66"+
		"\7\3\2\2\2\678\5\n\6\289\5\4\3\29:\5\f\7\2:;\b\5\1\2;C\3\2\2\2<=\7\t\2"+
		"\2=>\7\22\2\2>?\5\20\t\2?@\7\16\2\2@A\b\5\1\2AC\3\2\2\2B\67\3\2\2\2B<"+
		"\3\2\2\2C\t\3\2\2\2DE\7\t\2\2EF\7\22\2\2FG\5\20\t\2GH\7\f\2\2HI\b\6\1"+
		"\2I\13\3\2\2\2JK\7\t\2\2KL\7\17\2\2LM\7\22\2\2MN\7\f\2\2NO\b\7\1\2O\r"+
		"\3\2\2\2PQ\7\5\2\2QU\b\b\1\2RS\7\6\2\2SU\b\b\1\2TP\3\2\2\2TR\3\2\2\2U"+
		"\17\3\2\2\2VX\5\22\n\2WV\3\2\2\2X[\3\2\2\2YW\3\2\2\2YZ\3\2\2\2Z\21\3\2"+
		"\2\2[Y\3\2\2\2\\]\7\22\2\2]^\7\20\2\2^_\7\21\2\2_`\b\n\1\2`\23\3\2\2\2"+
		"ac\t\2\2\2ba\3\2\2\2cd\3\2\2\2db\3\2\2\2de\3\2\2\2e\25\3\2\2\2fh\5\30"+
		"\r\2gf\3\2\2\2hk\3\2\2\2ig\3\2\2\2ij\3\2\2\2j\27\3\2\2\2ki\3\2\2\2lm\5"+
		"\32\16\2mn\b\r\1\2nv\3\2\2\2op\7\4\2\2pv\b\r\1\2qr\7\7\2\2rv\b\r\1\2s"+
		"t\7\3\2\2tv\b\r\1\2ul\3\2\2\2uo\3\2\2\2uq\3\2\2\2us\3\2\2\2v\31\3\2\2"+
		"\2wx\7\b\2\2xy\7\22\2\2yz\5\20\t\2z{\7\r\2\2{|\b\16\1\2|\33\3\2\2\2\n"+
		"$\65BTYdiu";
	public static final ATN _ATN =
		new ATNDeserializer().deserialize(_serializedATN.toCharArray());
	static {
		_decisionToDFA = new DFA[_ATN.getNumberOfDecisions()];
		for (int i = 0; i < _ATN.getNumberOfDecisions(); i++) {
			_decisionToDFA[i] = new DFA(_ATN.getDecisionState(i), i);
		}
	}
}