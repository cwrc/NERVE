/* global Utility */

class Listeners {
    constructor(view, events) {
        this.view = view;
        this.events = events;
        this.setupListeners();

        $("#epsNext").click((event)=>{event.stopPropagation(); this.events.searchNext($("#epsTextArea").val());});
        $("#epsPrev").click((event)=>{event.stopPropagation(); this.events.searchPrev($("#epsTextArea").val());});
        $("#epsTextArea").keyup((event)=>{
            if (event.keyCode !== 13) return;
            event.stopPropagation();
            this.events.searchNext($("#epsTextArea").val());
        });

        /* menu Events */
        $("#menuSave").click((event)=>{event.stopPropagation(); this.events.menuSave();});
        $("#menuOpen").click(()=>{event.stopPropagation(); this.events.menuOpen();});
        $("#menuClose").click(()=>{event.stopPropagation(); this.events.menuClose();});

        $("#menuTags").click((event)=>{event.stopPropagation(); this.events.menuShowTagsChange(this.menuShowTags());});
        $("#menuReset").click((event)=>{event.stopPropagation(); this.events.menuResetAll();});
        $("#menuORLANDO").click((event)=>{event.stopPropagation(); this.switchContext("ORLANDO");});
        $("#menuCWRC").click((event)=>{event.stopPropagation(); this.switchContext("CWRC");});
        $("#menuTEI").click((event)=>{event.stopPropagation(); this.switchContext("TEI");});
        $("#menuClear").click((event)=>{event.stopPropagation(); this.events.menuClearSelection();});
        $("#menuUndo").click((event)=>{event.stopPropagation(); this.events.menuUndo();});
        $("#menuRedo").click((event)=>{event.stopPropagation(); this.events.menuRedo();});

        $("#menuTag").click((event)=>{event.stopPropagation(); this.events.menuTag();});
        $("#menuUntag").click((event)=>{event.stopPropagation(); this.events.menuUntag();});
        $("#menuFind").click((event)=>{event.stopPropagation(); this.events.menuFind();});
        $("#menuDictDel").click((event)=>{event.stopPropagation(); this.events.menuDelete();});
        $("#menuMerge").click((event)=>{event.stopPropagation(); this.events.menuMerge();});

        /* key Press Events */
        $(document).keydown((event)=>{
            if (event.ctrlKey || event.metaKey){
                switch(event.key){
                    case "e": this.events.menuTag(); break;
                    case "f": this.events.menuFind(); break;
                    case "u": this.events.menuUntag(); break;
                    case "m": this.events.menuMerge(); break;
                    case "o": this.events.menuOpen(); break;
                    case "r": this.events.menuUntag(); break;
                    case "s": this.events.menuSave(); break;
                    case "y": this.events.menuRedo(); break;
                    case "z": this.events.menuUndo(); break;
                    default: return;
                }
            } else { /* no ctrl/meta */
                switch(event.key){
                    case "Backspace":
                    case "Delete": this.events.menuUntag(); break;
                    case "Escape": this.events.menuClearSelection(); break;
                    default: return;
                }
            }

            event.preventDefault();
            event.stopPropagation();
        });
    }

    switchContext(context){
        $("#menuORLANDO").removeClass("activeText");
        $("#menuCWRC").removeClass("activeText");
        $("#menuTEI").removeClass("activeText");
        $(`#menu${context.toUpperCase()}`).addClass("activeText");
        this.events.menuContextChange(context);
    }

    menuShowTags(){
        let rvalue = false;
        console.log($("#menuTags").data("value"));
        if ($("#menuTags").data("value") === false){
            rvalue = true;
            $("#menuTags").addClass("activeText");
            $("#menuTags").data("value", true);
        } else {
            rvalue = false;
            $("#menuTags").removeClass("activeText");
            $("#menuTags").data("value", false);
        }
        return rvalue;
    }

    addTBListeners(functionId, textBoxId) {
        var element = document.getElementById(textBoxId);
        Utility.assertType(element, Element);
        element.addEventListener('blur',   (event)=>this.events.textBoxBlur(event), false);
        element.addEventListener('click',  (event)=>this.events.textBoxClick(event), false);
        element.addEventListener('input',  (event)=>this.events.textBoxInput(functionId, element.value), false);
        element.addEventListener('change', (event)=>this.events.textBoxChange(functionId, element.value), false);
    }

    setupListeners() {
        this.addTBListeners("setEntity", "txtEntity");
        this.addTBListeners("setLemma", "txtLemma");
        this.addTBListeners("setLink", "txtLink");
        this.addTBListeners("setTagName", "selectTagName");

        document.getElementById("cbDictionary").addEventListener("click", (event) => this.events.cbDictionaryClick(event), false);
        document.getElementById("cbDictionary").addEventListener("change", (event) => this.events.cbDictionaryChange(event), false);
        document.getElementById("selectDictionary").addEventListener("click", (event) => this.events.selDictionaryClick(event), false);
        document.getElementById("selectDictionary").addEventListener(
                "change",
                (event) => this.events.selDictionaryChange(event, document.getElementById("selectDictionary").value),
                false
                );

        document.getElementById("searchDialog").addEventListener("click", (event) => this.events.showSearchDialog(event), false);

        /* Default Document Click Event */
        /* the default click event will clear all selected elements */
        document.addEventListener("click", (event) => this.events.documentClick(event), false);

        /* on the entity panel, pressing ctrl will prevent clearing of selections */
//        document.getElementById("entityPanel").addEventListener("click", (event) => this.events.entityPanelClick(event), false);

        /* control delete and backspace this.events */
        document.addEventListener('keydown', function (event) {
            var d = event.srcElement || event.target;
            if (event.keyCode !== 8 && event.keyCode !== 46) return;
            if (
                    (d.tagName.toUpperCase() === 'INPUT' && d.type.toUpperCase() === 'TEXT') ||
                    (d.tagName.toUpperCase() === 'INPUT' && d.type.toUpperCase() === 'PASSWORD') ||
                    (d.tagName.toUpperCase() === 'INPUT' && d.type.toUpperCase() === 'FILE') ||
                    (d.tagName.toUpperCase() === 'INPUT' && d.type.toUpperCase() === 'SEARCH') ||
                    (d.tagName.toUpperCase() === 'INPUT' && d.type.toUpperCase() === 'EMAIL') ||
                    (d.tagName.toUpperCase() === 'INPUT' && d.type.toUpperCase() === 'NUMBER') ||
                    (d.tagName.toUpperCase() === 'INPUT' && d.type.toUpperCase() === 'DATE') ||
                    (d.tagName.toUpperCase() === 'TEXTAREA') ||
                    (d.hasAttribute("contenteditable") && d.getAttribute("contenteditable") === "true")
                    ) {
                event.stopPropagation();
                return;
            }

            event.preventDefault();
        }, true);
    }
}