/* generated 2019/04/15 15:38:57 */
package ca.sharcnet.dh.nerve;
@ca.frar.jjjrmi.annotations.JJJ("ProgressMonitor")
@ca.frar.jjjrmi.annotations.JJJOptions(jsExtends = "require('@thaerious/nidget').AbstractModel")
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

    public void end() {
        super.end();
        Object[] args = {};
        for (ca.frar.jjjrmi.socket.InvokesMethods invokes : this.getWebsockets()){
        	invokes.invokeClientMethod(this, "end", args);
        };
    }

    public void start(java.lang.String message) {
        super.start(message);
        Object[] args = {message};
        for (ca.frar.jjjrmi.socket.InvokesMethods invokes : this.getWebsockets()){
        	invokes.invokeClientMethod(this, "start", args);
        };
    }

    public void updateMessage(java.lang.String message) {
        super.updateMessage(message);
        Object[] args = {message};
        for (ca.frar.jjjrmi.socket.InvokesMethods invokes : this.getWebsockets()){
        	invokes.invokeClientMethod(this, "updateMessage", args);
        };
    }

    public void updateProgress(int i) {
        super.updateProgress(i);
        Object[] args = {i};
        for (ca.frar.jjjrmi.socket.InvokesMethods invokes : this.getWebsockets()){
        	invokes.invokeClientMethod(this, "updateProgress", args);
        };
    }
}