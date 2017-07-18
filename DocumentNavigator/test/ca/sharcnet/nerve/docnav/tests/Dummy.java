/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package ca.sharcnet.nerve.docnav.tests;

import ca.sharcnet.nerve.docnav.dom.ElementNode;
import org.junit.Assert;
import org.junit.Test;
import static org.junit.Assert.*;

/**
 *
 * @author edward
 */
public class Dummy {

    public Dummy() {
    }

    @Test
    public void copy_with_attributes_1(){
        ElementNode source = new ElementNode("div");
        source.addAttribute("class", "ima-class");
        source.addAttribute("id", "ima-id");
        ElementNode copy = source.copy();
        Assert.assertEquals(source.toString(), copy.toString());
    }

    @Test
    public void copy_with_attributes_2(){
        ElementNode source = new ElementNode("div");
        source.addAttribute("class", "ima-class");
        source.addAttribute("id", "ima-id");
        ElementNode copy = source.copy();
        source.addAttribute("id", "ima-id-copy");
        Assert.assertNotEquals(source.toString(), copy.toString());
    }

}
