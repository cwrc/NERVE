"use strict";
let Constants = class Constants {
	constructor() {
	}
	static __isTransient() {
		return false;
	}
	static __getClass() {
		return "ca.fa.jjjrmi.translator.Constants";
	}
	static __isEnum() {
		return false;
	}
};

Constants.KeyParam = "key";
Constants.FlagParam = "flags";
Constants.TypeParam = "type";
Constants.PrimitiveParam = "primitive";
Constants.ValueParam = "value";
Constants.FieldsParam = "fields";
Constants.NameParam = "name";
Constants.ElementsParam = "elements";
Constants.DepthParam = "depth";
Constants.PointerParam = "ptr";
Constants.EnumParam = "enum";
Constants.CustomType = "@custom";
Constants.TransientValue = "trans";
Constants.NullValue = "null";
Constants.PrimativeTypeString = "string";
Constants.PrimativeTypeNumber = "number";
Constants.PrimativeTypeBoolean = "boolean";

module.exports = Constants;