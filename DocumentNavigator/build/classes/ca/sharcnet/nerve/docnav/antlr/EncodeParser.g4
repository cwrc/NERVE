parser grammar EncodeParser;
@header {
    package ca.sharcnet.nerve.docnav.generated;
    import ca.sharcnet.nerve.docnav.dom.*;
    import ca.sharcnet.nerve.docnav.antlr.*;
}

options {
    tokenVocab = EncodeLexer;
    superClass = AbstractParser;
}

start
    :   m1=miscList contents m2=miscList{
            this.nodes.add($m1.nodes);
            this.nodes.add($contents.nodelist);
            this.nodes.add($m2.nodes);
        }
    ;

contents returns [NodeList nodelist = new NodeList();]
    : content*
    ;

content returns [NodeList nodelist = new NodeList();]
    : chardata   {$contents::nodelist.add($chardata.node);}
    | instr      {$contents::nodelist.add($instr.node);}
    | element    {$contents::nodelist.add($element.node);}
    | reference  {$contents::nodelist.add($reference.node);}
    | COMMENT    {$contents::nodelist.add(new CommentNode($COMMENT.text));}
    ;

element returns [ElementNode node]
    :   startTag contents endTag    {$node = new ElementNode($startTag.name, $startTag.list, $contents.nodelist);}
    |   '<' Name attributes '/>'    {$node = new ElementNode($Name.text, $attributes.list, new NodeList());}
    ;

startTag returns [AttributeList list, String name]
    : '<' Name attributes '>' {
        pushTag($Name.text, $Name);
        $name = $Name.text;
        $list = $attributes.list;
    }
    ;

endTag returns [String name]
    : '<' '/' Name '>' {
        popTag($Name.text, $Name);
        $name = $Name.text;
    }
    ;

reference returns [TextNode node]
    : EntityRef   {$node = new TextNode($EntityRef.text);}
    | CharRef     {$node = new TextNode($CharRef.text);}
    ;

attributes returns [AttributeList list = new AttributeList()]
    : attribute*
    ;

attribute locals [Attribute attrNode]
    :   Name '=' STRING{
        String value = $STRING.text;
        value = value.substring(1, value.length() - 1);
        $attributes::list.add(new Attribute($Name.text, value));
    }
    ;

chardata returns [TextNode node]
    @after{
        $node = new TextNode(_localctx.getText());
    }
    : (TEXT | SEA_WS )+
    ;

miscList returns [NodeList nodes = new NodeList();]
    : misc*
    ;

misc
    : instr     {$miscList::nodes.add($instr.node);}
    | DOCTYPE   {$miscList::nodes.add(new DoctypeNode($DOCTYPE.text));}
    | SEA_WS    {$miscList::nodes.add(new TextNode($SEA_WS.text));}
    | COMMENT   {$miscList::nodes.add(new CommentNode($COMMENT.text));}
    ;

instr returns [InstructionNode node]
    :   INSTR_OPEN Name attributes INSTR_CLOSE {$node = new InstructionNode($Name.text, $attributes.list);}
    ;
