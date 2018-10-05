class ContextMenu {
    constructor() {
        this.state = false;
        this.flags = {};
        this.lastSubMenu = null;
    }

    setDictionary(dictionary) {
        this.dictionary = dictionary;
        return this;
    }

    notifyDocumentClick() {
        $(ContextMenu.SELECTOR).hide();
    }

    notifyReady() {
        $(ContextMenu.SELECTOR).hide();
        $(ContextMenu.SELECTOR).find(".context-subdialog").hide();

        /* open submenu (if active) */
        $(ContextMenu.SELECTOR).find(".context-subdialog").each((i, e) => {
            $(e).parent().mouseenter(() => {
                let p = $(e).parent();
                if ($(p).hasClass("inactive") === false) {
                    $(e).show();
                }
            });
        });

        /* close submenu */
        $(ContextMenu.SELECTOR).find(".context-subdialog").each((i, e) => {
            $(e).parent().mouseleave(() => {
                $(e).hide();
            });
        });

        /* setup menu clicks */
        $(ContextMenu.SELECTOR).find(".context-item > .context-label").click((event) => {
            if ($(event.delegateTarget).parent().hasClass("inactive")) return;
            let flags = $(event.delegateTarget).parent().data("contextflags");
            if (flags && flags.hide) $(ContextMenu.SELECTOR).hide();
            let eventname = $(event.delegateTarget).parent().attr("data-eventname");
            this.notifyListeners(eventname, this.taggedEntityWidget);
            event.stopPropagation();
        });

        /* setup help popups */
        $(ContextMenu.SELECTOR).find("[data-context-help]").each((i, e) => {
            $(e).click((event) => {
                event.stopPropagation();
                let target = $(e).attr("data-context-help");
                $(ContextMenu.SELECTOR).find(`#${target}`).show();
                this.position($(ContextMenu.SELECTOR).find(`#${target}`).get(0), event);
            });
        });

        $(ContextMenu.SELECTOR).find(".context-help").each((i, e) => {
            $(e).mouseleave(() => $(e).hide());
        });
    }

    /* list all available entities for the user to select */
    /* if none are found, "select entity" option is disabled */
    loadOptions(text) {
        $(ContextMenu.SELECTOR).find("#dictOptions > #dictOptionList").empty();
        $(ContextMenu.SELECTOR).find("#dictOptions").addClass("inactive");
        $(ContextMenu.SELECTOR).find("#dictOptions > .context-right-image").attr("src", "assets/loader400.gif");
        let result = this.dictionary.lookup(text, null, null, null);

        result.then((sqlResult) => {
            if (sqlResult.size() !== 0) {
                $(ContextMenu.SELECTOR).find("#dictOptions").removeClass("inactive");
                for (let sqlRecord of sqlResult) {
                    this.addOption(sqlRecord);
                }
                $(ContextMenu.SELECTOR).find("#dictOptions > .context-right-image").show();
                $(ContextMenu.SELECTOR).find("#dictOptions > .context-right-image").attr("src", "assets/context-arrow.png");
            } else {
                $(ContextMenu.SELECTOR).find("#dictOptions > .context-right-image").hide();
            }
        });
    }

    setSelected(contextOptionDiv) {
        let img = document.createElement("img");
        $(img).attr("src", "assets/context-selected.png");
        $(img).addClass("context-left-image");
        $(contextOptionDiv).append(img);
    }

    addClickEvent(contextOptionDiv, sqlRecord) {
        $(contextOptionDiv).click(() => {
            this.taggedEntityWidget.lemma(sqlRecord.getEntry("lemma").getValue());
            this.taggedEntityWidget.tag(sqlRecord.getEntry("tag").getValue());
            this.taggedEntityWidget.link(sqlRecord.getEntry("link").getValue());
            $(ContextMenu.SELECTOR).hide();
        });
    }

    addOption(sqlRecord) {
        let div = document.createElement("div");
        let label = document.createElement("div");
        $(div).addClass("context-item");
        $(label).addClass("context-label");
        $(label).text(sqlRecord.getEntry("lemma").getValue() + " : " + sqlRecord.getEntry("tag").getValue());
        $(div).append(label);
        $(div).attr("title", "collection " + sqlRecord.getEntry("source").getValue());
        $(ContextMenu.SELECTOR).find("#dictOptions > #dictOptionList").append(div);

        if (sqlRecord.getEntry("lemma").getValue() === this.taggedEntityWidget.lemma()
                && sqlRecord.getEntry("tag").getValue() === this.taggedEntityWidget.tag())
        {
            this.setSelected(div);
        }
        this.addClickEvent(div, sqlRecord);
        return div;
    }

    isFlag(flagname) {
        if (this.flags[flagname] === undefined) return false;
        else return this.flags[flagname];
    }

    position(element, event) {
        let posX = event.clientX - 5;
        let posY = event.clientY - 5;
        element.style.left = posX + "px";
        element.style.top = posY + "px";
    }

    show(event, taggedEntityWidget) {
        $(ContextMenu.SELECTOR).show();
        this.loadOptions(taggedEntityWidget.text());
        this.position($(ContextMenu.SELECTOR).get(0), event);
        this.taggedEntityWidget = taggedEntityWidget;
        this.toggleAddMenuItem(taggedEntityWidget);
        this.toggleRemoveMenuItem(taggedEntityWidget);
    }

    /* if the tagged entity does not match an existing entry */
    /* enable the addDict menu item                          */
    toggleAddMenuItem(taggedEntityWidget) {
        $(ContextMenu.SELECTOR).find("#addDict > .context-right-image").show();
        $(ContextMenu.SELECTOR).find("#addDict").addClass("inactive");

        let text = taggedEntityWidget.text();
        let lemma = taggedEntityWidget.lemma();
        let tag = taggedEntityWidget.tag();
        let result = this.dictionary.lookup(text, lemma, tag, null);

        result.then((sqlResult) => {
            if (sqlResult.size() === 0) {
                $(ContextMenu.SELECTOR).find("#addDict").removeClass("inactive");
            }
            $(ContextMenu.SELECTOR).find("#addDict > .context-right-image").hide();
        });
    }

    toggleRemoveMenuItem(taggedEntityWidget) {
        $(ContextMenu.SELECTOR).find("#removeDict > .context-right-image").show();
        $(ContextMenu.SELECTOR).find("#removeDict").addClass("inactive");

        let text = taggedEntityWidget.text();
        let lemma = taggedEntityWidget.lemma();
        let tag = taggedEntityWidget.tag();
        let result = this.dictionary.lookup(text, lemma, tag, "custom");

        result.then((sqlResult) => {
            if (sqlResult.size() !== 0) {
                $(ContextMenu.SELECTOR).find("#removeDict").removeClass("inactive");
            }
            $(ContextMenu.SELECTOR).find("#removeDict > .context-right-image").hide();
        });
    }
}

ContextMenu.SELECTOR = "#taggedEntityContextMenu";