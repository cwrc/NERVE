/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package ca.sharcnet.nerve.scriber.integration;

/**
 *
 * @author edward
 */
public class TestInformation {
    private String rootPath = "src/test/resources/";
    private String documentFilename = null;
    private String schemaFilename = null;
    private String contextFilename = null;
    private String configFilename = "config.properties";
    private String schemaUrl = null;
    
    /**
     * @return the documentFilename
     */
    public String getDocumentFilename() {
        if (documentFilename == null) return null;
        return rootPath + documentFilename;
    }

    /**
     * @return the schemaFilename
     */
    public String getSchemaFilename() {
        if (schemaFilename == null) return null;
        return rootPath + schemaFilename;
    }

    /**
     * @return the schemaFilename
     */
    public String getSchemaURL() {
        return schemaUrl;
    }
        
    /**
     * @return the contextFilename
     */
    public String getContextFilename() {
        if (contextFilename == null) return null;
        return rootPath + contextFilename;
    }

    /**
     * @return the configFilename
     */
    public String getConfigFilename() {
        if (configFilename == null) return null;
        return rootPath + configFilename;
    }

    public TestInformation root(String rootPath) {
        this.rootPath = rootPath;
        return this;
    }

    public TestInformation doc(String documentFilename) {
        this.documentFilename = documentFilename;
        return this;
    }

    public TestInformation schema(String schemaFilename) {
        this.schemaFilename = schemaFilename;
        return this;
    }

    public TestInformation schemaURL(String schemaUrl) {
        this.schemaUrl = schemaUrl;
        return this;
    }    
    
    public TestInformation context(String contextFilename) {
        this.contextFilename = contextFilename;
        return this;
    }

    public TestInformation config(String configFilename) {
        this.configFilename = configFilename;
        return this;
    }
}
