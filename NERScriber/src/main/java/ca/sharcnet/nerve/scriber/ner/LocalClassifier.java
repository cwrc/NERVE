/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package ca.sharcnet.nerve.scriber.ner;

import ca.sharcnet.nerve.scriber.encoder.IClassifier;
import static ca.sharcnet.nerve.scriber.ner.StandaloneNER.LOGGER;
import edu.stanford.nlp.ie.crf.CRFClassifier;
import edu.stanford.nlp.util.CoreMap;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.zip.GZIPInputStream;

/**
 *
 * @author edward
 */
public class LocalClassifier implements IClassifier{
    private String classifierPath;
    private CRFClassifier<CoreMap> classifier;

    public LocalClassifier(String classifierPath) throws IOException, ClassCastException, ClassNotFoundException{
        this.classifierPath = classifierPath;        
        this.initClassifier();
    }
    
    @Override
    public String classify(String input) throws IOException {
        return this.classifier.classifyWithInlineXML(input);
    }
    
    private void initClassifier() throws IOException, ClassCastException, ClassNotFoundException {
        LOGGER.trace("loading classifier");

        File file = new File(this.classifierPath);
        InputStream in = new FileInputStream(file);
        GZIPInputStream gzip = new GZIPInputStream(in);        
        this.classifier = CRFClassifier.getClassifier(gzip);
        in.close();
        
        LOGGER.trace("classifier loaded");
    }    
    
}
