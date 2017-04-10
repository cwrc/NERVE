package ca.sharcnet.nerve.docnav.tests;

import ca.sharcnet.nerve.docnav.dom.Document;
import ca.sharcnet.nerve.docnav.dom.ElementNode;
import ca.sharcnet.nerve.docnav.dom.InstructionNode;
import ca.sharcnet.nerve.docnav.dom.TextNode;
import ca.sharcnet.nerve.docnav.selector.Select;
import java.util.List;
import org.junit.Assert;
import org.junit.Test;

/**
 *
 * @author edward
 */
public class RefineTest {

    private final Document document;

    public RefineTest() {
        this.document = new Document();
        document.addChild(new InstructionNode());
        document.addChild(new TextNode("\n"));
        ElementNode root = (ElementNode) document.addChild(new ElementNode("root"));
        root.addAttribute("root", "GROOT!");
        root.addAttribute("index", 0);
        root.addChild(new TextNode("\n"));

        for (int i = 0; i < 4; i++) {
            ElementNode divChild = (ElementNode) root.addChild(
                new ElementNode("div")
                    .addAttribute("index", i)
            );

            root.addChild(new TextNode("\n"));
            divChild.addChild(new TextNode("\n"));

            if (i % 2 == 0) divChild.addAttribute("even", "true");
            else divChild.addAttribute("odd", "true");

            for (int j = 0; j < 4; j++) {
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
    public void printTree() {
        System.out.println(document);
    }

    @Test
    public void keepElement() {
        ElementNode root = (ElementNode) document.childNodes().get(2);
        ElementNode div = (ElementNode) root.childNodes().get(1);
        List<ElementNode> result = document.select().all().refine().keepElement(div);
        Assert.assertEquals(1, result.size());
    }

    @Test
    public void keepName() {
        List<ElementNode> result = document.select().all().refine().keepName("div");
        Assert.assertEquals(4, result.size());
    }

    @Test
    public void removeName() {
        List<ElementNode> result = document.select().all().refine().removeName("link");
        Assert.assertEquals(5, result.size());
    }

    @Test
    public void keepAttribute() {
        int odd = document.select().attribute("odd").size();
        List<ElementNode> result = document.select().all().refine().keepAttribute("odd");
        Assert.assertEquals(odd, result.size());
    }

    @Test
    public void removeAttribute() {
        int count = document.select().all().size();
        int odd = document.select().attribute("odd").size();
        List<ElementNode> result = document.select().all().refine().removeAttribute("odd");
        Assert.assertEquals(count - odd, result.size());
    }

    @Test
    public void keepAttributeValue() {
        List<ElementNode> result = document.select().all().refine().keepAttribute("index", 0);
        Assert.assertEquals(6, result.size());
    }

    @Test
    public void removeAttributeValue() {
        List<ElementNode> result = document.select().all().refine().removeAttribute("index", 0);
        Assert.assertEquals(15, result.size());
    }
}
