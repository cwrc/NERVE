/* generated 2018/02/08 14:35:22 */
package ca.sharcnet.dh.nerve;
@ca.fa.jjjrmi.annotations.NativeJS(value = "Scriber")
@ca.fa.jjjrmi.annotations.Generated
public class Scriber extends ca.sharcnet.dh.nerve.AScriber {
    public Scriber() {
        super();
    }

    public void notifyProgress(ca.sharcnet.nerve.ProgressPacket packet) {
        super.notifyProgress(packet);
		for (ca.fa.jjjrmi.socket.InvokesMethods invokes : this.getWebsockets()){
			invokes.invokeClientMethod(this, "notifyProgress",packet);
};
    }
}