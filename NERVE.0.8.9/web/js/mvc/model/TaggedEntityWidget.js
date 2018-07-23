const NameSource = require("nerscriber").NameSource;
const EntityValues = require("../../gen/nerve").EntityValues;
const ShowHTMLWidget = require("../ShowHTMLWidget");
const Constants = require("../../util/Constants");
const AbstractModel = require("./AbstractModel");

class ContextMenu {
    constructor() {
        this.state = false;
        this.flags = {};
        this.lastSubMenu = null;        
    }

    notifyContextChange(context){
        this.context = context;
    }

    setDictionary(dictionary) {
        this.dictionary = dictionary;
    }

    notifyDocumentClick(){
        $(ContextMenu.SELECTOR).hide();
    }

    notifyReady() {
        $(ContextMenu.SELECTOR).hide();
        $(ContextMenu.SELECTOR).find(".context-subdialog").hide();

        /* open submenu (if active) */
        $(ContextMenu.SELECTOR).find(".context-subdialog").each((i, e) => {
            $(e).parent().mouseenter(() => {
                let p = $(e).parent();                
                if ($(p).hasClass("inactive") === false){
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
            TaggedEntityWidget.delegate.notifyListeners(eventname, this.taggedEntityWidget);
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
    
    setSelected(contextOptionDiv){
        let img = document.createElement("img");
        $(img).attr("src", "assets/context-selected.png");
        $(img).addClass("context-left-image");
        $(contextOptionDiv).append(img);
    }
    
    addClickEvent(contextOptionDiv, sqlRecord){
        $(contextOptionDiv).click(()=>{
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
        &&  sqlRecord.getEntry("tag").getValue() === this.taggedEntityWidget.tag())
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
    toggleAddMenuItem(taggedEntityWidget){
        $(ContextMenu.SELECTOR).find("#addDict > .context-right-image").show();
        $(ContextMenu.SELECTOR).find("#addDict").addClass("inactive");
        
        let text = taggedEntityWidget.text();
        let lemma = taggedEntityWidget.lemma();
        let tag = taggedEntityWidget.tag();
        let result = this.dictionary.lookup(text, lemma, tag, null);
        
        result.then((sqlResult) => {
            if (sqlResult.size() === 0){
                $(ContextMenu.SELECTOR).find("#addDict").removeClass("inactive");                
            }
            $(ContextMenu.SELECTOR).find("#addDict > .context-right-image").hide();
        });
    }
    
    
    toggleRemoveMenuItem(taggedEntityWidget){
        $(ContextMenu.SELECTOR).find("#removeDict > .context-right-image").show();
        $(ContextMenu.SELECTOR).find("#removeDict").addClass("inactive");        
        
        let text = taggedEntityWidget.text();
        let lemma = taggedEntityWidget.lemma();
        let tag = taggedEntityWidget.tag();
        let result = this.dictionary.lookup(text, lemma, tag, "custom");
        
        result.then((sqlResult) => {
            if (sqlResult.size() !== 0){
                $(ContextMenu.SELECTOR).find("#removeDict").removeClass("inactive");              
            }
            $(ContextMenu.SELECTOR).find("#removeDict > .context-right-image").hide();
        });
    }
}

ContextMenu.SELECTOR = "#taggedEntityContextMenu";

/**
 * All tagged entity elements get passed to a TaggedEntity constructor to provide functionality.
 * The TaggedEntity has a reference to the element, and the element will have a reverence to the
 * tagged entity as 'element.entity'.  will throw an exception is the tagged text does not have
 * a tagname attribute and the tagName is not provided.  When a field is changed the old values
 * will be sent with the event with the unchanged values as null.
 * 
 * TaggedEntityClick(this, double, control, shift, alt);
 * 
 * @type type
 */
class TaggedEntityWidget {
    constructor(dragDropHandler, element, tagName = null){
        if (!dragDropHandler) throw new Error("undefined DragDropHandler");
        
        let jq = $(element);
        
        if (jq.get(0) instanceof Element){
            this.nodeConstructor(dragDropHandler, element, tagName);        
        }
        if (jq.get(0) instanceof Text){
            let newElement = TaggedEntityWidget.newEmptyWidget();
            console.log(newElement);
            this.nodeConstructor(dragDropHandler, newElement, tagName);            
            this.text(element.text(), true);
            this.lemma(element.text(), true);
            jq.replaceWith(this.getElement());
        }
    }
    
    setup(){
        $(this.element).addClass("taggedentity");
        $(this.element).attr("draggable", "true");

        $(this.element).on("dragstart", (event) => this.dragstart(event));
        $(this.element).on("dragover", (event) => this.dragover(event));
        $(this.element).on("drop", (event) => this.drop(event));

        $(this.element).on("contextmenu", (event) => {
            event.preventDefault();
            TaggedEntityWidget.contextMenu.show(event, this);
        });

        $(this.element).click((event) => {
            if (event.button !== 0) return; /* left click only */
            TaggedEntityWidget.delegate.notifyListeners("notifyTaggedEntityClick", this, false, event.ctrlKey, event.shiftKey, event.altKey);
            event.stopPropagation();
        });
        $(this.element).dblclick((event) => {
            if (event.button !== 0) return; /* left click only */
            TaggedEntityWidget.delegate.notifyListeners("notifyTaggedEntityClick", this, true, event.ctrlKey, event.shiftKey, event.altKey);
            event.stopPropagation();
        });        
    }
    
    nodeConstructor(dragDropHandler, element, tagName = null) {
        this.element = element;
        this.dragDropHandler = dragDropHandler;
        element.entity = this;

        /* default values - will throw an exception is the tagged text does not have a tagname attribute and
         * the tagName is not provided.
         */
        if (tagName !== null) $(this.element).tag(tagName); 
        
        this.setup();
        this.format();
        this.lemma(this.text(), true);
    }

    contextUntag() {
        this.untag();
    }

    /**
     * This method will add html markup specific for the nerve environment.
     * @return {undefined}
     */
    format() {
        if ($(this.element).contents().length === 0) {
            this.contents = document.createElement("div");
            $(this.contents).addClass("contents");
            $(this.element).prepend(this.contents);
        } else if ($(this.element).children().filter(".contents").length === 0) {
            this.contents = $(this.element).contents().wrap().get(0);
            $(this.contents).addClass("contents");
        } else {
            this.contents = $(this.element).children(".contents").get(0);
        }

        if ($(this.element).children().filter(".tagname-markup").length === 0) {
            this.markup = document.createElement("div");
            $(this.element).prepend(this.markup);
            $(this.markup).addClass("tagname-markup");            
            this.tag($(this.element).tag(), true);
        } else {
            this.markup = $(this.element).children(".tagname-markup");
        }
    }

    /**
     * This method will remove html markup specific for the nerve environment.
     * Must use markup before displaying
     * @return {undefined}
     */
    unformat() {
        let replaceWith = $(this.contents).contents();
        $(this.element).empty();
        $(this.element).append(replaceWith);
    }

    drop(event) {
        if (this.dragDropHandler.hasData("TaggedEntityWidget")) {
            let src = this.dragDropHandler.deleteData("TaggedEntityWidget");
            let values = this.values();
            values.text(null);
            src.values(values);
        }
    }

    dragover(event) {
        if (this.dragDropHandler.hasData("TaggedEntityWidget")) {
            event.originalEvent.preventDefault();
        }
    }

    dragstart(event) {
        this.dragDropHandler.setData("TaggedEntityWidget", this);
    }

    selectLikeEntitiesByLemma() {
        window.alert("TODO: select like entities by lemma");
    }

    getElement() {
        
        return this.element;
    }

    $() {
        return $(this.getElement());
    }

    getContentElement() {
        
        return this.contents;
    }

    getContext(){
        return TaggedEntityWidget.delegate.getContext();
    }

    tag(value = null, silent = false) {
        if (value === null) return $(this.element).tag();
        let oldValues = this.values();

        if (this.getContext().isStandardTag(value) === false) {
            throw new Error(`Tagname '${value}' doesn't match any known standard tag in context ${this.getContext().getName()}`);
        }

        let schemaTag = this.getContext().getTagInfo(value).getName();
        $(this.markup).text(schemaTag);
        $(this.element).tag(value);

        if (!silent) TaggedEntityWidget.delegate.notifyListeners("notifyEntityUpdate", [this], [oldValues]);
        return $(this.element).tag();
    }
    /**
     * Set standard value.
     * @param {string} value if null do not set, just return value
     * @param {boolean} silent true = fire notifyEntityUpdate event
     * @returns {string} the value of lemma
     */
    lemma(value = null, silent = false) {
        if (value === null) return $(this.element).lemma();
        let oldValues = this.values();
        $(this.element).lemma(value);

        if (!silent) TaggedEntityWidget.delegate.notifyListeners("notifyEntityUpdate", [this], [oldValues]);
        return $(this.element).lemma();
    }
    link(value = null, silent = false) {
        if (value === null) return $(this.element).link();
        let oldValues = this.values();
        $(this.element).link(value);

        if (!silent) TaggedEntityWidget.delegate.notifyListeners("notifyEntityUpdate", [this], [oldValues]);
        return $(this.element).link();
    }
    text(value = null, silent = false) {
        if (value === null) return $(this.contents).text();
        let oldValues = this.values();
        $(this.contents).text(value);

        if (!silent) TaggedEntityWidget.delegate.notifyListeners("notifyEntityUpdate", [this], [oldValues]);
        return $(this.contents).text();
    }
    values(value = null, silent = false) {                
        
        if (value === null){             
            let entityValues = new EntityValues();
            if (this.text() !== "") entityValues.text(this.text());
            if (this.lemma() !== "") entityValues.lemma(this.lemma());
            if (this.link() !== "") entityValues.link(this.link());
            if (this.tag() !== "") entityValues.tag(this.tag());
            return entityValues;
        } else {
            let oldValues = this.values();
            if (value.hasText()) {
                this.text(value.text(), true);
            }
            if (value.hasLemma()) {
                this.lemma(value.lemma(), true);
            }
            if (value.hasLink()) {
                this.link(value.link(), true);
            }
            if (value.hasTag()) {
                this.tag(value.tag(), true);
            }
            if (!silent) TaggedEntityWidget.delegate.notifyListeners("notifyEntityUpdate", [this], [oldValues]);
        }

        return this.values();
    }
    untag() {
        this.highlight(false);
        let contents = $(this.contents).contents();
        let clone = contents.clone();
        $(this.element).replaceWith(clone);
//        document.normalize();
        return clone;
    }
    addClass(classname) {
        $(this.element).addClass(classname);
    }
    removeClass(classname) {
        $(this.element).removeClass(classname);
    }

    highlight(value) {
        if (value === undefined) return $(this.element).hasClass("selected");
        else if (value) $(this.element).addClass("selected");
        else $(this.element).removeClass("selected");
    }  
    
    static newEmptyWidget(){
        let div = document.createElement("div");
        let contents = document.createElement("div");
        let markup = document.createElement("div");
        
        $(div).append(markup);
        $(div).append(contents);
                
        $(div).addClass("taggedEntity");
        $(div).attr("draggable", true);
        
        $(markup).addClass("tagname-markup");
        $(contents).addClass("contents");
        
        return div;
    }
}

class TaggedEntityDelegate extends AbstractModel{
    constructor(){
        super();
        this.contxt = null;
        this.addListener(this);
    }
    
    getContext(){
        return this.context;
    }
    
    notifyContextChange(context){
        this.context = context;
    }
    
    contextShowHTML(taggedEntityWidget) {
        window.last = this;
        new ShowHTMLWidget(taggedEntityWidget).show();
    }
}

TaggedEntityWidget.contextMenu = new ContextMenu();
TaggedEntityWidget.delegate = new TaggedEntityDelegate();

module.exports = TaggedEntityWidget;