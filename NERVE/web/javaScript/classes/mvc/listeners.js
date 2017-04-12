/* global Utility */

class Listeners {
    constructor(view, controller) {
        Utility.log(Listeners, "constructor");
        Utility.enforceTypes(arguments, View, Controller);

        this.view = view;
        this.controller = controller;

        /* entity dialog box events */
        $("#txtEntity").on("input", (event)=>this.controller.notifyDialogInput("text"));
        $("#txtLemma").on("input", (event)=>this.controller.notifyDialogInput("lemma"));
        $("#txtLink").on("input", (event)=>this.controller.notifyDialogInput("link"));
        $("#selectTagName").on("input", (event)=>this.controller.notifyDialogInput("tag"));
        $("#goLink").click((event)=>this.controller.goLink());

        /* search events */
        $("#searchDialog").click((event) =>{event.stopPropagation(); this.controller.showSearchDialog();});
        $("#epsNext").click((event)=>{event.stopPropagation(); this.controller.search($("#epsTextArea").val(), "next");});
        $("#epsPrev").click((event)=>{event.stopPropagation(); this.controller.search($("#epsTextArea").val(), "prev");});

        $("#epsTextArea").keyup((event)=>{
            if (event.keyCode !== 13) return;
            event.stopPropagation();
            this.controller.search($("#epsTextArea").val(), "next");
        });

        /* menu events */
        $("#menuSave").click((event)=>{event.stopPropagation(); this.controller.saveContents();});
        $("#menuOpen").click(()=>{event.stopPropagation(); this.controller.loadDocument();});
        $("#menuClose").click(()=>{event.stopPropagation(); this.controller.closeDocument();});

        $("#menuTags").click((event)=>{event.stopPropagation();  this.menuShowTags();});
        $("#menuReset").click((event)=>{event.stopPropagation(); localStorage.clear(); location.reload(true);});
        $("#menuClear").click((event)=>{event.stopPropagation(); this.controller.unselectAll();});
        $("#menuUndo").click((event)=>{event.stopPropagation(); this.controller.unselectAll(); this.model.revertState();});
        $("#menuRedo").click((event)=>{event.stopPropagation(); this.controller.unselectAll(); this.model.advanceState();});
        $("#menuCopy").click((event)=>{event.stopPropagation(); this.controller.copyInfo();});
        $("#menuPaste").click((event)=>{event.stopPropagation(); this.controller.pasteInfo();});
        $("#menuSelectLemma").click((event)=>{event.stopPropagation(); this.controller.selectLikeEntitiesByLemma();});

        $("#menuTag").click((event)=>{event.stopPropagation(); this.controller.tagSelectedRange();});
        $("#menuUntag").click((event)=>{event.stopPropagation(); this.controller.untagAll();});
        $("#menuFind").click((event)=>{event.stopPropagation(); this.controller.fillFind();});
        $("#menuMerge").click((event)=>{event.stopPropagation(); this.controller.mergeSelectedEntities();});

        $("#dictAdd").click((event)=>{event.stopPropagation(); this.controller.dictAdd();});
        $("#dictRemove").click((event)=>{event.stopPropagation(); this.controller.dictRemove();});
        $("#dictUpdate").click((event)=>{event.stopPropagation(); this.controller.dictUpdate();});

        /* the ability to switch context is deprecated */
        $("#menuORLANDO").click((event)=>{event.stopPropagation(); this.switchContext("ORLANDO");});
        $("#menuCWRC").click((event)=>{event.stopPropagation(); this.switchContext("CWRC");});
        $("#menuTEI").click((event)=>{event.stopPropagation(); this.switchContext("TEI");});

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
        $("#entityPanel").click((event) => this.documentClick(event));
    }

    documentClick(event){
        if (event.altKey){
            /* strictly for debugging */
            console.log(event);
            window.debug = event.target;
            console.log(event.target);
            return;
        }

        if (event.ctrlKey) return;
        this.controller.unselectAll();
        event.stopPropagation();
    }

    /* call every time a new tagged entity is created */
    addTaggedEntity(ele){
        $(ele).click((event)=>{event.stopPropagation(); this.taggedEntityClick(event.currentTarget);});
        $(ele).dblclick((event)=>{event.stopPropagation(); this.controller.selectLikeEntitiesByLemma();});
    }

    taggedEntityClick(taggedEntity) {
        Utility.log(Events, "taggedEntityClick");
        Utility.enforceTypes(arguments, HTMLDivElement);

        if (window.event.altKey) {
            /* strictly for debugging */
            window.debug = taggedEntity;
            console.log(taggedEntity);
            event.stopPropagation();
        } else {
            if (!event.ctrlKey && !event.metaKey) {
                this.controller.setSelected(taggedEntity);
            } else {
                this.controller.toggleSelect(taggedEntity);
            }
            event.stopPropagation();
        }
    }

    /* context switching is deprecated */
    switchContext(contextName){
        window.alert("'Switch Schema' is deprectated; the context/schema is now detected from the file.  In future releases this menu option will be removed.");
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

        if (rvalue === true){
            this.view.attachStyle("tags.css");
        } else {
            this.view.detachStyle("tags.css");
        }
    }
}