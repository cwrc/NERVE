const $ = window.$ ? window.$ : require("jquery");
const Widget = require("@thaerious/nidget").Widget;

class NidgetMenuItem extends Widget {
    constructor(nidgetContextMenu, labelText, options, handler) {
        super(`<div class="nidget-context-menuitem"></div>`);
        this.nidgetContextMenu = nidgetContextMenu;
        this.label = $(` <div class="nidget-context-label">${labelText}</div>`);
        this.image = $(`<img class="nidget-context-left-image" src=""/>`);
        this.throbber = $(`<img class="nidget-context-right-image nidget-context-image-throbber" src="assets/nidgetcontext/loader400.gif"/>`);       
        
        this.$.append(this.image);
        this.$.append(this.label);
        this.$.append(this.throbber);

        this.image.hide();

        this.options = {
            async : false,
            close_menu : true
        };
        
        if (typeof options === "function") {
            this.handler = options;
        } else if (typeof options === "object") {
            for (let field in options) this.options[field] = options[field];            
            if (typeof handler === "function") this.handler = handler;
        }

        if (this.handler){
            if (this.options.async){
                this.__setupAsyncClick();
            }
            else if (!this.options.async){
                this.__setupSyncClick();    
            }
        }
        else{
            this.__setupNoHandler();
        }
    }

    setImage(imagePath){
        this.image.attr("src", imagePath);
        this.image.show();
    }

    __setupNoHandler(){
        this.$.click((event) => {
            if (this.options.close_menu) this.nidgetContextMenu.hide();
            event.stopPropagation();
        });
    }

    __setupAsyncClick() {
        this.$.click(async (event) => {
            if (this.label.hasClass("disabled")) return;
            this.throbber.show();
            await this.handler();
            this.throbber.hide();
            if (this.options.close_menu) this.nidgetContextMenu.hide();
            event.stopPropagation();
        });
    }

    __setupSyncClick() {
        this.$.click((event) => {
            if (this.label.hasClass("disabled")) return;
            this.handler();
            if (this.options.close_menu) this.nidgetContextMenu.hide();
            event.stopPropagation();
        });
    }

    enable() {
        this.label.removeClass("disabled");
        return this;
    }

    disable() {
        this.label.addClass("disabled");
        return this;
    }
}

class NidgetContextBase extends Widget {

    constructor(element, delegate){
        super(element, delegate);
        this.menuItems = new Map();
    }

    getMenuItem(displayString){
        return this.menuItems.get(displayString);
    }

    notifyContextChange(context) {
        this.context = context;
    }

    setDictionary(dictionary) {
        this.dictionary = dictionary;
    }

    /**
     * Shows the context menu.
     * @param {type} event contextmenu dom event.
     * @returns {undefined}
     */
    show(event){
        this.$.show();
        this.position(this.$.get(0), event);
        this.notifyListeners("notifyContextShow", this);
    }
    
    hide(){
        this.$.hide();
    }

    position(element, event) {
        let posX = event.clientX - 5;
        let posY = event.clientY - 5;
        element.style.left = posX + "px";
        element.style.top = posY + "px";
    }
}

class NidgetContext extends NidgetContextBase{
    constructor(delegate) {
        super(`<div class="nidget-context-dialog nidget-context-menu"></div>`, delegate);
        $("body").append(this.$);
        
        this.$.on("contextmenu", ()=>{
            this.hide();
            return false;
        });

        this.hide();
    }

    /**
     * Add a new clickable menu item.  Options can be omitted and the
     * method signature addMenuItem(displayString, handler) used.
     * 
     * options = {
     *   async : boolean [false],
     *   close_menu : boolean [true]
     * }
     * 
     * async = true, calls the handler with async,
     * close_menu = true, closes the context menu when this button is clicked
     * @param {type} displayString The string displayed to the user.
     * @param {type} options see desc.
     * @param {type} handler event to call when button is clicked, click event is passed in.
     * @returns {NidgetMenuItem|NidgetContext.addMenuItem.menuItem|nm$_NidgetContext.NidgetContext.addMenuItem.menuItem}
     */
    addMenuItem(displayString, options, handler) {
        let menuItem = new NidgetMenuItem(this, displayString, options, handler);
        this.$.append(menuItem.$);
        this.menuItems.set(menuItem);
        return menuItem;
    }

    /**
     * Add a submenu to which menu items can be added.
     * @param {type} displayString
     * @param {type} options
     * @returns {NidgetContext.addSubMenu.menuItem|nm$_NidgetContext.NidgetSubMenu|nm$_NidgetContext.NidgetContext.addSubMenu.menuItem}
     */
    addSubMenu(displayString, options) {
        let menuItem = new NidgetSubMenu(this, displayString, options);
        this.$.append(menuItem.$);
        this.menuItems.set(menuItem);
        return menuItem;
    }
}

class NidgetSubMenu extends NidgetContextBase{
    constructor(nidgetContextMenu, labelText, options = {}) {
        super(`<div class="nidget-context-menuitem"></div>`);

        this.image = $(`<img class="nidget-context-left-image" src=""/>`);
        this.label = $(` <div class="nidget-context-label">${labelText}</div>`);        
        this.arrow = $(`<img class="nidget-context-right-arrow" src="assets/nidgetcontext/submenu_arrow.png"/>`);               
        this.container = $(`<div class="nidget-context-submenu nidget-context-menu"><div>`);
    
        this.nidgetContextMenu = nidgetContextMenu;
    
        this.orgLeft = this.container.css("left");
    
        this.$.append(this.image);
        this.$.append(this.label);
        this.$.append(this.arrow);
        this.$.append(this.container);
        
        this.container.hide();
        
        this.$.on("mouseenter", ()=>{
            this.showContainer();
        });
        
        this.$.on("mouseleave", ()=>{
            this.hideContainer();
        });        
    }
    
    addMenuItem(displayString, options, handler) {
        let menuItem = new NidgetMenuItem(this.nidgetContextMenu, displayString, options, handler);
        this.container.append(menuItem.$);
        this.menuItems.set(menuItem);
        return menuItem;
    }

    addSubMenu(displayString, options) {
        let menuItem = new NidgetSubMenu(this.nidgetContextMenu, displayString, options);
        this.container.append(menuItem.$);
        this.menuItems.set(menuItem);
        return menuItem;
    }    
    
    showContainer(){
        this.showContainerTO = window.setTimeout(()=>{
            this.container.show();
            this.__positionContainer();
            this.showContainerTO = null;
        }, 200);
    }
    
    __positionContainer(){
        if (!this.orgLeft) this.orgLeft = this.container.css("left");
        
        this.container.get(0).style.left = this.orgLeft;
        let right = this.container.offset().left + this.container.width();
        let diff = $("body").innerWidth() - right;        
        
        if (diff < 0){
            let pos = `calc(${this.orgLeft} + ${diff}px)`;
            this.container.get(0).style.left = pos;
        }         
    }
    
    hideContainer(){
        if (this.showContainerTO !== null){
            window.clearTimeout(this.showContainerTO);
            this.showContainerTO = null;
        } else {
            this.container.hide();
        }
    }    
}

module.exports = NidgetContext;