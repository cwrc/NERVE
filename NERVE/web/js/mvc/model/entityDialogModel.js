module.exports = class EntityDialogModel{
    getValues() {
        Utility.log(EntityDialogModel, "getValues");
        Utility.enforceTypes(arguments);
        return new EntityValues($("#txtEntity").val(), $("#txtLemma").val(), $("#txtLink").val(), $("#selectTagName").val());
    }
};