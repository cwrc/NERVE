

/**
 * Connects Model with other models.
 * @type type
 */
class ModelListener{

    constructor(model, cwrcDialogModel){
        this.model = model;
        cwrcDialogModel.addListener(this);
    }

    notifyCWRCSelection(result){
        console.log(result);
        this.model.updateAllSelected(result);
    }
}

module.exports = ModelListener;