package ca.sharcnet.nerve.docnav.tests;
import ca.frar.utility.console.Console;
import ca.sharcnet.nerve.HasStreams;
import ca.sharcnet.nerve.docnav.DocumentLoader;
import ca.sharcnet.nerve.docnav.dom.Document;
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
public class QueryFTest implements HasStreams {

    @Override
    public InputStream getResourceStream(String path) {
        return this.getClass().getResourceAsStream("/resources/" + path);
    }

    @Test
    public void test_empty() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
        assertEquals(doc.queryf(""), doc.query(""));
    }

    @Test
    public void testAllRoot() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
        assertEquals(doc.queryf("*"), doc.query("*"));
        assertEquals(doc.queryf("%s", "*"), doc.query("*"));
    }

    @Test
    public void testNameRoot() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
        assertEquals(doc.queryf("root").name(), doc.query("root").name());
        assertEquals(doc.queryf("%s", "root").name(), doc.query("root").name());
    }

    @Test
    public void test_all_child() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
        assertEquals(doc.queryf("root > *"), doc.query("root > *"));
        assertEquals(doc.queryf("%s > %s", "root", "*"), doc.query("root > *"));
    }

    @Test
    public void testChildShallow_div() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
        assertEquals(doc.queryf("root > div"), doc.query("root > div"));
        assertEquals(doc.queryf("%s > %s", "root", "div"), doc.query("root > div"));
    }

    @Test
    public void testChildDeep_chain() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
        assertEquals(doc.queryf("a > b > c"), doc.query("a > b > c"));
    }

    @Test
    public void test_child_deep_chain_false_1() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
        assertEquals(doc.queryf("a > c > b"), doc.query("a > c > b"));
    }

    @Test
    public void test_child_deep_chain_false_3() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
        assertEquals(doc.queryf("x > b > c"), doc.query("x > b > c"));
    }

    @Test
    public void test_all_decendents() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
        assertEquals(doc.queryf(".first *"), doc.query(".first *"));
    }

    @Test
    public void test_decendent_deep_chain_1() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
        assertEquals(doc.queryf("a b c"), doc.query("a b c"));
    }

//    /* skip 1 */
    @Test
    public void test_decendent_deep_chain_2() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
        assertEquals(doc.queryf("a c"), doc.query("a c"));
    }

//    /* skip 2 */
    @Test
    public void test_decendent_deep_chain_3() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
        assertEquals(doc.queryf("root div c"), doc.query("root div c"));
    }

//    @Test
//    public void test_decendent_deep_chain_false_1() throws IOException {
//        Document doc = DocumentLoader.documentFromStream(getResourceStream("deep.xml"));
//        Query query = doc.query("b a c");
//        assertEquals(0, query.size());
//    }
//
//    @Test
//    public void test_decendent_deep_chain_false_0() throws IOException {
//        Document doc = DocumentLoader.documentFromStream(getResourceStream("deep.xml"));
//        Query query = doc.query("div a c b");
//        assertEquals(0, query.size());
//    }
//
//    @Test
//    public void test_decendent_deep_chain_wildcard() throws IOException {
//        Document doc = DocumentLoader.documentFromStream(getResourceStream("deep.xml"));
//        Query query = doc.query("a * c");
//        assertEquals(1, query.size());
//        assertEquals("c", query.get(0).getName());
//    }
//
//    @Test
//    public void test_decendent_deep_chain_wildcard_false() throws IOException {
//        Document doc = DocumentLoader.documentFromStream(getResourceStream("deep.xml"));
//        Query query = doc.query("a * b");
//        assertEquals(0, query.size());
//    }
//
//    @Test
//    public void test_child_deep_chain_wildcard() throws IOException {
//        Document doc = DocumentLoader.documentFromStream(getResourceStream("deep.xml"));
//        Query query = doc.query("a > * > c");
//        assertEquals(1, query.size());
//        assertEquals("c", query.get(0).getName());
//    }
//
//    @Test
//    public void test_child_deep_chain_double_wildcard() throws IOException {
//        Document doc = DocumentLoader.documentFromStream(getResourceStream("deep.xml"));
//        Query query = doc.query("div > * > * > c");
//        assertEquals(1, query.size());
//        assertEquals("c", query.get(0).getName());
//    }
//
//    @Test
//    public void test_child_deep_chain_double_wildcard_false() throws IOException {
//        Document doc = DocumentLoader.documentFromStream(getResourceStream("deep.xml"));
//        Query query = doc.query("div > * > * > d");
//        assertEquals(0, query.size());
//    }
//
//    @Test
//    public void test_mixed_deep() throws IOException {
//        Document doc = DocumentLoader.documentFromStream(getResourceStream("deep.xml"));
//        Query query = doc.query("div a > b c");
//        assertEquals(1, query.size());
//    }
//
    @Test
    public void test_simple_class() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
        assertEquals(doc.queryf(".class"), doc.query(".class"));
        assertEquals(doc.queryf(".%s", "class"), doc.query(".class"));
    }
