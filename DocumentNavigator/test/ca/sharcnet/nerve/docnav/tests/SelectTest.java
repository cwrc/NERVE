package ca.sharcnet.nerve.docnav.tests;
import ca.sharcnet.nerve.docnav.dom.Document;
import ca.sharcnet.nerve.docnav.dom.ElementNode;
import ca.sharcnet.nerve.docnav.dom.InstructionNode;
import ca.sharcnet.nerve.docnav.dom.NodeType;
import ca.sharcnet.nerve.docnav.dom.TextNode;
import ca.sharcnet.nerve.docnav.selector.Select;
import org.junit.Assert;
import org.junit.Test;

public class SelectTest {
    private final Document document;
    private final Document empty;

    public SelectTest() {
        this.empty = new Document();
        this.document = new Document();
        document.addChild(new InstructionNode("<?xml-model model=\"orlando\">"));
        document.addChild(new TextNode("\n"));
        ElementNode root = (ElementNode) document.addChild(new ElementNode("root"));
        root.addAttribute("root", "GROOT!");
        root.addAttribute("index", 0);
        root.addChild(new TextNode("\n"));

        for (int i = 0; i < 4; i++){
            ElementNode divChild = (ElementNode) root.addChild(
                new ElementNode("div")
                .addAttribute("index", i)
            );

            root.addChild(new TextNode("\n"));
            divChild.addChild(new TextNode("\n"));

            if ( i % 2 == 0) divChild.addAttribute("even", "true");
            else divChild.addAttribute("odd", "true");

            for (int j = 0; j < 4; j++){
                ElementNode linkChild = (ElementNode) divChild.addChild(
                    new ElementNode("link")
                    .addAttribute("index", j)
                );
                if (j % 2 == 0) linkChild.addAttribute("even", "true");
                else linkChild.addAttribute("odd", "true");
                if (j == 1) linkChild.addAttribute("ima-one", "");
                divChild.addChild(new TextNode("\n"));
            }
        }
    }

    @Test
    public void printTree(){
        System.out.println(document);
    }

    @Test
    public void none_empty() {
        Select select = empty.select();
        Assert.assertEquals(0, select.size());
    }

    @Test
    public void none_doc() {
        Select select = empty.select();
        Assert.assertEquals(0, select.size());
    }

    @Test
    public void all_doc(){
        Assert.assertEquals(21, document.select().all().size());
    }

    @Test
    public void all_element(){
        ElementNode root = (ElementNode) document.childNodes().get(2);
        ElementNode div = (ElementNode) root.childNodes().get(1);
        Assert.assertEquals(5, div.select().all().size());
    }

    @Test
    public void name_doc(){
        Assert.assertEquals(1, document.select().name("root").size());
        Assert.assertEquals(4, document.select().name("div").size());
        Assert.assertEquals(16, document.select().name("link").size());
    }

    @Test
    public void multiname_doc(){
        Assert.assertEquals(5, document.select().name("root", "div").size());
    }

    @Test
    public void chainname_doc(){
        Assert.assertEquals(5, document.select().name("root").name("div").size());
    }

    @Test
    public void name_empty(){
        Assert.assertEquals(0, empty.select().name("root").size());
        Assert.assertEquals(0, empty.select().name("@document").size());
    }

    @Test
    public void name_notfound_doc(){
        Assert.assertEquals(0, document.select().name("x").size());
    }

    @Test
    public void attr_doc(){
        Assert.assertEquals(21, document.select().attribute("index").size());
        Assert.assertEquals(10, document.select().attribute("even").size());
    }

    @Test
    public void chained_attr_doc_noCrossover(){
        /* there is no crossover between even and ima-one */
        Assert.assertEquals(14, document.select().attribute("even").attribute("ima-one").size());
    }

    @Test
    public void chained_attr_doc_crossover(){
        /* there is crossover between odd and ima-one */
        Assert.assertEquals(10, document.select().attribute("odd").attribute("ima-one").size());
    }

    @Test
    public void attr_value(){
        /* there is crossover between odd and ima-one */
        Assert.assertEquals(5, document.select().attribute("index", 2).size());
    }

    @Test
    public void chained_attr_value(){
        /* there is crossover between odd and ima-one */
        Assert.assertEquals(10, document.select().attribute("index", 2).attribute("index", 1).size());
    }
}
