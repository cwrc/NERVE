/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package ca.sharcnet.nerve.service.services;

import ca.sharcnet.nerve.scriber.encoder.IClassifier;
import static ca.sharcnet.nerve.service.services.ServiceBase.LOGGER;
import edu.stanford.nlp.ie.crf.CRFClassifier;
import edu.stanford.nlp.util.CoreMap;
import java.io.IOException;
import java.io.InputStream;
import java.util.zip.GZIPInputStream;

/**
 *
 * @author Ed Armstrong
 */
public class LocalClassifier implements IClassifier{
    private final CRFClassifier<CoreMap> classifier;

    /**
     * "/WEB-INF/english.all.3class.distsim.crf.ser.gz"
     * @param classifierPath 
     */
    public LocalClassifier(InputStream classifierStream) throws IOException, ClassCastException, ClassNotFoundException{
        GZIPInputStream gzip = new GZIPInputStream(classifierStream);
        this.classifier = CRFClassifier.getClassifier(gzip);
    }
    
    @Override
    public String classify(String input) {
        return this.classifier.classifyWithInlineXML(input);
    }
    
}
