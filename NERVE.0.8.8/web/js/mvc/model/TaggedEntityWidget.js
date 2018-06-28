const NameSource = require("nerscriber").NameSource;
const EntityValues = require("../../gen/nerve").EntityValues;
const TaggedEntityExamineWidget  = require("../TaggedEntityExamineWidget");

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
module.exports = class TaggedEntityWidget extends AbstractModel{
    constructor(model, dragDropHandler, element, tagName = null) {
        Utility.log(TaggedEntityWidget, "constructor");
//        // Utility.enforceTypes(arguments, Model, DragDropHandler, HTMLDivElement, ["optional", String]);

        super();
        this.element = element;
        this.dragDropHandler = dragDropHandler;
        this.model = model;
        this.context = model.getContext();
        element.entity = this;

        $(element).addClass("taggedentity");
        $(element).attr("draggable", "true");

        $(element).on("dragstart", (event)=>this.dragstart(event));
        $(element).on("dragover", (event)=>this.dragover(event));
        $(element).on("drop", (event)=>this.drop(event));

        $(element).click((event) => { 
            if (!event.altKey){
                this.model.notifyListeners("notifyTaggedEntityClick", this, false, event.ctrlKey, event.shiftKey, event.altKey);
                event.stopPropagation();
            } else {               
                window.last = this;
                new TaggedEntityExamineWidget(this).show();
                event.stopPropagation();
            }
        });
        $(element).dblclick((event) => {
             this.model.notifyListeners("notifyTaggedEntityClick", this, true, event.ctrlKey, event.shiftKey, event.altKey);
             event.stopPropagation();
        });

        this.format();

        /* default values - will throw an exception is the tagged text does not have a tagname attribute and
         * the tagName is not provided.
         */
        if (tagName !== null) this.tag(tagName, true);
        this.lemma(this.text(), true);
        this.link("", true);
        this.collection("", true);
    }

    /**
     * This method will add html markup specific for the nerve environment.
     * Must use markdown before saving.
     * @return {undefined}
     */
    format(){
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
    unformat(){
        let replaceWith = $(this.contents).contents();
        $(this.element).empty();
        $(this.element).append(replaceWith);
    }

    drop(event){
        if (this.dragDropHandler.hasData("TaggedEntityWidget")){
            let src = this.dragDropHandler.deleteData("TaggedEntityWidget");
            let srcValues = src.values();
            srcValues.text(null);
            this.values(srcValues);
        }
    }

    dragover(event){
        if (this.dragDropHandler.hasData("TaggedEntityWidget")){
            event.originalEvent.preventDefault();
        }
    }

    dragstart(event){
        this.dragDropHandler.setData("TaggedEntityWidget", this);
    }

    selectLikeEntitiesByLemma(){
        window.alert("TODO: select like entities by lemma");
    }

    getElement() {
        Utility.log(TaggedEntityWidget, "getElement");
        // Utility.enforceTypes(arguments);
        return this.element;
    }
    
    $(){
        return $(this.getElement());
    }
    
    getContentElement() {
        Utility.log(TaggedEntityWidget, "getElement");
        // Utility.enforceTypes(arguments);
        return this.contents;
    }

    tag(value = null, silent = false){
        Utility.log(TaggedEntityWidget, "tag", value);
        if (value === null) return $(this.element).tag();

        let updateInfo = new EntityValues(null, null, null, $(this.element).tag(), null);

        if (!this.context.isTagName(value, NameSource.NAME)) {
            throw new Error(`Tagname '${value}' doesn't match any known name in context ${this.context.getName()}`);
        }

        let tagInfo = this.context.getTagInfo(value, NameSource.NAME);

        $(this.markup).text(value);
        $(this.markup).attr("data-norm", tagInfo.getName(NameSource.DICTIONARY));
        $(this.element).tag(value);

        if (!silent) this.model.notifyListeners("notifyEntityUpdate", this, updateInfo);
        return $(this.element).tag();
    }
    /**
     * Set standard value.
     * @param {string} value if null do not set, just return value
     * @param {boolean} silent true = fire notifyEntityUpdate event
     * @returns {string} the value of lemma
     */
    lemma(value = null, silent = false) {
        Utility.log(TaggedEntityWidget, "lemma", value);
        if (value === null) return $(this.element).lemma();
        let updateInfo = new EntityValues(null, $(this.element).lemma(), null, null, null);

        $(this.element).lemma(value);

        if (!silent) this.model.notifyListeners("notifyEntityUpdate", this, updateInfo);
        return $(this.element).lemma();
    }
    link(value = null, silent = false) {
        Utility.log(TaggedEntityWidget, "link", value);
        if (value === null) return $(this.element).link();
        let updateInfo = new EntityValues(null, null, $(this.element).link(), null, null);

        $(this.element).link(value);

        if (!silent) this.model.notifyListeners("notifyEntityUpdate", this, updateInfo);
        return $(this.element).link();
    }
    text(value = null, silent = false) {
        Utility.log(TaggedEntityWidget, "text", value);
        if (value === null) return $(this.contents).text();
        let updateInfo = new EntityValues($(this.contents).text(), null, null, null, null);

        $(this.contents).text(value);

        if (!silent) this.model.notifyListeners("notifyEntityUpdate", this, updateInfo);
        return $(this.element).link();
        return $(this.contents).text();
    }
    collection(value = null, silent = false) {
        Utility.log(TaggedEntityWidget, "collection", value);
        if (value === null) return $(this.element).attr("data-collection");
        let updateInfo = new EntityValues(null, null, null, null, $(this.element).attr("data-collection"));

        $(this.element).attr("data-collection", value);

        if (!silent) this.model.notifyListeners("notifyEntityUpdate", this, updateInfo);
        return $(this.element).attr("data-collection");
    }
    values(value = null, silent = false) {
        Utility.log(TaggedEntityWidget, "values");
        // Utility.enforceTypes(arguments, ["optional", EntityValues], ["optional", Boolean]);

        if (value === null) return new EntityValues(this.text(), this.lemma(), this.link(), this.tag(), this.collection());
        else {
            let updateInfo = new EntityValues(null, null, null, null, null);
            if (value.text() !== null){
                updateInfo.text(this.text());
                this.text(value.text(), true);
            }
            if (value.lemma() !== null) {
                updateInfo.lemma(this.lemma());
                this.lemma(value.lemma(), true);
            }
            if (value.link() !== null) {
                updateInfo.link(this.link());
                this.link(value.link(), true);
            }
            if (value.tag() !== null) {
                updateInfo.tag(this.tag());
                this.tag(value.tag(), true);
            }
            if (value.collection() !== null) {
                updateInfo.collection(this.collection());
                this.collection(value.collection(), true);
            }
            if (!silent) this.model.notifyListeners("notifyEntityUpdate", this, updateInfo);
        }

        return new EntityValues(this.text(), this.lemma(), this.link(), this.tag(), this.collection());
    }
    async untag() {
        let children = $(this.contents).contents();
        $(this.element).replaceWith(children);        
        document.normalize();
        return children;
    }
    addClass(classname) {
        $(this.element).addClass(classname);
    }
    removeClass(classname) {
        $(this.element).removeClass(classname);
    }
    
    setHasBackground(value){
        $(this.contents).attr(`data-hasbg`, value);
    }
    
    highlight(value){
        if (value === undefined) return $(this.element).hasClass("selected");
        else if (value) $(this.element).addClass("selected");
        else $(this.element).removeClass("selected");
    }
};
