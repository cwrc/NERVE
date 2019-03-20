package ca.sharcnet.nerve.docnav.tests;

import ca.frar.utility.console.Console;
import ca.sharcnet.nerve.HasStreams;
import ca.sharcnet.nerve.docnav.DocumentLoader;
import ca.sharcnet.nerve.docnav.dom.Document;
import ca.sharcnet.nerve.docnav.dom.ElementNode;
import ca.sharcnet.nerve.docnav.dom.Node;
import ca.sharcnet.nerve.docnav.dom.NodeList;
import ca.sharcnet.nerve.docnav.query.Query;
import ca.sharcnet.nerve.docnav.query.QueryOperationException;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import junit.framework.Assert;
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
        for (Node e : query) assertEquals("div", e.name());
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
        query.forEach(node -> assertFalse(node.attr("class").contains("apple apple")));
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
        query.detach();
        assertEquals(1, doc.query("*").size());
    }

    @Test
    public void test_remove_part() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
        doc.query("a").detach();
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
        doc.query(".second, .top").detach();
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
        query.detach();
        query.detach();
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
        doc.query(".first, a, b, c, d").extract();
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
    public void test_attr_empty_select() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
        assertEquals("", doc.query("").attr("data"));
    }

    /* first element doesn't have attribute */
    @Test
    public void test_attr_null() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
        assertEquals("", doc.query("*").attr("data"));
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

    /**
    Replace all selected elements with a copy of 'node'.
    @throws IOException
     */
    @Test
    public void test_replace_with_none() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
        String before = doc.query("*").toString();
        Query query = doc.query("none"); /* there are no 'none' nodes in the doc */
        ElementNode node = new ElementNode("new");
        query.replaceWith(node);
        assertEquals(before, doc.query("*").toString());
    }

    /**
    Replace all selected elements with a copy of 'node'.
    @throws IOException
     */
    @Test
    public void test_replace_with_one() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
        Query query = doc.query(".first");
        ElementNode node = new ElementNode("new");
        query.replaceWith(node);
        assertEquals("[new, div.second, div.third]", doc.query("root > *").toString());
        assertEquals("[]", doc.query(".new > *").toString()); /* no child nodes */
    }

    /**
    Replace ALL selected elements with a copy of 'node'.
    @throws IOException
     */
//    @Test
//    public void test_replace_with_many() throws IOException {
//        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
//        doc.query(".first, .second, .third").replaceWith(new ElementNode("new"));
//        assertEquals("[new, new, new]", doc.query("root > *").toString());
//    }


    /**
    Replace all selected elements with a copy of 'node'.  Returns a query collection of the new nodes.
    @throws IOException
     */
    @Test
    public void test_replace_with_many_rvalue() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
        Query query = doc.query(".first");
        ElementNode node = new ElementNode("div");
        node.attr("class", "new");
        query.replaceWith(node);
    }

    /**
    None selected, no source
    */
    @Test
    public void test_prepend_0() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
        String before = doc.toString();
        doc.query("").prepend(new Query());
        assertEquals(before, doc.toString());
    }

    /**
    One selected, no source, no previous children.
    */
    @Test
    public void test_prepend_1() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
        String before = doc.toString();
        doc.query(".third").prepend(new Query());
        assertEquals(before, doc.toString());
    }


    /**
    One selected, one source, no previous children.
    */
    @Test
    public void test_prepend_2() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
        doc.query(".third").prepend(new ElementNode("new"));
        assertEquals("[new]", doc.query(".third > *").toString());
    }

    /**
    One selected, many source, no previous children.
    */
    @Test
    public void test_prepend_3() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));

        List<Node> list = new NodeList();
        list.add(new ElementNode("one"));
        list.add(new ElementNode("two"));
        list.add(new ElementNode("three"));

        doc.query(".third").prepend(list);
        assertEquals("[one, two, three]", doc.query(".third > *").toString());
    }

    /**
    Many selected, no source, no previous children.
    */
    @Test
    public void test_prepend_5() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
        String before = doc.toString();
        doc.query(".first, .second, .third").prepend(new Query());
        assertEquals(before, doc.toString());
    }

    /**
    One selected, none source, some previous children.
    */
    @Test
    public void test_prepend_6() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
        doc.query(".first, .second, .third").prepend(new ElementNode("new"));
        assertEquals("[new, a#j, a#n]", doc.query(".first > *").toString());
        assertEquals("[new, b#a.top.left, b#d.center.left, b#g.bottom.left]", doc.query(".second > *").toString());
        assertEquals("[new]", doc.query(".third > *").toString());
    }


    @Test
    public void name_none() throws IOException{
        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
        assertEquals(null, doc.query("").name());
    }

    @Test
    public void name_one() throws IOException{
        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
        assertEquals("div", doc.query(".first").name());
    }

    @Test
    public void name_many() throws IOException{
        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
        assertEquals("c", doc.query(".middle").name());
    }

    @Test
    public void has_attr_true() throws IOException{
        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
        assertEquals(true, doc.query(".middle").hasAttr("class"));
    }

    @Test
    public void has_attr_false() throws IOException{
        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
        assertEquals(false, doc.query("root").hasAttr("class"));
    }

    @Test
    public void has_attr_empty() throws IOException{
        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
        assertEquals(false, doc.query("").hasAttr("class"));
    }

    /**
    None selected, no source
    */
    @Test
    public void test_append_0() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
        String before = doc.toString();
        doc.query("").append(new Query());
        assertEquals(before, doc.toString());
    }

    /**
    One selected, no source, no previous children.
    */
    @Test
    public void test_append_1() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
        String before = doc.toString();
        doc.query(".third").append(new Query());
        assertEquals(before, doc.toString());
    }


    /**
    One selected, one source, no previous children.
    */
    @Test
    public void test_append_2() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
        doc.query(".third").append(new ElementNode("new"));
        assertEquals("[new]", doc.query(".third > *").toString());
    }

    /**
    One selected, many source, no previous children.
    */
    @Test
    public void test_append_3() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));

        List<Node> list = new NodeList();
        list.add(new ElementNode("one"));
        list.add(new ElementNode("two"));
        list.add(new ElementNode("three"));

        doc.query(".third").append(list);
        assertEquals("[one, two, three]", doc.query(".third > *").toString());
    }

    /**
    Many selected, no source, no previous children.
    */
    @Test
    public void test_append_5() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
        String before = doc.toString();
        doc.query(".first, .second, .third").append(new Query());
        assertEquals(before, doc.toString());
    }

    /**
    One selected, none source, some previous children.
    */
    @Test
    public void test_append_6() throws IOException {
        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
        doc.query(".first, .second, .third").append(new ElementNode("new"));
        assertEquals("[a#j, a#n, new]", doc.query(".first > *").toString());
        assertEquals("[b#a.top.left, b#d.center.left, b#g.bottom.left, new]", doc.query(".second > *").toString());
        assertEquals("[new]", doc.query(".third > *").toString());
    }

    @Test
    public void test_last_empty_set() throws IOException{
        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
        assertEquals(null, doc.query("").last());
    }

    @Test
    public void test_first_empty_set() throws IOException{
        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
        assertEquals(null, doc.query("").first());
    }

    @Test
    public void test_text_empty_set() throws IOException{
        Document doc = DocumentLoader.documentFromStream(getResourceStream("multi.xml"));
        assertEquals(null, doc.query("").text());
    }
}
