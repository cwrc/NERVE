const $ = require("jquery");
const Widget = require("Nidget/src/Widget");
const DragDropWidget = require("Nidget/src/DragDropWidget");
const DropWidget = require("Nidget/src/DropWidget");

class LemmaWidget extends DragDropWidget {
    constructor(text, categoryWidget) {
        super(`<div class="lemma_widget"></div>`, categoryWidget);
        this.count = $(`<span class="lemma_widget_count">0</span>`);        
        this.text = $(`<span class="lemma_widget_text">${text}</span>`);        
        
        this.$.append(this.count);
        this.$.append(this.text);
        
        this.lemma = text;
        this.categoryWidget = categoryWidget;
        this.objects = [];
        
        this.$.click((event) => {
            this.notifyListeners("notifyClickLemmaWidget", this.getDelegate(), this.getCategory(), this.getLemma(), event.ctrlKey, event.shiftKey, event.altKey);
        });
        this.$.dblclick((event) => {
            this.notifyListeners("notifyDblClickLemmaWidget", this.getDelegate(), this.getCategory(), this.getLemma(), event.shiftKey, event.altKey);
        });
    }
    
    isEmpty(){
        return this.objects.length === 0;
    }
    
    size(){
        return this.objects.length;
    }
    
    getLemma(){
        return this.lemma;
    }
    
    getCategory(){
        return this.categoryWidget.getCategory();
    }
    
    getObjects(){
        return this.objects.slice();
    }
    
    addObject(object){
        if (this.objects.indexOf(object) === -1){
            this.objects.push(object);
            this.count.text(this.size());
            return true;
        }
        return false;
    }
    
    removeObject(object){
        if (this.objects.indexOf(object) === -1) throw new Error("invalid object");
        this.objects.splice(this.objects.indexOf(object), 1);
        this.count.text(this.size());
    }
    
    clear(){
        this.objects = [];
        this.count.text(this.size());
    }
    
    drop(event, data){
        if (data instanceof LemmaWidget && data.categoryWidget !== this){
            this.notifyListeners("lemmaDropWidget", this.getDelegate(), this.getCategory(), this.getLemma(), data);            
        } else {
            this.notifyListeners("lemmaDropObject", this.getDelegate(), this.getCategory(), this.getLemma(), data);
        }
        event.stopPropagation();
    }    
}

class CategoryWidget extends DropWidget {
    constructor(text, container) {
        super(`<div class="lemma_category"></div>`, container);
        this.categoryName = text;
        this.container = container;
        this.eyeState = true;

        this.header = $(`<div class="lemma_category_header"></div>`);
        this.arrow = $(`<img class="lemma_category_arrow closed" src="${CategoryWidget.arrow_image}"></img>`);
        this.text = $(`<span class="lemma_category_text">${text}</span>`);
        this.eye = $(`<img class="lemma_category_eye" src="${CategoryWidget.visible_active}"></img>`);
        
        this.container = $(`<div class="lemma_category_container"></div>`);

        this.$.append(this.header);
        this.header.append(this.arrow);
        this.header.append(this.text);
        this.header.append(this.eye);
        this.$.append(this.container);

        this.lemmaWidgets = new Map();

        this.header.click(() => this.toggleContainer());
        this.eye.click((event) =>{
            this.toggleEye();
            event.stopPropagation();
        });
        
        this.$.contextmenu("contextMenu", ()=>false);
    }

    isOpen() {
        return this.arrow.hasClass("opened");
    }

    open() {
        this.arrow.addClass("opened");
        this.arrow.removeClass("closed");
        this.__expandContainer();        
        this.notifyListeners("notifyExpandCategory", this.getDelegate(), this.categoryName);
    }

    close() {
        this.arrow.addClass("closed");
        this.arrow.removeClass("opened");
        this.__collapseContainer();
        this.notifyListeners("notifyCollapseCategory", this.getDelegate(), this.categoryName);
    }

    drop(event, data){
        if (data instanceof LemmaWidget && data.categoryWidget !== this){
            this.notifyListeners("categoryDropWidget", this.getDelegate(), data, this.getCategory());
        } else {
            this.notifyListeners("categoryDropObject", this.getDelegate(), data, this.getCategory());
        }                
    }

    /**
     * See: https://css-tricks.com/using-css-transitions-auto-dimensions/
     * @returns {undefined}
     */
    __collapseContainer() {
        let containerElement = this.container.get(0);
        
        // get the height of the element's inner content, regardless of its actual size
        var sectionHeight = containerElement.scrollHeight;

        // temporarily disable all css transitions
        var elementTransition = containerElement.style.transition;
        containerElement.style.transition = '';

        requestAnimationFrame(function () {
            containerElement.style.height = sectionHeight + 'px';
            containerElement.style.transition = elementTransition;

            // on the next frame (as soon as the previous style change has taken effect),
            // have the element transition to height: 0
            requestAnimationFrame(function () {
                containerElement.style.height = 0 + 'px';
            });
        });
    }

    /**
     * See: https://css-tricks.com/using-css-transitions-auto-dimensions/
     * @returns {undefined}
     */
    __expandContainer() {
        let containerElement = this.container.get(0);
        
        // get the height of the element's inner content, regardless of its actual size
        var sectionHeight = containerElement.scrollHeight;

        // have the element transition to the height of its inner content
        containerElement.style.height = sectionHeight + 'px';
    }

