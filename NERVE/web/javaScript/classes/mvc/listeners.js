/* global Utility */

class Listeners {
    constructor(view, events) {
        this.view = view;
        this.events = events;

        /* entity dialog box events */
        this.setupListeners();

        /* search events */
        $("#epsNext").click((event)=>{event.stopPropagation(); this.events.searchNext($("#epsTextArea").val());});
        $("#epsPrev").click((event)=>{event.stopPropagation(); this.events.searchPrev($("#epsTextArea").val());});
        $("#epsTextArea").keyup((event)=>{
            if (event.keyCode !== 13) return;
            event.stopPropagation();
            this.events.searchNext($("#epsTextArea").val());
        });

        /* menu events */
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
        $("#menuCopy").click((event)=>{event.stopPropagation(); this.events.menuCopy();});
        $("#menuPaste").click((event)=>{event.stopPropagation(); this.events.manuPaste();});        

        $("#menuTag").click((event)=>{event.stopPropagation(); this.events.menuTag();});
        $("#menuUntag").click((event)=>{event.stopPropagation(); this.events.menuUntag();});
        $("#menuFind").click((event)=>{event.stopPropagation(); this.events.menuFind();});
        $("#menuDictDel").click((event)=>{event.stopPropagation(); this.events.menuDelete();});
        $("#menuMerge").click((event)=>{event.stopPropagation(); this.events.menuMerge();});

        /* key Press Events */
        $(document).keydown((event)=>{
            if (event.ctrlKey || event.metaKey){
                switch(event.key){
                    case "c": this.events.menuCopy(); break;
                    case "e": this.events.menuTag(); break;
                    case "f": this.events.menuFind(); break;
                    case "u": this.events.menuUntag(); break;
                    case "m": this.events.menuMerge(); break;
                    case "o": this.events.menuOpen(); break;
                    case "r": this.events.menuUntag(); break;
                    case "s": this.events.menuSave(); break;
                    case "v": this.events.menuPaste(); break;
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

        /* entity & document events */
        $(".taggedentity").click((event)=>events.taggedEntityClick(event.currentTarget));
        $(".taggedentity").dblclick((event)=>events.taggedEntityClick(event.currentTarget));
        
        /* Default Document Click Event */
        $(document).click((event) => this.events.documentClick(event));     
    }

    addTaggedEntity(ele){
        $(ele).click((event)=>this.events.taggedEntityClick(event.currentTarget));
        $(ele).dblclick((event)=>this.events.taggedEntityClick(event.currentTarget));
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

    setupListeners() {
        /* text box listeners */
        $("#txtEntity").blur((event)=>this.events.textBoxBlur(event));
        $("#txtLemma").blur((event)=>this.events.textBoxBlur(event));
        $("#txtLink").blur((event)=>this.events.textBoxBlur(event));
        $("#selectTagName").blur((event)=>this.events.textBoxBlur(event));

        $("#txtEntity").click((event)=>this.events.textBoxClick(event));
        $("#txtLemma").click((event)=>this.events.textBoxClick(event));
        $("#txtLink").click((event)=>this.events.textBoxClick(event));
        $("#selectTagName").click((event)=>this.events.textBoxClick(event));

        $("#txtEntity").change((event)=>this.events.textBoxChange(event));
        $("#txtLemma").change((event)=>this.events.textBoxChange(event));
        $("#txtLink").change((event)=>this.events.textBoxChange(event));
        $("#selectTagName").change((event)=>this.events.textBoxChange(event));

        $("#txtEntity").on("input", (event)=>this.events.textBoxInput(event));
        $("#txtLemma").on("input", (event)=>this.events.textBoxInput(event));
        $("#txtLink").on("input", (event)=>this.events.textBoxInput(event));
        $("#selectTagName").on("input", (event)=>this.events.textBoxInput(event));

        document.getElementById("cbDictionary").addEventListener("click", (event) => this.events.cbDictionaryClick(event), false);
        document.getElementById("cbDictionary").addEventListener("change", (event) => this.events.cbDictionaryChange(event), false);
        document.getElementById("selectDictionary").addEventListener("click", (event) => this.events.selDictionaryClick(event), false);
        document.getElementById("selectDictionary").addEventListener(
                "change",
                (event) => this.events.selDictionaryChange(event, document.getElementById("selectDictionary").value),
                false
                );

        document.getElementById("searchDialog").addEventListener("click", (event) => this.events.showSearchDialog(event), false);



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