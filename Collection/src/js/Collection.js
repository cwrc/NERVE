/**
 * events: notifyCollectionAdd, notifyCollectionClear, notifyCollectionRemove
 * @type type
 */

const AbstractModel = require("nidget").AbstractModel;

class Collection extends AbstractModel {
    constructor(delegate, array) {
        super(delegate);
        
        this.innerArray = [];

        if (typeof array !== "undefined" & array !== null) {
            this.innerArray = array.slice();
        }
        
        this.name = "Collection";
    }

    setName(string){
        this.name = name;
    }

    $() {
        return $(this.innerArray);
    }
    [Symbol.iterator] () {
        return this.innerArray[Symbol.iterator]();
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
        this.delegate.notifyListeners(`notify${this.name}Add`, this.clone(), notifyarray);
    }
    set(obj) {
        this.clear();
        this.add(obj);
    }
    async clear() {
        if (this.isEmpty()) return;
        let oldArray = this.innerArray;
        this.innerArray = [];
        await this.delegate.notifyListeners(`notify${this.name}Clear`, this.clone(), oldArray);
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
        this.delegate.notifyListeners();
        this.delegate.notifyListeners(`notify${this.name}Remove`, this.clone(), [obj]);
        return obj;
    }
    contains(obj) {
        return this.innerArray.indexOf(obj) !== -1;
    }
    
    /**
     * Create a new Collection with the contents of this collection.  Does not copy the delegate.
     * @return {nm$_Collection.Collection}
     */
    clone(){
        return new Collection(null, this.innerArray);
    }
}

module.exports = Collection;