    __resizeContainer(amount){
        let containerElement = this.container.get(0);
        
        // get the height of the element's inner content, regardless of its actual size
        var sectionHeight = containerElement.scrollHeight;

        // have the element transition to the height of its inner content
        containerElement.style.height = (sectionHeight + amount) + 'px';
    }

    toggleEye(){
        if (this.eyeState){
            this.eyeState = false;
            this.eye.attr("src", CategoryWidget.visible_inactive);
        } else {
            this.eyeState = true;
            this.eye.attr("src", CategoryWidget.visible_active);
        }
        
        this.notifyListeners("notifyEyeState", this.getDelegate(), this.getCategory(), this.eyeState);
    }       

    toggleContainer() {
        if (this.isOpen()) {
            this.close();
        } else {
            this.open();
        }
    }

    addLemma(lemma) {
        let lemmaWidget = new LemmaWidget(lemma, this);
        this.container.append(lemmaWidget.$);
        this.lemmaWidgets.set(lemma, lemmaWidget);
        if (this.isOpen()) this.__resizeContainer(0);
    }
    
    removeLemma(lemma){
        let lemmaWidget = this.getLemmaWidget(lemma);
        let amount = lemmaWidget.$.outerHeight();
        lemmaWidget.$.detach();
        this.lemmaWidgets.delete(lemma);
        if (this.isOpen()) this.__resizeContainer(-amount);
    }
    
    getLemmaWidget(lemma){
        if (!this.lemmaWidgets.has(lemma)) throw new Errow("invalid lemma text");
        return this.lemmaWidgets.get(lemma);
    }
    
    getLemmaWidgets(){        
        return this.lemmaWidgets.values();
    }    
    
    hasLemma(lemma){
        return this.lemmaWidgets.has(lemma);
    }
    
    getCategory(){
        return this.categoryName;
    }
}

CategoryWidget.arrow_image = "/LemmaPanelWidget/assets/lemma_category_arrow.png";
CategoryWidget.visible_active = "/LemmaPanelWidget/assets/visible_eye.png";
CategoryWidget.visible_inactive = "/LemmaPanelWidget/assets/visible_eye_cross.png";

class LemmaDialog extends Widget {

    constructor(element) {
        super(element);
        this.$.addClass("lemma_container");
        this.categories = new Map();
        this.objects = new Map();
        
        this.options = {
            remove_lemma_on_empty : true
        };
    }

    setOptions(options){
        for (let option in options){
            this.options[option] = options[option];
        }
    }

    addCategory(category) {
        let categoryWidget = new CategoryWidget(category, this);
        this.$.append(categoryWidget.$);
        this.categories.set(category, categoryWidget);
    }

    addLemma(category, lemma) {
        if (!this.categories.has(category)) throw new Error("invalid category name");        
        let categoryWidget = this.categories.get(category);
        
        if (!categoryWidget.hasLemma(lemma)){
            categoryWidget.addLemma(lemma);
        }
    }
    
    hasLemma(category, lemma){
        if (!this.categories.has(category)) throw new Error("invalid category name");        
        let categoryWidget = this.categories.get(category); 
        return categoryWidget.hasLemma(lemma);
    }
    
    /**
     * Will add lemma if it doesn't exist.
     * @param {type} category
     * @param {type} lemma
     * @param {type} object
     * @returns {undefined}
     */
    setObject(category, lemma, object){
        if (this.objects.has(object)) this.removeObject(object);
        this.addLemma(category, lemma);
        let categoryWidget = this.categories.get(category); 
        let lemmaWidget = categoryWidget.getLemmaWidget(lemma);
        lemmaWidget.addObject(object);
        this.objects.set(object, {category : category, lemma: lemma});
    }
    
    removeObject(object){
        if (!this.objects.has(object)) return false;
        let values = this.objects.get(object);
        this.objects.delete(object);
        let categoryWidget = this.categories.get(values.category); 
        let lemmaWidget = categoryWidget.getLemmaWidget(values.lemma);
        lemmaWidget.removeObject(object);
        if (lemmaWidget.isEmpty() && this.options.remove_lemma_on_empty){
            categoryWidget.removeLemma(values.lemma);
        }
        return true;
    }
    
    hasObject(object){
        return this.objects.has(object);
    }
    
    getCategory(object){
        return this.objects.get(object).category;
    }

    getLemma(object){
        return this.objects.get(object).lemma;
    }    
    
    getObjects(category, lemma){
        let objects = [];
        
        if (!category){
            for (let object of this.objects.keys()){
                objects.push(object);
            }
        }
        else if (!lemma){
            let categoryWidget = this.categories.get(category); 
            for (let lemmaWidget of categoryWidget.getLemmaWidgets()){
                objects = objects.concat(lemmaWidget.getObjects());
            }
        }
        else {
            let categoryWidget = this.categories.get(category); 
            for (let lemmaWidget of categoryWidget.getLemmaWidgets()){
                if (lemmaWidget.getLemma() === lemma){
                    objects = objects.concat(lemmaWidget.getObjects());
                }
            }                        
        }
        
        return objects;
    }
}

module.exports = LemmaDialog;
