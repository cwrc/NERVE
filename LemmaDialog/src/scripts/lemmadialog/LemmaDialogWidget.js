const $ = window.$ ? window.$ : require("jquery");
const Widget = require("@thaerious/nidget").Widget;
const DragDropWidget = require("@thaerious/nidget").DragDropWidget;
const DropWidget = require("@thaerious/nidget").DropWidget;
const NidgetContext = require("@thaerious/nidgetcontext");

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
            this.notifyListeners("notifyDblClickLemmaWidget", this.getDelegate(), this.getCategory(), this.getLemma(), event.ctrlKey, event.shiftKey, event.altKey);
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
            this.notifyListeners("notifyLemmaDropWidget", this.getDelegate(), this.getCategory(), this.getLemma(), data);            
        } else {
            this.notifyListeners("notifyLemmaDropObject", this.getDelegate(), this.getCategory(), this.getLemma(), data);
        }
        event.stopPropagation();
    }    
    
    highlight(value = true){
        if (value) this.$.addClass("highlight");
        else this.$.removeClass("highlight");
    }
    
    focus(value = true){
        this.$.addClass("focus");
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
        
        this.$.on("contextmenu", (event)=>false);
    }

    isOpen() {
        return this.arrow.hasClass("opened");
    }

    open() {
        this.__expandContainer();        
        this.notifyListeners("notifyExpandCategory", this.getDelegate(), [this.categoryName]);
    }

    close() {
        this.__collapseContainer();
        this.notifyListeners("notifyCollapseCategory", this.getDelegate(), [this.categoryName]);
    }

    drop(event, data){
        if (data instanceof LemmaWidget && data.categoryWidget !== this){
            this.notifyListeners("notifyCategoryDropWidget", this.getDelegate(), this.getCategory(), data);
        } else {
            this.notifyListeners("notifyCategoryDropObject", this.getDelegate(), this.getCategory(), data);
        }                
    }

    /**
     * See: https://css-tricks.com/using-css-transitions-auto-dimensions/
     * @returns {undefined}
     */
    __collapseContainer() {
        this.arrow.addClass("closed");
        this.arrow.removeClass("opened");        
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
        this.arrow.addClass("opened");
        this.arrow.removeClass("closed");        
        let containerElement = this.container.get(0);
        
        // get the height of the element's inner content, regardless of its actual size
        var sectionHeight = containerElement.scrollHeight;

        // have the element transition to the height of its inner content
        containerElement.style.height = sectionHeight + 'px';
    }

    __resizeContainer(amount = 0){
        let containerElement = this.container.get(0);
        
        // get the height of the element's inner content, regardless of its actual size
        var sectionHeight = containerElement.scrollHeight;

        // have the element transition to the height of its inner content
        containerElement.style.height = (sectionHeight + amount) + 'px';
    }

    toggleEye(){
        if (this.eyeState){
            this.__hideEye();
        } else {
            this.__showEye();
        }
        this.notifyListeners("notifyEyeState", this.getDelegate(), [this.getCategory()], this.eyeState);
    }       

    __hideEye(){
        this.eyeState = false;
        this.eye.attr("src", CategoryWidget.visible_inactive);
    }    

    __showEye(){
        this.eyeState = true;
        this.eye.attr("src", CategoryWidget.visible_active);
    }    

    toggleContainer() {
        if (this.isOpen()) {
            this.close();
        } else {
            this.open();
        }
    }

    /**
     * Remove all lemmas.  Resets to empty state.
     * @returns {undefined}
     */
    clearLemmas(){
        this.container.empty();
        this.lemmaWidgets.clear();
        this.__resizeContainer(0);
    }

    addLemma(lemma) {
        let lemmaWidget = new LemmaWidget(lemma, this);
        this.container.append(lemmaWidget.$);
        this.lemmaWidgets.set(lemma, lemmaWidget);
        if (this.isOpen()) this.__resizeContainer(0);
        return lemmaWidget;
    }
    
    removeLemma(lemma){
        let lemmaWidget = this.getLemmaWidget(lemma);
        let amount = lemmaWidget.$.outerHeight();
        lemmaWidget.$.detach();
        this.lemmaWidgets.delete(lemma);
        if (this.isOpen()) this.__resizeContainer(-amount);
    }
    
    getLemmaWidget(lemma){
        if (!this.lemmaWidgets.has(lemma)){
            throw new Error("unknown lemma text");
        }
        
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

CategoryWidget.arrow_image = "assets/lemma_dialog/lemma_category_arrow.png";
CategoryWidget.visible_active = "assets/lemma_dialog/visible_eye.png";
CategoryWidget.visible_inactive = "assets/lemma_dialog/visible_eye_cross.png";
CategoryWidget.tag_selection = "assets/lemma_dialog/tag.png";

function sleep(miliseconds) {
    return new Promise(function(resolve, reject) {
        setTimeout(resolve, miliseconds);
    });
}

class LemmaDialogWidget extends Widget {
    constructor(element) {
        super(element);
        this.$.addClass("lemma_container");
        this.categories = new Map(); /* map of {category name : sting} -> {category widget} */
        this.objects = new Map();
        this.currentHighlight = [];
        
        this.options = {
            remove_lemma_on_empty : true
        };
        
        this.categoryContextMenu = new NidgetContext();
        this.categoryContextMenu.addMenuItem("Expand All", ()=>this.expandAll());
        this.categoryContextMenu.addMenuItem("Collapse All", ()=>this.collapaseAll());
        this.categoryContextMenu.addMenuItem("View All", ()=>this.viewAll())
            .setImage(CategoryWidget.visible_active);
        
        this.categoryContextMenu.addMenuItem("View None", ()=>this.viewNone())
            .setImage(CategoryWidget.visible_inactive);
        
        this.lemmaContextMenu = new NidgetContext();
        this.lemmaContextMenu.addMenuItem("Select All");
        this.lemmaContextMenu.addMenuItem("Select Next", {close_menu: false});
        
        $("html").on("click", ()=>this.categoryContextMenu.hide());        
        $("html").on("click", ()=>this.lemmaContextMenu.hide());
    }

    /**
     * Remove all lemmas
     * @returns {undefined}
     */
    clearLemmas(){
        for (let category of this.categories.values()){
            category.clearLemmas();
        }
        this.objects.clear();
    }

    expandAll(){
        let array = [];
        for (let category of this.categories.keys()){
            array.push(category);
            this.categories.get(category).__expandContainer();
        }
        this.notifyListeners("notifyExpandCategory", this.getDelegate(), array);
    }
    
    collapaseAll(){
        let array = [];
        for (let category of this.categories.keys()){
            array.push(category);
            this.categories.get(category).__collapseContainer();
        }
        this.notifyListeners("notifyCollapseCategory", this.getDelegate(), array);        
    }
    
    viewAll(){
        let array = [];
        for (let category of this.categories.keys()){
            array.push(category);
            this.categories.get(category).__showEye();
        }
        this.notifyListeners("notifyEyeState", this.getDelegate(), array, true);          
    }
    
    viewNone(){
        let array = [];
        for (let category of this.categories.keys()){
            array.push(category);
            this.categories.get(category).__hideEye();
        }
        this.notifyListeners("notifyEyeState", this.getDelegate(), array, false);          
    }

    setOptions(options){
        for (let option in options){
            this.options[option] = options[option];
        }
    }

    addCategory(categories){
        if (categories instanceof Array){
            for (let c of categories) this.__addCategory(c);
        }
        else{
            this.__addCategory(categories);
        }
    }

    __addCategory(category) {
        let categoryWidget = new CategoryWidget(category, this);
        this.$.append(categoryWidget.$);
        this.categories.set(category, categoryWidget);
        
        categoryWidget.header.on("contextmenu", (event)=>{
            this.categoryContextMenu.show(event);
            return false;
        });
    }

    addLemma(category, lemma) {
        if (!this.categories.has(category)) throw new Error(`invalid category name: ${category}`);        
        let categoryWidget = this.categories.get(category);
        
        if (!categoryWidget.hasLemma(lemma)){
            let lemmaWidget = categoryWidget.addLemma(lemma);
            lemmaWidget.$.on("contextmenu", (event)=>{
                console.log("*** LemmaWidget in LemmaDialog Context Menu Disabled ***");
//                this.lemmaContextMenu.show(event);
                return false;
            });
        }
    }
    
    hasLemma(category, lemma){
        if (!this.categories.has(category)) throw new Error("invalid category name");        
        let categoryWidget = this.categories.get(category); 
        return categoryWidget.hasLemma(lemma);
    }
    
    /**
     * Will add lemma if it doesn't exist.
     * @param {type} category heading to add lemma too
     * @param {type} lemma text
     * @param {type} object associated external object
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
        
    __getCategoryWidget(category){
        if (!this.categories.has(category)) throw new Error("invalid category name");        
        let categoryWidget = this.categories.get(category);
        return categoryWidget;
    }
    
    getCategory(object){
        return this.objects.get(object).category;
    }

    getCategories(){
        let array = [];
        for (let category of this.categories.keys()){
            array.push(category);
        }
        return array;
    }

    getLemma(object){
        return this.objects.get(object).lemma;
    }    
    
    /**
     * Return an array of all objects that matches categories and lemma.
     * @param {type} categories and array or string
     * @param {type} lemma a string
     * @returns {Array|nm$_LemmaDialogWidget.exports.getObjects.objects|nm$_LemmaDialogWidget.LemmaDialogWidget.getObjects.objects}
     */
    getObjects(categories, lemma){
        if (categories instanceof Array){
            let objects = [];
            for (let category of categories){
                let catObjects = this.getObjects(category);
                objects = objects.concat(catObjects);
            }
            return objects;
        }
        
        let category = categories;
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
    
    clearHighlight(){
        for (let lemmaWidget of this.currentHighlight){
            lemmaWidget.highlight(false);
        }
        this.currentHighlight = [];
    }
    
    highlight(category, lemma){
        let categoryWidget = this.__getCategoryWidget(category);
        let lemmaWidget = categoryWidget.getLemmaWidget(lemma);
        lemmaWidget.highlight();
        this.currentHighlight.push(lemmaWidget);
    }
    
    scrollTo(category, lemma){
        let categoryWidget = this.__getCategoryWidget(category);
        let lemmaWidget = categoryWidget.getLemmaWidget(lemma);
        window.last = lemmaWidget;
        this.__scrollToElement(lemmaWidget.$);
    }
    
    __scrollToElement(element) {
        let eleTop = $(element).offset().top;
        let eleBottom = eleTop + $(element).height();
        let dispTop = this.$.offset().top;
        let dispBottom = dispTop + this.$.height();
        
        if (eleTop > dispTop && eleBottom < dispBottom) return;
        
        let diffTop = eleTop - dispTop;
        let scrollTo = diffTop + this.$.scrollTop() - this.$.height() / 2;
        this.$.scrollTop(scrollTo);
    }    
}

module.exports = LemmaDialogWidget;
