const $ = window.$ ? window.$ : require("jquery");
const NameSource = require("nerscriber").NameSource;
const EntityValues = require("nerveserver").EntityValues;
const Constants = require("@thaerious/utility").Constants;
const AbstractModel = require("@thaerious/nidget").AbstractModel;
const Widget = require("@thaerious/nidget").Widget;
const DragWidget = require("@thaerious/nidget").DragWidget;

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
class TaggedEntityWidget extends DragWidget{

    constructor(element, factory) {
        super(element, factory);
        this.factory = factory;
        this.setupListeners();
        this.formatElements();
    }

    /**
     * Add dom listeners to the underlying dom elements to trigger nidget events.
     * @returns {undefined}
     */
    setupListeners() {
        this.$.addClass("taggedentity");

        this.$.on("contextmenu", (event) => {
            event.preventDefault();
            event.stopPropagation();
            this.notifyListeners("notifyTaggedEntityContextMenu", this, false, event.ctrlKey, event.shiftKey, event.altKey, event);
        });

        this.$.click((event) => {
            if (event.button !== 0) return; /* left click only */
            this.notifyListeners("notifyTaggedEntityClick", this, false, event.ctrlKey, event.shiftKey, event.altKey, event);
            event.stopPropagation();
        });
        
        this.$.dblclick((event) => {
            if (event.button !== 0) return; /* left click only */
            this.notifyListeners("notifyTaggedEntityClick", this, true, event.ctrlKey, event.shiftKey, event.altKey, event);
            event.stopPropagation();
        });
    }
    
    /** 
     * Add NERVE specific html elements.  These get removed with the untag()
     * method.  It is assumed that a properly formatted HTML element has been
     * set to 'this.$'.
     * This element should look like the following:
     * <div data-lemma="" data-link="" class="taggedentity" xmltagname="">TEXT</div>
     * @returns {undefined}
     */
    formatElements() {
        if (this.$.attr(Constants.DATA_LEMMA) === undefined){
            this.$.attr(Constants.DATA_LEMMA, "");
        }

        if (this.$.attr(Constants.DATA_LINK) === undefined){
            this.$.attr(Constants.DATA_LINK, "");
        }        
        
        if (this.$.attr(Constants.ORG_TAGNAME) === undefined){
            this.$.attr(Constants.ORG_TAGNAME, "-unset-");
        }                
        
        /* put text into it's own element with class = contents */
        if (this.$.find(".contents").length === 0){
            this.contents = $("<div></div>");
            this.contents.addClass("contents");
            let currentText = this.$.text();
            this.$.text("");
            this.contents.text(currentText);
            this.$.prepend(this.contents);
        } else {
            this.contents = this.$.find(".contents");
        }
        
        /* add a markup element that will mirror the tagname element */
        if (this.$.find(".tagname-markup").length === 0){
            this.markup = $("<div></div>");
            this.markup.addClass("tagname-markup");
            let currentTag = this.$.attr(Constants.ORG_TAGNAME);
            this.markup.text(currentTag);
            this.$.append(this.markup);     
        } else {
            this.markup = this.$.find(".tagname-markup");
        }
    }

    contextUntag() {
        this.untag();
    }

    untag() {
        this.factory.forget(this);                
        this.highlight(false);
        let contents = $(this.contents).contents();
        let clone = contents.clone();
        this.$.replaceWith(clone);
        document.normalize();       
        return clone;
    }

    dragstart(event) {
        this.notifyListeners("notifyEntityDragStart", this);
    }

    selectLikeEntitiesByLemma() {
        window.alert("TODO: select like entities by lemma");
    }

