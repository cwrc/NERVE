class TaggedEntityController {
    constructor(controller, model, taggedEntityModel) {
        Utility.log(TaggedEntityController, "constructor");
//        Utility.enforceTypes(arguments, Controller, Model, TaggedEntityModel);

        this.controller = controller;
        this.model = model;
        this.taggedEntityModel = taggedEntityModel;

        $(this.taggedEntityModel.getElement()).click((event) => this.click(event));
        $(this.taggedEntityModel.getContentElement()).click((event) => this.click(event));
        $(this.taggedEntityModel.getContentElement()).dblclick((event) => this.dblclick(event));
    }
    dblclick(event) {
        Utility.log(TaggedEntityController, "dblclick");
        window.getSelection().removeAllRanges();
        this.taggedEntityModel.selectLikeEntitiesByLemma();
        event.stopPropagation();
    }
    click(event) {
        Utility.log(TaggedEntityController, "click");
        event.stopPropagation();

        if (event.altKey) {
            console.log(this.taggedEntityModel);
            window.lastTarget = this.taggedEntityModel;
            return;
        }

        if (!event.ctrlKey) {
            this.model.getCollection().clear();
            event.stopPropagation();
        }

        if (!event.ctrlKey && !event.metaKey) {
            this.model.getCollection().set(this.taggedEntityModel);
        }
        else if (!this.model.getCollection().contains(this.taggedEntityModel)) {
            this.model.getCollection().add(this.taggedEntityModel);
        }
        else {
            this.model.getCollection().remove(this.taggedEntityModel);
        }
    }
}

module.exports = TaggedEntityController;