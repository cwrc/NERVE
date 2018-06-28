
let defaults = {
    entity : "#entityLookupButton",
    lemma : "#lemmaLookupButton"
};

module.exports = class CWRCDialogController{
    constructor(cwrcDialogModel, entityDialogModel){
        this.cwrcDialogModel = cwrcDialogModel;
        this.entityDialogModel = entityDialogModel;

        $(defaults.entity).click((event)=>this.clickEntityText(event));
        $(defaults.lemma).click((event)=>this.clickLemma(event));
    }

    clickEntityText(event){
        let entityDialogValues = this.entityDialogModel.getValues();
        this.cwrcDialogModel.queryEntity(entityDialogValues);
    }

    clickLemma(event){
        let entityDialogValues = this.entityDialogModel.getValues();
        this.cwrcDialogModel.queryLemma(entityDialogValues);
    }
};