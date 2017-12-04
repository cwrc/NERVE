/* generated 2017/12/04 10:38:53 */
package ca.sharcnet.dh.nerve;
@ca.fa.jjjrmi.annotations.NativeJS(value = "Scriber")
@ca.fa.jjjrmi.annotations.Generated
public class Scriber extends ca.sharcnet.dh.nerve.AScriber {
    @ca.fa.jjjrmi.annotations.SkipJS
    public Scriber() {
        super();
    }

    public ca.fa.jjjrmi.socket.AsyncInvocation<java.lang.Void> onPhase(java.lang.String phase, int i, int max) {
        	return getWebsocket().<java.lang.Void>invokeClientMethod(this, "onPhase",phase,i,max);
    }

    public ca.fa.jjjrmi.socket.AsyncInvocation<java.lang.Void> onStep(int i, int max) {
        	return getWebsocket().<java.lang.Void>invokeClientMethod(this, "onStep",i,max);
    }
}