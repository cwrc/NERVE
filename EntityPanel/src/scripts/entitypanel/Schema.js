
class Schema {
    async load(xmlText) {
        let xml = $.parseXML(xmlText);
        window.$xml = $(xml);
        this.$xml = $(xml);
        this.$start = $xml.find("start");
    }
    static branch(element) {
        while ($(element).attr("xmltagname") === undefined) {
            let parent = $(element).parent();
            if (parent.length === 0) throw new Error("Could not locate attribute 'xmltagname' on elements ancestors.");
            element = parent;
        }

        let branch = [];
        let parents = $(element).parents();

        branch.push($(element).attr("xmltagname"));

        for (let x of parents) {
            if ($(x).attr("xmltagname") === undefined) break;
            branch.unshift($(x).attr("xmltagname"));
        }

        return branch;
    }
    isValid(element, childNodeName) {
        let path = Schema.branch(element);
        if (childNodeName) path.push(childNodeName);
        return this.checkValidity(path, this.$start);
    }
    checkValidity(path, schemaNode) {
        switch ($(schemaNode).prop("tagName")) {
            case "any":
                return this.checkAny(path, schemaNode);
            case "element":
                return this.checkElement(path, schemaNode);
            case "ref":
                return this.checkRef(path, schemaNode);
            case "define":
            case "start":
            case "zeroOrMore":
            case "group":
            case "interleave":
            case "choice":
            case "optional":
            case "oneOrMore":
            case "List":
            case "mixed":
                return this.checkGroup(path, schemaNode);
            default:
                return false;
        }
    }
    
    checkAny(path, schemaNode) {
        let head = path.shift();
        if (path.length === 0) return true;

        for (let child of $(schemaNode).children()) {
            if (this.checkValidity(path, child)) return true;
        }

        path.unshift(head);
        return false;        
    }
    
    checkElement(path, schemaNode) {
        if ($(schemaNode).attr("name") !== path[0]) return false;

        let head = path.shift();
        if (path.length === 0) return true;

        for (let child of $(schemaNode).children()) {
            if (this.checkValidity(path, child)) return true;
        }

        path.unshift(head);
        return false;
    }
    checkRef(path, schemaNode) {
        let name = $(schemaNode).attr("name");
        let defines = $xml.find(`define[name='${name}']`);
        if (defines.length === 0) throw new Error(`Undefined lookup : ${name}`);
        return this.checkValidity(path, defines[0]);
    }
    checkGroup(path, schemaNode) {
        for (let child of $(schemaNode).children()) {
            if (this.checkValidity(path, child)) return true;
        }
        return false;
    }
}

module.exports = Schema;