/* global Utility */

class Listeners {
    constructor(view, controller) {
        Utility.log(Listeners, "constructor");
        Utility.enforceTypes(arguments, View, Controller);

        this.view = view;
        this.controller = controller;

        /* entity dialog box events -- this section has a state */
        this.entityValues = null;
        $("#txtEntity").on("input", () => {
            if (this.entityValues === null) this.entityValues = {};
            this.entityValues.entity = $("#txtEntity").val();
        });
        $("#txtLemma").on("input", () => {
            if (this.entityValues === null) this.entityValues = {};
            this.entityValues.lemma = $("#txtEntity").val();
        });
        $("#txtLink").on("input", () => {
            if (this.entityValues === null) this.entityValues = {};
            this.entityValues.link = $("#txtEntity").val();
        });

        $(".entityDialogTB").blur(() => {
            if (this.entityValues !== null) this.controller.updateAllSelected(this.entityValues);
            this.entityValues = null;
        });
        /* end of section with a state */

        $("#selectTagName").on("input", (event) => {
            this.controller.updateAllSelected({tagName: $("#selectTagName").val()});
        });

        $("#goLink").click((event) => this.controller.goLink());

        /* search events */
        $("#searchDialog").click((event) => {
            event.stopPropagation();
            this.controller.showSearchDialog();
        });
        $("#epsNext").click((event) => {
            event.stopPropagation();
            this.controller.search($("#epsTextArea").val(), "next");
        });
        $("#epsPrev").click((event) => {
            event.stopPropagation();
            this.controller.search($("#epsTextArea").val(), "prev");
        });

        $("#epsTextArea").keyup((event) => {
            if (event.keyCode !== 13) return;
            event.stopPropagation();
            this.controller.search($("#epsTextArea").val(), "next");
        });

        /* menu events key events fire these events */
        $("#menuSave").click((event) => {
            event.stopPropagation();
            this.controller.saveContents();
        });
        $("#menuOpen").click((event) => {
            event.stopPropagation();
            this.controller.loadDocument();
        });
        $("#menuClose").click((event) => {
            event.stopPropagation();
            this.controller.closeDocument();
        });

        $("#menuTags").click((event) => {
            event.stopPropagation();
            this.menuShowTags();
        });
        $("#menuReset").click((event) => {
            event.stopPropagation();
            localStorage.clear();
            location.reload(true);
        });
        $("#menuClear").click((event) => {
            event.stopPropagation();
            this.controller.unselectAll();
        });
        $("#menuUndo").click((event) => {
            event.stopPropagation();
            this.controller.revertState();
        });
        $("#menuRedo").click((event) => {
            event.stopPropagation();
            this.controller.advanceState();
        });
        $("#menuCopy").click((event) => {
            event.stopPropagation();
            this.controller.copyInfo();
        });
        $("#menuPaste").click((event) => {
            event.stopPropagation();
            this.controller.pasteInfo();
        });
        $("#menuSelectLemma").click((event) => {
            event.stopPropagation();
            this.controller.selectLikeEntitiesByLemma();
        });

        $("#menuTag").click((event) => {
            event.stopPropagation();
            this.controller.tagSelectedRange();
        });
        $("#menuUntag").click((event) => {
            event.stopPropagation();
            this.controller.untagAll();
        });
        $("#menuFind").click((event) => {
            event.stopPropagation();
            this.controller.fillFind();
        });
        $("#menuMerge").click((event) => {
            event.stopPropagation();
            this.controller.mergeSelectedEntities();
        });

        $("#dictAdd").click((event) => {
            event.stopPropagation();
            this.controller.dictAdd();
        });
        $("#dictRemove").click((event) => {
            event.stopPropagation();
            this.controller.dictRemove();
        });
        $("#dictUpdate").click((event) => {
            event.stopPropagation();
            this.controller.dictUpdate();
        });

        /* the ability to switch context is deprecated */
        $("#menuORLANDO").click((event) => {
            event.stopPropagation();
            this.switchContext("ORLANDO");
        });
        $("#menuCWRC").click((event) => {
            event.stopPropagation();
            this.switchContext("CWRC");
        });
        $("#menuTEI").click((event) => {
            event.stopPropagation();
            this.switchContext("TEI");
        });

        $("#menuWiki").click((event) => {
            var win = window.open("https://github.com/cwrc/NERVE/wiki", '_blank');
            win.focus();
        });

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
        $(document).keydown((event) => {
            var d = event.srcElement || event.target;
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
                console.log(d.tagName);
                event.stopPropagation();
                return;
            }

            if (event.ctrlKey || event.metaKey) {
                switch (event.key) {
                    case "a":
                        $("#menuSelectLemma").click();
                        break;
                    case "c":
                        $("#menuCopy").click();
                        break;
                    case "e":
                        $("#menuTag").click();
                        break;
                    case "f":
                        $("#menuFind").click();
                        break;
                    case "m":
                        $("#menuMerge").click();
                        break;
                    case "o":
                        $("#menuOpen").click();
                        break;
                    case "r":
                        $("#menuUntag").click();
                        break;
                    case "s":
                        $("#menuSave").click();
                        break;
                    case "v":
                        $("#menuPaste").click();
                        break;
                    case "y":
                        $("#menuRedo").click();
                        break;
                    case "z":
                        $("#menuUndo").click();
                        break;
                    default:
                        return;
                }
            } else { /* no ctrl/meta */
                switch (event.key) {
                    case "Backspace":
                    case "Delete":
                        $("#menuUntag").click();
                        break;
                    case "Escape":
                        $("#menuClear").click();
                        break;
                    default:
                        return;
                }
            }

            event.preventDefault();
            event.stopPropagation();
        });

        /* Default Document Click Event */
        $("#entityPanel").click((event) => this.documentClick(event));
        $("#entityPanel").dblclick((event) => this.documentDblClick(event));
    }
    documentClick(event) {
        let srcElement = event.originalEvent.srcElement;

        /* strictly for debugging */
        console.log(event.altKey);
        if (event.altKey) {
            console.log(event.target);
            window.debug = event.target;
            return;
        }

        if (!window.getSelection().isCollapsed) return;

        if ($(srcElement).hasClass("taggedentity")) {
            if (!event.ctrlKey && !event.metaKey) {
                this.controller.setSelected(srcElement);
            } else {
                this.controller.toggleSelect(srcElement);
            }
            event.stopPropagation();
        } else if (!event.ctrlKey) {
            this.controller.unselectAll();
            event.stopPropagation();
        }
    }
    documentDblClick(event) {
        let srcElement = event.originalEvent.srcElement;
        if ($(srcElement).hasClass("taggedentity")) {
            window.getSelection().removeAllRanges();
            this.controller.selectLikeEntitiesByLemma();
            event.stopPropagation();
        }
    }

    /* context switching is deprecated */
    switchContext(contextName) {
        window.alert("'Switch Schema' is deprectated; the context/schema is now detected from the file.  In future releases this menu option will be removed.");
    }
    menuShowTags() {
        let rvalue = false;
        console.log($("#menuTags").data("value"));
        if ($("#menuTags").data("value") === false) {
            rvalue = true;
            $("#menuTags").addClass("activeText");
            $("#menuTags").data("value", true);
        } else {
            rvalue = false;
            $("#menuTags").removeClass("activeText");
            $("#menuTags").data("value", false);
        }

        if (rvalue === true) {
            this.view.attachStyle("tags.css");
        } else {
            this.view.detachStyle("tags.css");
        }
    }
}