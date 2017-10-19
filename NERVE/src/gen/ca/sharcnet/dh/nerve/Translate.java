/* generated 2017/10/13 14:47:14 */
package ca.sharcnet.dh.nerve;
@ca.fa.jjjrmi.annotations.NativeJS
@ca.fa.jjjrmi.annotations.RMI(value = "Translate")
public class Translate extends ca.fa.jjjrmi.socket.RMISocket implements ca.sharcnet.nerve.HasStreams , ca.sharcnet.nerve.IsMonitor {
    @ca.fa.jjjrmi.annotations.SkipJS
    public Translate() {
        super();
    }

    private void setView(java.lang.Object view) {
        /* JS{
        this.view = view;
        this.phaseName = "";
        }
         */
    }

    @ca.fa.jjjrmi.annotations.ServerSide
    public java.lang.String encode(java.lang.String source) throws java.io.IOException, java.lang.ClassNotFoundException, java.lang.IllegalAccessException, java.lang.InstantiationException, java.sql.SQLException, javax.xml.parsers.ParserConfigurationException {
        ca.sharcnet.nerve.docnav.dom.Document document = ca.sharcnet.nerve.docnav.DocumentLoader.documentFromString(source);
        ca.sharcnet.nerve.docnav.dom.Document encoded = ca.sharcnet.nerve.encoder.Encoder.encode(document, this, this);
        return encoded.toString();
    }

    @ca.fa.jjjrmi.annotations.ServerSide
    public java.lang.String decode(java.lang.String source) throws java.io.IOException, java.lang.ClassNotFoundException, java.lang.IllegalAccessException, java.lang.IllegalArgumentException, java.lang.InstantiationException, java.sql.SQLException, javax.xml.parsers.ParserConfigurationException {
        ca.sharcnet.nerve.docnav.dom.Document document = ca.sharcnet.nerve.docnav.DocumentLoader.documentFromString(source);
        ca.sharcnet.nerve.docnav.dom.Document decoded = ca.sharcnet.nerve.decode.Decoder.decode(document, this);
        decoded.query("doc").extract();
        return decoded.toString();
    }

    @ca.fa.jjjrmi.annotations.SkipJS
    @java.lang.Override
    public java.io.InputStream getResourceStream(java.lang.String path) {
        return ca.sharcnet.nerve.encoder.Encoder.class.getResourceAsStream(("/res/" + path));
    }

    @ca.fa.jjjrmi.annotations.SkipJS
    public void phase(java.lang.String phase, int i, int phaseMax) {
        this.onPhase(phase, i, phaseMax);
    }

    @ca.fa.jjjrmi.annotations.SkipJS
    public void step(int i, int stepMax) {
        this.onStep(i, stepMax);
    }

    @ca.fa.jjjrmi.annotations.ClientSide
    public ca.fa.jjjrmi.socket.InvocationAsyncRequest<java.lang.Void> onPhase(java.lang.String phase, int i, int max) {
        return getWebsocket().<java.lang.Void>invokeClientMethod(this, "onPhase",phase,i,max);
    }

    @ca.fa.jjjrmi.annotations.ClientSide
    public ca.fa.jjjrmi.socket.InvocationAsyncRequest<java.lang.Void> onStep(int i, int max) {
        return getWebsocket().<java.lang.Void>invokeClientMethod(this, "onStep",i,max);
    }
}