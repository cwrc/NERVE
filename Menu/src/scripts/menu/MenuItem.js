const jQuery = require("jquery");
const $ = jQuery;
const Widget = require("@thaerious/nidget").Widget;

/*
 * Valid setting : settingObject values
 * event : string
 * disabled : bool
 * shortcut : {key : string, ctrl : bool, alt : bool, shift : bool}
 */

class MenuItem extends Widget {
    constructor(text, delegate, jsonObject) {
        super(`<div class='menu_item'></div>`, delegate);
        this.menuText = $(`<div class='menu_item_text'>${text}</div>`);        
        this.$.append(this.menuText);
        this.shortcut = null;
        this.eventName = "onMenu" + text.replace(/\s/g, '');
        this.active = true;

        this.$.click(async (event) => {
            if (this.active) this.notifyListeners(this.eventName);
            event.stopPropagation();
        });
        
        if (jsonObject !== undefined){
            for (let setting in jsonObject){
                this.set(setting, jsonObject[setting]);
            }
        }
    }

    set(setting, settingObject){
        switch(setting.toLowerCase()){
            case "event":
                this.setEventName(settingObject);
            break;
            case "disabled":
                this.disabled(settingObject);
            break;        
            case "shortcut":
                this.setKey(settingObject.key, settingObject.ctrl, settingObject.alt, settingObject.shift, settingObject.text);
            break;                
        }
    }

    text(text) {
        if (text === undefined) {
            return this.menuText.text();
        }
        this.menuText.text(text);
    }

    setEventName(eventName) {
        this.eventName = eventName;
        return this;
    }

    disabled(value){
        this.active = !value;
        if (this.active){
            this.$.removeClass("disabled");
        } else {
            this.$.addClass("disabled");
        }
    }

    setKey(key, ctrl = true, alt = false, shift = false, text = null) {
        if (this.shortcut !== null) {
            this.shortcut.detach();
        }

        if (text === null){
            text = key.toUpperCase();
            if (shift) text = "SHIFT " + text;
            if (ctrl) text = "CTRL " + text;
            if (alt) text = "ALT " + text;
        }
        
        this.shortcut = $(`<div class='menu_shortcut'>${text}</div>`);
        this.$.append(this.shortcut);

        $(document).keydown((event) => {
            if (!this.active) return;
            let evtCtrl = false;
            if (event.ctrlKey || event.metaKey) evtCtrl = true;           
            if (event.key.toLowerCase() !== key.toLowerCase()) return;
            if (evtCtrl !== ctrl) return;
            if (event.altKey !== alt) return;
            if (event.shiftKey !== shift) return;
            this.notifyListeners(this.eventName);
            event.preventDefault();
            event.stopPropagation();
        });

        return this;
    }
}

module.exports = MenuItem;