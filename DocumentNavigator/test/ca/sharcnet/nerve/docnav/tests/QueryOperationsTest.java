package ca.sharcnet.nerve.docnav.tests;

import ca.sharcnet.nerve.Console;
import ca.sharcnet.nerve.HasStreams;
import ca.sharcnet.nerve.docnav.DocumentLoader;
import ca.sharcnet.nerve.docnav.dom.Document;
import ca.sharcnet.nerve.docnav.dom.ElementNode;
import ca.sharcnet.nerve.docnav.query.Query;
import ca.sharcnet.nerve.docnav.query.QueryOperationException;
import ca.sharcnet.nerve.docnav.selector.ElementList;
import java.io.IOException;
import java.io.InputStream;
import static org.junit.Assert.*;
import org.junit.Test;

/**
 *
 * @author edward
 */
public class QueryOperationsTest implements HasStreams {

    @Override
    public InputStream getResourceStream(String path) {
        return this.getClass().getResourceAsStream("/resources/" + path);
    }

    @Test
    public void test_name() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
        Query query = doc.query("*");
        query.name("div");
        for (ElementNode e : query) assertEquals("div", e.getName());
        query = doc.query("div");
        assertEquals(21, query.size());
    }

    @Test
    public void test_hasClass_true() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
        Query query = doc.query("*");
        assertEquals(true, query.hasClass("top"));
    }

    @Test
    public void test_hasClass_true_multiple_1() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
        Query query = doc.query("*");
        assertEquals(true, query.hasClass("top bottom"));
    }

    @Test
    public void test_hasClass_true_multiple_2() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
        Query query = doc.query("*");
        assertEquals(true, query.hasClass("top apple"));
    }

    @Test
    public void test_hasClass_false_in_doc() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
        Query query = doc.query("d");
        assertEquals(false, query.hasClass("left"));
    }

    @Test
    public void test_hasClass_false_in_doc_multiple() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
        Query query = doc.query("d");
        assertEquals(false, query.hasClass("left first"));
    }

    @Test
    public void test_hasClass_false_not_in_doc() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
        Query query = doc.query("*");
        assertEquals(false, query.hasClass("apple"));
    }

    @Test
    public void test_class() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
        Query query = doc.query("*");
        query.addClass("apple");
        query = doc.query(".apple");
        assertEquals(21, query.size());
    }

    @Test
    public void test_class_twice() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
        Query query = doc.query("*");
        query.addClass("apple");
        query.addClass("apple");
        query = doc.query(".apple");
        query.forEach(node -> assertFalse(node.getAttributeValue("class").contains("apple apple")));
    }

    @Test
    public void test_removeClass() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
        Query query = doc.query("*");
        query.removeClass("first");
        query = doc.query(".first");
        assertEquals(0, query.size());
    }

    @Test
    public void test_removeClass_multiple() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
        Query query = doc.query("*");
        query.removeClass("top", "left");
        query = doc.query("*");
        assertEquals(false, query.hasClass("top"));
        assertEquals(false, query.hasClass("left"));
    }

    @Test
    public void test_removeClass_all() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
        Query query = doc.query("*");
        query.removeClass();
        query = doc.query("*");
        assertEquals(false, query.hasClass("top"));
        assertEquals(false, query.hasClass("left"));
        assertEquals(false, query.hasClass("right"));
        assertEquals(false, doc.toString().contains("class"));
    }

    @Test
    public void test_remove() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
        Query query = doc.query("div");
        query.remove();
        assertEquals(1, doc.query("*").size());
    }

    @Test
    public void test_remove_part() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
        doc.query("a").remove();
        assertEquals(0, doc.query("a").size());
        assertEquals(false, doc.toString().contains("<a"));
    }

    /**
     * Some removed nodes also have had their parents removed.
     *
     * @throws IOException
     */
    @Test
    public void test_remove_multi() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
        doc.query(".second, .top").remove();
        assertEquals(0, doc.query("top center bottom second").size());
    }

    /**
     * Removing nodes that don't have parents will throw a query operation
     * (runtime) exception.
     *
     * @throws IOException
     */
    @Test(expected = QueryOperationException.class)
    public void test_remove_multi_ex() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
        Query query = doc.query(".second, .top");
        query.remove();
        query.remove();
    }

    /**
     * Some removed nodes also have had their parents removed.
     *
     * @throws IOException
     */
    @Test
    public void test_remove_refined() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
        doc.query(".right").remove(".top");
        assertEquals(0, doc.query("#c").size());
        assertEquals(4, doc.query(".left, .top").size());
    }

    @Test
    public void test_remove_extract() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
        doc.query("#a").extract();
        assertEquals(0, doc.query("#a").size());
        assertEquals(2, doc.query("#b, #c").size());
    }

    @Test
    public void test_remove_extract_multi() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
        doc.query(".first, a, b, c, d").extract("");
        assertEquals(3, doc.query("*").size());
    }

    /* first attribute found */
    @Test
    public void test_attr() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
        assertEquals("alpha", doc.query("a").attr("data"));
    }

    /* first element doesn't have attribute */
    @Test
    public void test_attr_null() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
        assertEquals(null, doc.query("*").attr("data"));
    }

    @Test
    public void test_attr_set() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
        doc.query("*").attr("data", "x");
        Query query = doc.query("*");
        query.forEach(node -> assertTrue(node.hasAttribute("data", "x")));
    }

    @Test
    public void test_attr_remove() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
        doc.query("*").removeAttr("data");
        Query query = doc.query("*");
        query.forEach(node -> assertFalse(node.hasAttribute("data")));
    }

    @Test
    public void test_children() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
        Query query = doc.query(".first").children();
        Query match = doc.query(".first > *");
        assertTrue(query.containsAll(match));
        assertTrue(match.containsAll(query));
    }

    @Test
    public void test_intersect_1() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
        Query query1 = doc.query("b");
        Query query2 = doc.query(".second *");
        Query intersect = query1.intersect(query2);
        assertEquals("[b#a.top.left, b#d.center.left, b#g.bottom.left]", intersect.toString());
    }

    @Test
    public void test_intersect_empty() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
        Query query1 = doc.query(".first");
        Query query2 = doc.query(".second");
        assertEquals("[]", query1.intersect(query2).toString());
    }

    @Test
    public void test_unique() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
        Query query1 = doc.query("b");
        Query query2 = doc.query(".second b");
        Query unique = query1.unique(query2);
        assertEquals("[b#k, b#o]", unique.toString());
    }

    @Test
    public void test_xor() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
        Query query1 = doc.query("b");
        Query query2 = doc.query(".center");
        Query xor = query1.xor(query2);
        assertEquals("[b#k, b#o, b#a.top.left, b#g.bottom.left, c#e.center.middle, d#f.center.right]", xor.toString());
    }

    @Test
    public void test_text_0() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("text.xml"));
        assertEquals("alpha beta charlie", doc.query(".first").text());
    }

    @Test
    public void test_text_1() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("text.xml"));
        assertEquals("beta", doc.query(".first > div").text());
    }

    @Test
    public void test_text_replace() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("text.xml"));
        doc.query("root > div").text("echo");
        assertEquals("echo", doc.query(".first").text());
        assertEquals("echo", doc.query(".second").text());
    }

    @Test
    public void test_copy() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
        Query query = doc.query("a");
        Query copy = doc.query("a").copy();
        assertEquals(query.toString(), copy.toString());
    }

    @Test
    public void test_copy_empty() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
        Query copy = doc.query("z").copy();
        assertEquals("[]", copy.toString());
    }

    @Test
    public void test_copy_check_not_same() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
        Query copy = doc.query("a").copy();
        copy.addClass("not-same");
        Query query = doc.query("a");
        assertNotEquals(query.toString(), copy.toString());
    }

    @Test
    public void test_append_new_1() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
        doc.query(".third").appendNew("div");
        assertEquals(1, doc.query(".third").children().size());
    }

    @Test
    public void test_append_new_2() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
        Query appendNew = doc.query(".third").appendNew("div");
        assertEquals(1, appendNew.size());
    }

    @Test
    public void test_append_new_3() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
        Query appendNew = doc.query(".third").appendNew("div");
        assertEquals(doc.query(".third > div").first(), appendNew.first());
    }

    @Test
    public void test_append_new_4() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
        Query appendNew = doc.query(".second").appendNew("div");       
        assertEquals(doc.query(".second > div").last(), appendNew.first());
    }

    @Test
    public void test_append_new_5() throws IOException{
        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
        doc.query(".second").appendNew("div");
        assertEquals(4, doc.query(".second").children().size());
    }            
    
    @Test
    public void test_prepend_new_1() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
        doc.query(".third").prependNew("div");
        assertEquals(1, doc.query(".third").children().size());
    }

    @Test
    public void test_prepend_new_2() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
        Query prependNew = doc.query(".third").prependNew("div");
        assertEquals(1, prependNew.size());
    }

    @Test
    public void test_prepend_new_3() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
        Query prependNew = doc.query(".third").prependNew("div");
        assertEquals(doc.query(".third > div").first(), prependNew.first());
    }
    
    @Test
    public void test_prepend_new_4() throws IOException{
        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
        Query prependNew = doc.query(".second").prependNew("abc");
        assertEquals(doc.query(".second > *").first(), prependNew.first());
    }    
    
    @Test
    public void test_prepend_new_5() throws IOException{
        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
        doc.query(".second").prependNew("divvv");
        assertEquals(4, doc.query(".second").children().size());
    }        
    
    @Test
    public void test_append_to() throws IOException{
        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
        Query query = doc.query(".first *");
        doc.query(".third").appendNew("z");
        query.appendTo(doc.query(".third"));
        assertEquals(9, doc.query(".third").children().size());
        assertEquals(doc.query(".third > *").toString(), "[z, a#j, b#k, c#l, d#m, a#n, b#o, c#p, d#q]");
    }    
    
    @Test
    public void test_prepend_to() throws IOException{
        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
        Query query = doc.query(".first *");
        doc.query(".third").appendNew("z");
        query.prependTo(doc.query(".third"));
        assertEquals(9, doc.query(".third").children().size());
        assertEquals(doc.query(".third > *").toString(), "[a#j, b#k, c#l, d#m, a#n, b#o, c#p, d#q, z]");
    }        
}
