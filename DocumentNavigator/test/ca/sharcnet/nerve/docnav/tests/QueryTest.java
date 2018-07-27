package ca.sharcnet.nerve.docnav.tests;

import ca.frar.utility.console.Console;
import ca.sharcnet.nerve.HasStreams;
import ca.sharcnet.nerve.docnav.DocumentLoader;
import ca.sharcnet.nerve.docnav.dom.Document;
import ca.sharcnet.nerve.docnav.dom.ElementNode;
import ca.sharcnet.nerve.docnav.dom.Node;
import ca.sharcnet.nerve.docnav.dom.NodeType;
import ca.sharcnet.nerve.docnav.query.Query;
import java.io.IOException;
import java.io.InputStream;
import static org.junit.Assert.*;
import org.junit.Test;

/**
 *
 * @author edward
 */
public class QueryTest implements HasStreams {

    @Override
    public InputStream getResourceStream(String path) {
        return this.getClass().getResourceAsStream("/resources/" + path);
    }

    @Test
    public void test_empty() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("deep.xml"));
        assertEquals(0, doc.query("").size());
    }

    @Test
    public void test_all() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("deep.xml"));
        assertEquals("[xml, @TEXT, root, @TEXT, div, @TEXT, a, b, c, @TEXT, @TEXT]", doc.query().toString());
    }

    @Test
    public void testAllRoot() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("root.xml"));
        Query query = doc.query("*");
        assertEquals(1, query.size());
        assertEquals("root", query.get(0).name());
    }

    @Test
    public void testAllShallow() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("shallow.xml"));
        Query query = doc.query("*");
        assertEquals(2, query.size());
        assertEquals("root", query.get(0).name());
        assertEquals("div", query.get(1).name());
    }

    @Test
    public void testAllShort() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("short.xml"));
        Query query = doc.query("*");
        assertEquals(4, query.size());
        assertEquals("root", query.get(0).name());
        assertEquals("div", query.get(1).name());
        assertEquals("a", query.get(2).name());
        assertEquals("b", query.get(3).name());
    }

    @Test
    public void testAllDeep() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("deep.xml"));
        Query query = doc.query("*");
        assertEquals(5, query.size());
        assertEquals("root", query.get(0).name());
        assertEquals("div", query.get(1).name());
        assertEquals("a", query.get(2).name());
        assertEquals("b", query.get(3).name());
        assertEquals("c", query.get(4).name());
    }

    @Test
    public void testAllWide() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("wide.xml"));
        Query query = doc.query("*");
        assertEquals(29, query.size());
    }

    @Test
    public void testNameRoot() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("root.xml"));
        Query query = doc.query("root");
        assertEquals(1, query.size());
        assertEquals("root", query.get(0).name());
    }

    @Test
    public void testNameShallow_root() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("shallow.xml"));
        Query query = doc.query("root");
        assertEquals(1, query.size());
        assertEquals("root", query.get(0).name());
    }

    @Test
    public void testNameShallow_div() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("shallow.xml"));
        Query query = doc.query("div");
        assertEquals(1, query.size());
        assertEquals("div", query.get(0).name());
    }

    @Test
    public void test_all_child() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
        Query query = doc.query("root > *");
        assertEquals(3, query.size());
        assertEquals("div", query.get(0).name());
        assertEquals("div", query.get(1).name());
    }

    @Test
    public void testChildShallow_div() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("shallow.xml"));
        Query query = doc.query("root > div");
        assertEquals(1, query.size());
        assertEquals("div", query.get(0).name());
    }

    @Test
    public void testChildDeep_div() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("shallow.xml"));
        Query query = doc.query("root > div");
        assertEquals(1, query.size());
        assertEquals("div", query.get(0).name());
    }

    @Test
    public void testChildDeep_chain() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("deep.xml"));
        Query query = doc.query("a > b > c");
        assertEquals(1, query.size());
        assertEquals("c", query.get(0).name());
    }

    @Test
    public void test_child_deep_chain_false_1() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("deep.xml"));
        Query query = doc.query("a > c > b");
        assertEquals(0, query.size());
    }

    @Test
    public void test_child_deep_chain_false_2() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("deep.xml"));
        Query query = doc.query("a > b > d");
        assertEquals(0, query.size());
    }

    @Test
    public void test_child_deep_chain_false_3() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("deep.xml"));
        Query query = doc.query("x > b > c");
        assertEquals(0, query.size());
    }

    @Test
    public void test_all_decendents() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
        Query query = doc.query(".first *");
        assertEquals(8, query.size());
    }

    @Test
    public void test_decendent_deep_chain_1() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("deep.xml"));
        Query query = doc.query("a b c");
        assertEquals(1, query.size());
        assertEquals("c", query.get(0).name());
    }

    /* skip 1 */
    @Test
    public void test_decendent_deep_chain_2() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("deep.xml"));
        Query query = doc.query("a c");
        assertEquals(1, query.size());
        assertEquals("c", query.get(0).name());
    }

    /* skip 2 */
    @Test
    public void test_decendent_deep_chain_3() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("deep.xml"));
        Query query = doc.query("root div c");
        assertEquals(1, query.size());
        assertEquals("c", query.get(0).name());
    }

    @Test
    public void test_decendent_deep_chain_syntax() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("deep.xml"));
        Query query = doc.query("root  div  "
            + " c");
        assertEquals(1, query.size());
        assertEquals("c", query.get(0).name());
    }

    @Test
    public void test_decendent_deep_chain_false_1() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("deep.xml"));
        Query query = doc.query("b a c");
        assertEquals(0, query.size());
    }

    @Test
    public void test_decendent_deep_chain_false_0() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("deep.xml"));
        Query query = doc.query("div a c b");
        assertEquals(0, query.size());
    }

    @Test
    public void test_decendent_deep_chain_wildcard() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("deep.xml"));
        Query query = doc.query("a * c");
        assertEquals(1, query.size());
        assertEquals("c", query.get(0).name());
    }

    @Test
    public void test_decendent_deep_chain_wildcard_false() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("deep.xml"));
        Query query = doc.query("a * b");
        assertEquals(0, query.size());
    }

    @Test
    public void test_child_deep_chain_wildcard() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("deep.xml"));
        Query query = doc.query("a > * > c");
        assertEquals(1, query.size());
        assertEquals("c", query.get(0).name());
    }

    @Test
    public void test_child_deep_chain_double_wildcard() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("deep.xml"));
        Query query = doc.query("div > * > * > c");
        assertEquals(1, query.size());
        assertEquals("c", query.get(0).name());
    }

    @Test
    public void test_child_deep_chain_double_wildcard_false() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("deep.xml"));
        Query query = doc.query("div > * > * > d");
        assertEquals(0, query.size());
    }

    @Test
    public void test_child_deep_chain_wildcard_syntax() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("deep.xml"));
        Query query = doc.query("a>*"
            + ">c");
        assertEquals(1, query.size());
        assertEquals("c", query.get(0).name());
    }

    @Test
    public void test_child_deep_chain_double_wildcard_syntax() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("deep.xml"));
        Query query = doc.query("div>     *     >*>c");
        assertEquals(1, query.size());
        assertEquals("c", query.get(0).name());
    }

    @Test
    public void test_child_deep_chain_double_wildcard_false_syntax() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("deep.xml"));
        Query query = doc.query("div>*>*>d");
        assertEquals(0, query.size());
    }

    @Test
    public void test_mixed_deep() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("deep.xml"));
        Query query = doc.query("div a > b c");
        assertEquals(1, query.size());
    }

    @Test
    public void test_simple_class() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("simple.xml"));
        Query query = doc.query(".class");
        assertEquals(1, query.size());
    }

    @Test
    public void test_simple_id() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("simple.xml"));
        Query query = doc.query("#id");
        assertEquals(1, query.size());
    }

    @Test
    public void test_simple_class_id() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("simple.xml"));
        Query query = doc.query("#id.class");
        /* id must come first */
        assertEquals(1, query.size());
    }

    @Test
    public void test_simple_name_class_id() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("simple.xml"));
        Query query = doc.query("div#id.class");
        /* id must come first after name*/
        assertEquals(1, query.size());
    }

    @Test
    public void test_simple_name_class() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("simple.xml"));
        Query query = doc.query("div.class");
        assertEquals(1, query.size());
    }

    @Test
    public void test_simple_name_id() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("simple.xml"));
        Query query = doc.query("div#id");
        assertEquals(1, query.size());
    }

    @Test
    public void test_simple_class_false() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("simple.xml"));
        Query query = doc.query(".notclass");
        assertEquals(0, query.size());
    }

    @Test
    public void test_simple_id_false() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("simple.xml"));
        Query query = doc.query("#notid");
        assertEquals(0, query.size());
    }

    @Test
    public void test_simple_class_id_false0() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("simple.xml"));
        Query query = doc.query("#notid.class");
        /* id must come first */
        assertEquals(0, query.size());
    }

    @Test
    public void test_simple_class_id_false1() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("simple.xml"));
        Query query = doc.query("#notid.notclass");
        /* id must come first */
        assertEquals(0, query.size());
    }

    @Test
    public void test_simple_name_class_id_false() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("simple.xml"));
        Query query = doc.query("notdiv#id.class");
        /* id must come first after name*/
        assertEquals(0, query.size());
    }

    @Test
    public void test_mixed_multi() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
        Query query = doc.query("a > b d");
        assertEquals(2, query.size());
    }

    @Test
    public void test_class_top() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
        Query query = doc.query(".top");
        assertEquals(3, query.size());
    }

    @Test
    public void test_class_center() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
        Query query = doc.query(".center");
        assertEquals(3, query.size());
    }

    @Test
    public void test_class_top_and_bottom() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
        Query query = doc.query(".top, .bottom");
        assertEquals(6, query.size());
    }

    @Test
    public void test_attribute_key() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
        Query query = doc.query("[data]");
        assertEquals(8, query.size());
    }

    @Test
    public void test_attribute_value_1() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
        Query query = doc.query("[data='alpha']");
        assertEquals(1, query.size());
    }

    @Test
    public void test_attribute_value_2() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
        Query query = doc.query("[data='alpha'], [data='beta']");
        assertEquals(2, query.size());
    }

    @Test
    public void test_attribute_value_repeat() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
        Query query = doc.query("[data='repeat']");
        assertEquals(4, query.size());
    }

    @Test
    public void test_filter_0() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
        Query query = doc.query(".left").filter(".top");
        assertEquals(1, doc.query("#a").size());
    }

    @Test
    public void test_filter_1() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
        Query query = doc.query("*");
        query = query.filter("a");
        assertEquals(2, query.size());
    }

    @Test
    public void test_filter_2() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
        Query query = doc.query(".top, .center, .bottom");
        query = query.filter("b, c");
        assertEquals(6, query.size());
    }

    @Test
    public void test_filter_all() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
        Query query = doc.query(".top, .center, .bottom");
        query = query.filter("*");
        assertEquals(9, query.size());
    }

    @Test
    public void test_format_1() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("deep.xml"));
        assertEquals(doc.queryf("*").toString(), doc.queryf("*").toString());
    }

    @Test
    public void test_format_2() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("deep.xml"));
        assertEquals(doc.queryf("root").toString(), doc.queryf("root").toString());
    }

    @Test
    public void node_query_inst() throws IOException{
        Document doc = DocumentLoader.documentFromStream(getResourceStream("types.xml"));
        assertEquals("[xml, context]", doc.query(NodeType.INSTRUCTION).toString());
    }

    @Test
    public void node_query_comment() throws IOException{
        Document doc = DocumentLoader.documentFromStream(getResourceStream("types.xml"));
        assertEquals("[@COMMENT]", doc.query(NodeType.COMMENT).filter("*").toString());
    }


    @Test
    public void instruction_node() throws IOException{
        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
        Query query = doc.query(NodeType.INSTRUCTION);
        assertEquals("[xml[version='1.0']]", query.toString("version"));
    }

    @Test
    public void instruction_name() throws IOException{
        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
        Query query = doc.query(NodeType.INSTRUCTION).filter("xml");
        assertEquals("[xml[version='1.0']]", query.toString("version"));
    }

    @Test
    public void instruction_attributes() throws IOException{
        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
        Query query = doc.query(NodeType.INSTRUCTION).filter("xml[version]");
        assertEquals("[xml[version='1.0']]", query.toString("version"));
    }

    @Test
    public void instruction_attributes_format() throws IOException{
        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
        Query query1 = doc.query(NodeType.INSTRUCTION);
        Query query2 = query1.filter("[version]");
        Query query3 = query2.filterf("[%s]", "version");
        assertEquals("[xml[version='1.0']]", query1.toString("version"));
        assertEquals("[xml[version='1.0']]", query2.toString("version"));
        assertEquals("[xml[version='1.0']]", query3.toString("version"));
    }
}
