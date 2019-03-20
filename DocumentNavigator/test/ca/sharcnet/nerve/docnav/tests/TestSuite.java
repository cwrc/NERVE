package ca.sharcnet.nerve.docnav.tests;
import org.junit.runner.RunWith;
import org.junit.runners.Suite;

@RunWith(Suite.class)
@Suite.SuiteClasses({
    ca.sharcnet.nerve.docnav.tests.A_NodeTest.class,
    ca.sharcnet.nerve.docnav.tests.B_NodeTest.class,
    ca.sharcnet.nerve.docnav.tests.C_NodeTest.class,
    ca.sharcnet.nerve.docnav.tests.DocumentTest.class,
    ca.sharcnet.nerve.docnav.tests.QueryTest.class,
    ca.sharcnet.nerve.docnav.tests.QueryOperationsTest.class,
    ca.sharcnet.nerve.docnav.tests.NodeListTest.class,
    ca.sharcnet.nerve.docnav.tests.RelaxNGSchemaTest.class,
    ca.sharcnet.nerve.docnav.tests.QueryFTest.class,
    ca.sharcnet.nerve.docnav.tests.MultiRoot.class
})

public class TestSuite {}
