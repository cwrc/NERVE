/* generated 2018/01/18 08:44:01 */
package ca.sharcnet.dh.nerve;
@ca.fa.jjjrmi.annotations.NativeJS(value = "Scriber")
@ca.fa.jjjrmi.annotations.Generated
public class Scriber extends ca.sharcnet.dh.nerve.AScriber {
    @ca.fa.jjjrmi.annotations.SkipJS
    public Scriber() {
        super();
    }

    public void onPhase(java.lang.String phase, int i, int max) {
        		for (ca.fa.jjjrmi.socket.InvokesMethods invokes : this.getWebsockets()){
			invokes.invokeClientMethod(this, "onPhase",phase,i,max);
};
    }

    public void onStep(int i, int max) {
        		for (ca.fa.jjjrmi.socket.InvokesMethods invokes : this.getWebsockets()){
			invokes.invokeClientMethod(this, "onStep",i,max);
};
    }
}