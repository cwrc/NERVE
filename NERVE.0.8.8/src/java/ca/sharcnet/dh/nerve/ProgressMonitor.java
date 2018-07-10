/* generated 2018/07/10 14:33:33 */
package ca.sharcnet.dh.nerve;
@ca.frar.jjjrmi.annotations.JJJ("ProgressMonitor")
@ca.frar.jjjrmi.annotations.JJJOptions(jsExtends = "require('../mvc/model/AbstractModel')")
@ca.frar.jjjrmi.annotations.Generated
public class ProgressMonitor extends ca.sharcnet.dh.nerve.AProgressMonitor implements ca.frar.jjjrmi.translator.HasWebsockets {
    @ca.frar.jjjrmi.annotations.NativeJS
    public ProgressMonitor() {
        super();
    }

    @ca.frar.jjjrmi.annotations.Transient
    private java.util.ArrayList<ca.frar.jjjrmi.socket.InvokesMethods> websockets = new java.util.ArrayList<ca.frar.jjjrmi.socket.InvokesMethods>();

    public java.util.Collection<ca.frar.jjjrmi.socket.InvokesMethods> getWebsockets() {
        return this.websockets;
    }

    public void addWebsocket(ca.frar.jjjrmi.socket.InvokesMethods websocket) {
        this.websockets.add(websocket);
    }

    public void removeWebsocket(ca.frar.jjjrmi.socket.InvokesMethods websocket) {
        this.websockets.remove(websocket);
    }

    public void forget() {
        getWebsockets().forEach(s->s.forget(this));
    }

    public void notifyProgress(ca.sharcnet.nerve.ProgressPacket pp) {
        super.notifyProgress(pp);
        Object[] args = {pp};
        for (ca.frar.jjjrmi.socket.InvokesMethods invokes : this.getWebsockets()){
        	invokes.invokeClientMethod(this, "notifyProgress", args);
        };
    }
}