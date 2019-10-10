/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package ca.sharcnet.nerve.scriber.stringmatch;

import java.util.ArrayList;
import junit.framework.TestCase;

/**
 *
 * @author edward
 */
public class StringMatchTest extends TestCase {

    public class Result {

        public String string;
        public boolean accepted;
        public int value = -1;

        public Result(String s, boolean a) {
            this.string = s;
            this.accepted = a;
        }

        public Result(String s, boolean a, int v) {
            this.string = s;
            this.accepted = a;
            this.value = v;
        }
    }

    public StringMatchTest(String testName) {
        super(testName);
    }

    @Override
    protected void setUp() throws Exception {
        super.setUp();
    }

    @Override
    protected void tearDown() throws Exception {
        super.tearDown();
    }

    public void test_empty() {
        ArrayList<Result> results = new ArrayList<>();
        StringMatch sm = new StringMatch();

        sm.seekLine((s, n) -> {
            results.add(new Result(s, true));
        },
                (s) -> {
                    results.add(new Result(s, false));
                });

        assertEquals(0, results.size());
    }

    public void test_only_true() {
        ArrayList<Result> results = new ArrayList<>();
        StringMatch sm = new StringMatch();

        sm.addCandidate("apple", 1);
        sm.setSource("apple");

        sm.seekLine((OnAccept<Integer>) (s, n) -> {
            results.add(new Result(s, true, n));
        },
                (s) -> {
                    results.add(new Result(s, false));
                });

        assertEquals(1, results.size());
        assertEquals("apple", results.get(0).string);
        assertEquals(true, results.get(0).accepted);
        assertEquals(1, results.get(0).value);
    }

    public void test_only_false() {
        ArrayList<Result> results = new ArrayList<>();
        StringMatch sm = new StringMatch();

        sm.addCandidate("apple", 1);
        sm.setSource("pear");

        sm.seekLine((OnAccept<Integer>) (s, n) -> {
            results.add(new Result(s, true, n));
        },
                (s) -> {
                    results.add(new Result(s, false));
                });

        assertEquals(1, results.size());
        assertEquals("pear", results.get(0).string);
        assertEquals(false, results.get(0).accepted);
    }
//
//    public void test_only_false_then_true() {
//        ArrayList<Result> results = new ArrayList<>();
//        StringMatch sm = new StringMatch();
//
//        sm.addCandidate("apple", 1);
//        sm.setSource("pear apple");
//
//        sm.seekLine((OnAccept<Integer>) (s, n) -> {
//            results.add(new Result(s, true, n));
//        },
//                (s) -> {
//                    results.add(new Result(s, false));
//                });
//
//        assertEquals(2, results.size());
//        assertEquals("pear ", results.get(0).string);
//        assertEquals(false, results.get(0).accepted);
//        assertEquals("apple", results.get(1).string);
//        assertEquals(true, results.get(1).accepted);
//        assertEquals(1, results.get(1).value);
//    }
    
    public void test_only_true_then_false() {
        ArrayList<Result> results = new ArrayList<>();
        StringMatch sm = new StringMatch();

        sm.addCandidate("apple", 1);
        sm.setSource("apple pear");

        sm.seekLine((OnAccept<Integer>) 
            (s, n) -> {
                results.add(new Result(s, true, n));
            },
            (s) -> {
                results.add(new Result(s, false));
            }
        );

        assertEquals(2, results.size());
        assertEquals("apple", results.get(0).string);
        assertEquals(true, results.get(0).accepted);
        assertEquals(1, results.get(0).value);
        assertEquals(" pear", results.get(1).string);
        assertEquals(false, results.get(1).accepted);
    }
}
