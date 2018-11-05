const AbstractModel = require("@thaerious/nidget").AbstractModel;

/**
 * events: notifyCollectionAdd, notifyCollectionClear, notifyCollectionRemove
 * @type type
 */

class TaggedEntityCollection extends AbstractModel{
    constructor(delegate, array = []) {
        super(delegate);
        this.innerArray = array.slice();
    }

    [Symbol.iterator] () {
        return this.innerArray[Symbol.iterator]();
    }
            
    asArray(){
        return this.innerArray.slice();
    }
            
    /**
     * Add object(s) if they are not already contained.
     * @param {type} single object or array of objects
     * @returns {undefined}
     */
    add(obj) {
        let notifyarray = [];
        if (obj instanceof Array) {
            for (let o of obj) {
                if (!this.contains(o)) {
                    this.innerArray.push(o);
                    notifyarray.push(o);
                }
            }
        } else if (!this.contains(obj)) {
            this.innerArray.push(obj);
            notifyarray.push(obj);
        }
        this.notifyListeners("notifyCollectionAdd", this.clone(), notifyarray);
        return this;
    }
    set(obj) {
        this.clear();
        this.add(obj);
    }
    async clear() {
        if (this.isEmpty()) return;
        let oldArray = this.innerArray;
        this.innerArray = [];
        await this.notifyListeners("notifyCollectionClear", this.clone(), oldArray);
    }
    get(i) {
        return this.innerArray[i];
    }
    getLast() {
        return this.innerArray[this.innerArray.length - 1];
    }
    getFirst() {
        return this.innerArray[0];
    }
    size() {
        return this.innerArray.length;
    }
    isEmpty() {
        return this.innerArray.length === 0;
    }
    remove(obj) {
        if (!this.contains(obj)) return null;
        this.innerArray.splice(this.innerArray.indexOf(obj), 1);
        this.notifyListeners("notifyCollectionRemove", this.clone(), [obj]);
        return obj;
    }
    contains(obj) {
        return this.innerArray.indexOf(obj) !== -1;
    }
    
    /**
     * Create a new Collection with the contents of this collection.
     * @return {nm$_Collection.Collection}
     */
    clone(){
        return new TaggedEntityCollection(this.getDelegate(), this.innerArray);
    }
    
    values(values){
        let oldValues = [];
        
        for (let taggedEntityWidget of this.innerArray){
            oldValues.push(taggedEntityWidget.values());
            taggedEntityWidget.values(values, true);
        }
        this.notifyListeners("notifyEntityUpdate", this.innerArray.slice(), oldValues);
    }
}

module.exports = TaggedEntityCollection;