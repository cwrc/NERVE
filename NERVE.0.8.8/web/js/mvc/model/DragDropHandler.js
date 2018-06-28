
const AbstractModel = require("./AbstractModel");

module.exports = class DragDropHandler extends AbstractModel{

    constructor(){
        super();
        this.dataMap = new Map();
    }

    setData(field, data){
        this.dataMap.set(field, data);
    }

    getData(field){
        return this.dataMap.get(field);
    }

    /**
     * Retrieve and delete a field, return null if not found.
     * @param {type} field
     * @returns {DragDropHandler.deleteData@call;getData}
     */
    deleteData(field){
        if (!this.hasData(field)) return null;
        let r = this.getData(field);
        this.dataMap.delete(field);
        return r;
    }

    hasData(field){
        return this.dataMap.has(field);
    }
};