// Generated from D:\project-local\trunk\nerve\DocumentNavigator/src/ca/sharcnet/nerve/docnav/antlr/EncodeParser.g4 by ANTLR 4.7.1

    package ca.sharcnet.nerve.docnav.generated;
    import ca.sharcnet.nerve.docnav.dom.*;
    import ca.sharcnet.nerve.docnav.antlr.*;

import org.antlr.v4.runtime.tree.ParseTreeListener;

/**
 * This interface defines a complete listener for a parse tree produced by
 * {@link EncodeParser}.
 */
public interface EncodeParserListener extends ParseTreeListener {
	/**
	 * Enter a parse tree produced by {@link EncodeParser#start}.
	 * @param ctx the parse tree
	 */
	void enterStart(EncodeParser.StartContext ctx);
	/**
	 * Exit a parse tree produced by {@link EncodeParser#start}.
	 * @param ctx the parse tree
	 */
	void exitStart(EncodeParser.StartContext ctx);
	/**
	 * Enter a parse tree produced by {@link EncodeParser#contents}.
	 * @param ctx the parse tree
	 */
	void enterContents(EncodeParser.ContentsContext ctx);
	/**
	 * Exit a parse tree produced by {@link EncodeParser#contents}.
	 * @param ctx the parse tree
	 */
	void exitContents(EncodeParser.ContentsContext ctx);
	/**
	 * Enter a parse tree produced by {@link EncodeParser#content}.
	 * @param ctx the parse tree
	 */
	void enterContent(EncodeParser.ContentContext ctx);
	/**
	 * Exit a parse tree produced by {@link EncodeParser#content}.
	 * @param ctx the parse tree
	 */
	void exitContent(EncodeParser.ContentContext ctx);
	/**
	 * Enter a parse tree produced by {@link EncodeParser#element}.
	 * @param ctx the parse tree
	 */
	void enterElement(EncodeParser.ElementContext ctx);
	/**
	 * Exit a parse tree produced by {@link EncodeParser#element}.
	 * @param ctx the parse tree
	 */
	void exitElement(EncodeParser.ElementContext ctx);
	/**
	 * Enter a parse tree produced by {@link EncodeParser#startTag}.
	 * @param ctx the parse tree
	 */
	void enterStartTag(EncodeParser.StartTagContext ctx);
	/**
	 * Exit a parse tree produced by {@link EncodeParser#startTag}.
	 * @param ctx the parse tree
	 */
	void exitStartTag(EncodeParser.StartTagContext ctx);
	/**
	 * Enter a parse tree produced by {@link EncodeParser#endTag}.
	 * @param ctx the parse tree
	 */
	void enterEndTag(EncodeParser.EndTagContext ctx);
	/**
	 * Exit a parse tree produced by {@link EncodeParser#endTag}.
	 * @param ctx the parse tree
	 */
	void exitEndTag(EncodeParser.EndTagContext ctx);
	/**
	 * Enter a parse tree produced by {@link EncodeParser#reference}.
	 * @param ctx the parse tree
	 */
	void enterReference(EncodeParser.ReferenceContext ctx);
	/**
	 * Exit a parse tree produced by {@link EncodeParser#reference}.
	 * @param ctx the parse tree
	 */
	void exitReference(EncodeParser.ReferenceContext ctx);
	/**
	 * Enter a parse tree produced by {@link EncodeParser#attributes}.
	 * @param ctx the parse tree
	 */
	void enterAttributes(EncodeParser.AttributesContext ctx);
	/**
	 * Exit a parse tree produced by {@link EncodeParser#attributes}.
	 * @param ctx the parse tree
	 */
	void exitAttributes(EncodeParser.AttributesContext ctx);
	/**
	 * Enter a parse tree produced by {@link EncodeParser#attribute}.
	 * @param ctx the parse tree
	 */
	void enterAttribute(EncodeParser.AttributeContext ctx);
	/**
	 * Exit a parse tree produced by {@link EncodeParser#attribute}.
	 * @param ctx the parse tree
	 */
	void exitAttribute(EncodeParser.AttributeContext ctx);
	/**
	 * Enter a parse tree produced by {@link EncodeParser#chardata}.
	 * @param ctx the parse tree
	 */
	void enterChardata(EncodeParser.ChardataContext ctx);
	/**
	 * Exit a parse tree produced by {@link EncodeParser#chardata}.
	 * @param ctx the parse tree
	 */
	void exitChardata(EncodeParser.ChardataContext ctx);
	/**
	 * Enter a parse tree produced by {@link EncodeParser#miscList}.
	 * @param ctx the parse tree
	 */
	void enterMiscList(EncodeParser.MiscListContext ctx);
	/**
	 * Exit a parse tree produced by {@link EncodeParser#miscList}.
	 * @param ctx the parse tree
	 */
	void exitMiscList(EncodeParser.MiscListContext ctx);
	/**
	 * Enter a parse tree produced by {@link EncodeParser#misc}.
	 * @param ctx the parse tree
	 */
	void enterMisc(EncodeParser.MiscContext ctx);
	/**
	 * Exit a parse tree produced by {@link EncodeParser#misc}.
	 * @param ctx the parse tree
	 */
	void exitMisc(EncodeParser.MiscContext ctx);
	/**
	 * Enter a parse tree produced by {@link EncodeParser#instr}.
	 * @param ctx the parse tree
	 */
	void enterInstr(EncodeParser.InstrContext ctx);
	/**
	 * Exit a parse tree produced by {@link EncodeParser#instr}.
	 * @param ctx the parse tree
	 */
	void exitInstr(EncodeParser.InstrContext ctx);
}