//
//    @Test
//    public void test_simple_id() throws IOException {
//        Document doc = DocumentLoader.documentFromStream(getResourceStream("simple.xml"));
//        Query query = doc.query("#id");
//        assertEquals(1, query.size());
//    }
//
//    @Test
//    public void test_simple_class_id() throws IOException {
//        Document doc = DocumentLoader.documentFromStream(getResourceStream("simple.xml"));
//        Query query = doc.query("#id.class");
//        /* id must come first */
//        assertEquals(1, query.size());
//    }
//
//    @Test
//    public void test_simple_name_class_id() throws IOException {
//        Document doc = DocumentLoader.documentFromStream(getResourceStream("simple.xml"));
//        Query query = doc.query("div#id.class");
//        /* id must come first after name*/
//        assertEquals(1, query.size());
//    }
//
//    @Test
//    public void test_simple_name_class() throws IOException {
//        Document doc = DocumentLoader.documentFromStream(getResourceStream("simple.xml"));
//        Query query = doc.query("div.class");
//        assertEquals(1, query.size());
//    }
//
//    @Test
//    public void test_simple_name_id() throws IOException {
//        Document doc = DocumentLoader.documentFromStream(getResourceStream("simple.xml"));
//        Query query = doc.query("div#id");
//        assertEquals(1, query.size());
//    }
//
//    @Test
//    public void test_simple_class_false() throws IOException {
//        Document doc = DocumentLoader.documentFromStream(getResourceStream("simple.xml"));
//        Query query = doc.query(".notclass");
//        assertEquals(0, query.size());
//    }
//
//    @Test
//    public void test_simple_id_false() throws IOException {
//        Document doc = DocumentLoader.documentFromStream(getResourceStream("simple.xml"));
//        Query query = doc.query("#notid");
//        assertEquals(0, query.size());
//    }
//
//    @Test
//    public void test_simple_class_id_false0() throws IOException {
//        Document doc = DocumentLoader.documentFromStream(getResourceStream("simple.xml"));
//        Query query = doc.query("#notid.class");
//        /* id must come first */
//        assertEquals(0, query.size());
//    }
//
//    @Test
//    public void test_simple_class_id_false1() throws IOException {
//        Document doc = DocumentLoader.documentFromStream(getResourceStream("simple.xml"));
//        Query query = doc.query("#notid.notclass");
//        /* id must come first */
//        assertEquals(0, query.size());
//    }
//
//    @Test
//    public void test_simple_name_class_id_false() throws IOException {
//        Document doc = DocumentLoader.documentFromStream(getResourceStream("simple.xml"));
//        Query query = doc.query("notdiv#id.class");
//        /* id must come first after name*/
//        assertEquals(0, query.size());
//    }
//
//    @Test
//    public void test_mixed_multi() throws IOException {
//        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
//        Query query = doc.query("a > b d");
//        assertEquals(2, query.size());
//    }
//
//    @Test
//    public void test_class_top() throws IOException {
//        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
//        Query query = doc.query(".top");
//        assertEquals(3, query.size());
//    }
//
//    @Test
//    public void test_class_center() throws IOException {
//        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
//        Query query = doc.query(".center");
//        assertEquals(3, query.size());
//    }
//
//    @Test
//    public void test_class_top_and_bottom() throws IOException {
//        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
//        Query query = doc.query(".top, .bottom");
//        assertEquals(6, query.size());
//    }
//
//    @Test
//    public void test_attribute_key() throws IOException {
//        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
//        Query query = doc.query("[data]");
//        assertEquals(8, query.size());
//    }
//
//    @Test
//    public void test_attribute_value_1() throws IOException {
//        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
//        Query query = doc.query("[data='alpha']");
//        assertEquals(1, query.size());
//    }
//
//    @Test
//    public void test_attribute_value_2() throws IOException {
//        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
//        Query query = doc.query("[data='alpha'], [data='beta']");
//        assertEquals(2, query.size());
//    }
//
//    @Test
//    public void test_attribute_value_repeat() throws IOException {
//        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
//        Query query = doc.query("[data='repeat']");
//        assertEquals(4, query.size());
//    }
//
//    @Test
//    public void test_filter_0() throws IOException {
//        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
//        Query query = doc.query(".left").filter(".top");
//        assertEquals(1, doc.query("#a").size());
//    }
//
//    @Test
//    public void test_filter_1() throws IOException {
//        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
//        Query query = doc.query("*");
//        query = query.filter("a");
//        assertEquals(2, query.size());
//    }
//
//    @Test
//    public void test_filter_2() throws IOException {
//        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
//        Query query = doc.query(".top, .center, .bottom");
//        query = query.filter("b, c");
//        assertEquals(6, query.size());
//    }
//
//    @Test
//    public void test_filter_all() throws IOException {
//        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
//        Query query = doc.query(".top, .center, .bottom");
//        query = query.filter("*");
//        assertEquals(9, query.size());
//    }
//
//    @Test
//    public void test_format_1() throws IOException {
//        Document doc = DocumentLoader.documentFromStream(getResourceStream("deep.xml"));
//        assertEquals(doc.queryf("*").toString(), doc.queryf("*").toString());
//    }
//
//    @Test
//    public void test_format_2() throws IOException {
//        Document doc = DocumentLoader.documentFromStream(getResourceStream("deep.xml"));
//        assertEquals(doc.queryf("root").toString(), doc.queryf("root").toString());
//    }
//
//    @Test
//    public void node_query_inst() throws IOException{
//        Document doc = DocumentLoader.documentFromStream(getResourceStream("types.xml"));
//        assertEquals("[xml, context]", doc.query(NodeType.INSTRUCTION).toString());
//    }
//
//    @Test
//    public void node_query_comment() throws IOException{
//        Document doc = DocumentLoader.documentFromStream(getResourceStream("types.xml"));
//        assertEquals("[@COMMENT]", doc.query(NodeType.COMMENT).filter("*").toString());
//    }
}
