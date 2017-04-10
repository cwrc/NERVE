/* global Utility */

class Listeners {
    constructor(view, events, controller) {
        Utility.log(Listeners, "constructor");
        Utility.enforceTypes(arguments, View, Events, Controller);

        this.view = view;
        this.events = events;
        this.controller = controller;

        /* entity dialog box events */
        $("#txtEntity").on("input", (event)=>this.controller.notifyDialogInput("text"));
        $("#txtLemma").on("input", (event)=>this.controller.notifyDialogInput("lemma"));
        $("#txtLink").on("input", (event)=>this.controller.notifyDialogInput("link"));
        $("#selectTagName").on("input", (event)=>this.controller.notifyDialogInput("tag"));
        $("#goLink").click((event)=>this.controller.goLink());

        /* search events */
        $("#searchDialog").click((event) => this.events.showSearchDialog(event));
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
        $("#menuSelectLemma").click((event)=>{event.stopPropagation(); this.controller.selectLikeEntitiesByLemma();});

        $("#menuTag").click((event)=>{event.stopPropagation(); this.events.menuTag();});
        $("#menuUntag").click((event)=>{event.stopPropagation(); this.events.menuUntag();});
        $("#menuFind").click((event)=>{event.stopPropagation(); this.events.menuFind();});
        $("#menuDictDel").click((event)=>{event.stopPropagation(); this.events.menuDelete();});
        $("#menuMerge").click((event)=>{event.stopPropagation(); this.events.menuMerge();});

        $("#dictAdd").click((event)=>{event.stopPropagation(); this.controller.dictAdd();});
        $("#dictRemove").click((event)=>{event.stopPropagation(); this.controller.dictRemove();});
        $("#dictUpdate").click((event)=>{event.stopPropagation(); this.controller.dictUpdate();});

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

        /* key Press Events */
        $(document).keydown((event)=>{
            if (event.ctrlKey || event.metaKey){
                switch(event.key){
                    case "a": this.controller.selectLikeEntitiesByLemma(); break;
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
        this.addTaggedEntity(".taggedentity");

        /* Default Document Click Event */
        $("#entityPanel").click((event) => this.events.documentClick(event));
    }

    /* call every time a new tagged entity is created */
    addTaggedEntity(ele){
        $(ele).click((event)=>{event.stopPropagation(); this.events.taggedEntityClick(event.currentTarget);});
        $(ele).dblclick((event)=>{event.stopPropagation(); this.controller.selectLikeEntitiesByLemma();});
    }

    switchContext(contextName){
        $("#menuORLANDO").removeClass("activeText");
        $("#menuCWRC").removeClass("activeText");
        $("#menuTEI").removeClass("activeText");
        $(`#menu${contextName.toUpperCase()}`).addClass("activeText");
        this.events.menuContextChange(contextName);
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
}