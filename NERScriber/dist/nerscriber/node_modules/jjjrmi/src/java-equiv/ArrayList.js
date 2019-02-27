"use strict";
let ArrayList = class ArrayList {
    constructor() {
        this.elementData = [];
    }
    static __isTransient() {
        return false;
    }
    static __getClass() {
        return "java.util.ArrayList";
    }
    static __isEnum() {
        return false;
    }
    addAll(c) {
        if (typeof c === "number") throw new Error("unsupported java to js operation");
        for (let e of c)
            this.add(e);
    }
    isEmpty() {
        return this.size() === 0;
    }
    removeAll(c) {
        for (let e of c) {
            this.remove(e);
        }
    }
    retainAll(c) {
        let newElementData = [];
        for (let e of c) {
            if (this.contains(e)) newElementData.add(e);
        }
        this.elementData = newElementData;
    }
    size() {
        return this.elementData.length;
    }
    clone() {
        let that = new ArrayList();
        for (let e of this) {
            that.add(e);
        }
        return that;
    }
    get(index) {
        return this.elementData[index];
    }
    set(index, element) {
        let old = this.elementData[index];
        this.elementData[index] = element;
        return old;
    }
    toArray(a = []) {
        for (let i = 0; i < this.elementData.length; i++)
            a[i] = this.elementData[i];
        return a;
    }
    iterator() {
        throw new Error("unsupported java to js operation");
    }
    subList(fromIndex, toIndex) {
        throw new Error("unsupported java to js operation");
    }
    listIterator() {
        throw new Error("unsupported java to js operation");
    }
    listIterator(index) {
        throw new Error("unsupported java to js operation");
    }
    add(index, element) {
        this.splice(index, 0, element);
    }
    add(e) {
        this.elementData.push(e);
        return true;
    }
    clear() {
        this.elementData = [];
    }
    contains(o) {
        return this.elementData.indexOf(o) !== -1;
    }
    indexOf(o) {
        return this.elementData.indexOf(o);
    }
    [Symbol.iterator] () {
        return this.elementData[Symbol.iterator]();
    }
    lastIndexOf(o) {
        return this.elementData.lastIndexOf(o);
    }
    remove(o) {
        if (typeof o === "number") return this.removeIndex(o);
        let index = this.indexOf(o);
        if (index === -1) return undefined;
        let r = this.elementData.splice(index, 1);
        return r[0];
    }
    removeRange(fromIndex, toIndex) {
        this.elementData.splice(fromIndex, toIndex - fromIndex);
    }
    removeIndex (index) {
        if (this.size >= index) throw new Error(`index '${index}' out of range`);
        if (this.size < 0) throw new Error(`index '${index}' out of range`);
        let r = this.elementData.splice(index, 1);
        return r[0];
    }
};

module.exports = ArrayList;