    /**
     * If value is set returns this, if it's not set return current value.
     * Triggers event 'notifyEntityUpdate [entities] [oldvalues]' for a given
     * index 'i' in entities, oldvalues[i] corrisponds to that entities previous
     * values.
     * @param {type} value new value
     * @param {type} silent if set do not trigger event.
     * @returns {nm$_TaggedEntityFactory.TaggedEntityWidget}
     */
    tag(value = null, silent = false) {
        if (value === null) return this.$.attr(Constants.ORG_TAGNAME);
        let oldValues = this.values();
        
        $(this.markup).text(value);
        this.$.attr(Constants.ORG_TAGNAME, value);

        if (!silent) this.notifyListeners("notifyEntityUpdate", [this], [oldValues]);
        return this;
    }
    /**
     * Sets the normalized value of this entity.
     * If value is set returns this, if it's not set return current value.
     * Triggers event 'notifyEntityUpdate [entities] [oldvalues]' for a given
     * index 'i' in entities, oldvalues[i] corrisponds to that entities previous
     * values.
     * @param {type} value new value
     * @param {type} silent if set do not trigger event.
     * @returns {nm$_TaggedEntityFactory.TaggedEntityWidget}
     */
    lemma(value = null, silent = false) {
        if (value === null) return this.$.attr(Constants.DATA_LEMMA);

        let oldValues = this.values();
        this.$.attr(Constants.DATA_LEMMA, value);

        if (!silent) this.notifyListeners("notifyEntityUpdate", [this], [oldValues]);
        return this;
    }
    /**
     * Sets the external link of this entity.
     * If value is set returns this, if it's not set return current value.
     * Triggers event 'notifyEntityUpdate [entities] [oldvalues]' for a given
     * index 'i' in entities, oldvalues[i] corrisponds to that entities previous
     * values.
     * @param {type} value new value
     * @param {type} silent if set do not trigger event.
     * @returns {nm$_TaggedEntityFactory.TaggedEntityWidget}
     */    
    link(value = null, silent = false) {
        if (value === null) return this.$.attr(Constants.DATA_LINK);
        let oldValues = this.values();
        this.$.attr(Constants.DATA_LINK, value);

        if (!silent) this.notifyListeners("notifyEntityUpdate", [this], [oldValues]);
        return this;
    }
    /**
     * Sets the display text of this entity.
     * If value is set returns this, if it's not set return current value.
     * Triggers event 'notifyEntityUpdate [entities] [oldvalues]' for a given
     * index 'i' in entities, oldvalues[i] corrisponds to that entities previous
     * values.
     * @param {type} value new value
     * @param {type} silent if set do not trigger event.
     * @returns {nm$_TaggedEntityFactory.TaggedEntityWidget}
     */    
    text(value = null, silent = false) {
        if (value === null) return $(this.contents).text();
        let oldValues = this.values();
        $(this.contents).text(value);

        if (!silent) this.notifyListeners("notifyEntityUpdate", [this], [oldValues]);
        return $(this.contents).text();
    }
    /**
     * All values of this entity.
     * If value is set returns this, if it's not set return current value.
     * Triggers event 'notifyEntityUpdate [entities] [oldvalues]' for a given
     * index 'i' in entities, oldvalues[i] corrisponds to that entities previous
     * values.
     * @param {type} value new value
     * @param {type} silent if set do not trigger event.
     * @returns {nm$_TaggedEntityFactory.TaggedEntityWidget}
     */    
    values(value = null, silent = false) {
        if (value !== null && value.constructor.name !== "EntityValues"){
            throw new Error("Invalid parameter type");
        }
        
        if (value === null) {
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
            if (!silent) this.notifyListeners("notifyEntityUpdate", [this], [oldValues]);
        }

        return this.values();
    }

    /**
     * Sets the selected class for this entities dom element.
     * If value is not defined, returns the current value.
     * @param {type} value true = add class, false = remove class.
     * @returns {unresolved}
     */
    highlight(value) {
        if (value === undefined) return this.$.hasClass("selected");
        else if (value) this.$.addClass("selected");
        else this.$.removeClass("selected");
    }  
}

class TaggedEntityFactory extends AbstractModel {
    constructor(entityPanelWidget) {
        super(entityPanelWidget);
        this.entities = [];
    }
    
    getAllEntities(){
        return this.entities.slice();
    }
    
    forget(taggedEntityWidget){
        let index = this.entities.indexOf(taggedEntityWidget);
        this.entities.splice(index, 1);
    }
    
    constructFromText(text, tag){
        let taggedEntityWidget = new this.__newEmptyWidget();
        taggedEntityWidget.text(text, true);
        taggedEntityWidget.lemma(text, true);
        taggedEntityWidget.tag(tag, true);
        this.entities.push(taggedEntityWidget);
        
        if (taggedEntityWidget.lemma() === ""){
            taggedEntityWidget.lemma(taggedEntityWidget.text());
        }
        
        return taggedEntityWidget;
    }
    
    constructFromElement(element){        
        let taggedEntityWidget = new TaggedEntityWidget(element, this);
        this.entities.push(taggedEntityWidget);
        
        if (taggedEntityWidget.lemma() === ""){
            taggedEntityWidget.lemma(taggedEntityWidget.text(), true);
        }        
        
        return taggedEntityWidget;
    }
    
    __newEmptyWidget() {
        let div = document.createElement("div");
        let contents = document.createElement("div");
        let markup = document.createElement("div");

        $(div).append(markup);
        $(div).append(contents);

        $(div).addClass(Constants.HTML_ENTITY);
        $(div).attr("draggable", true);
        $(div).attr(Constants.DATA_LINK, "");
        $(div).attr(Constants.DATA_LEMMA, "");

        $(markup).addClass("tagname-markup");
        $(contents).addClass("contents");

        return new TaggedEntityWidget(div, this);
    }    
    
    /* remove tagged entity markup from a dom element */
    static removeMarkup(element) {
        let contentsHTML = $(element).find(".contents").first().html();
        $(element).html(contentsHTML);
        document.normalize();
    }    
}

module.exports = TaggedEntityFactory;