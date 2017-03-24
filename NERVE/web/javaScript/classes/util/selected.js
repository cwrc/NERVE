
/**
 * A class to control and manipuate the user mouse selection.
 * @type Selector
 */
class Selector {
    constructor(element) {
        this.onSelect = function(){};
        this.onNoSelect = function(){};

        element.addEventListener("click", (event) => {
            /* if alt-ctrl is pressed print range to console and exit */
            event.stopPropagation();

            if (event.ctrlKey === true && event.altKey === true){
                let range = window.getSelection().getRangeAt(0);
                console.log(range.toString());
                return;
            }

            this.onSelect(window.getSelection().getRangeAt(0), event);

            window.getSelection().removeAllRanges();
        }, false);
    }

    setOnSelect(callback){
        this.onSelect = callback;
    }

    setNoSelection(callback){
        this.onNoSelect = callback;
    }
}

Selected = {};

Selected.nodeType = {
    element: 1,
    attr: 2,
    text: 3,
    cdataSection: 4,
    entityReference: 5,
    entity: 6,
    processingInstruction: 7,
    comment: 8,
    document: 9,
    documentType: 10,
    documentFragment: 11,
    notation: 12
};

/**
 * Get the closest common element between two dom nodes.
 * @param {type} node1
 * @param {type} node2
 * @returns {jQuery|Selected.commonAncestor.parents1}
 */
Selected.commonAncestor = function (node1, node2) {
    let parents1 = $(node1).parents();
    let parents2 = $(node2).parents();
    let index1 = parents1.length - 1;
    let index2 = parents2.length - 1;

    if (parents1[index1] !== parents2[index2]) {
        throw new Error("Elements not from the same root document");
    }

    let commonAncestor = null;
    while (parents1[index1] === parents2[index2] && index1 >= 0 && index2 >= 0) {
        commonAncestor = parents1[index1];
        index1--;
        index2--;
    }

    return commonAncestor;
};

/**
 * Get the offset where the html of child begins in the html of parent.
 * @param {type} parent
 * @param {type} targetChild
 * @returns {undefined}
 */
Selected.innerHTMLOffset = function (parent, targetChild) {

    let offset = 0;
    let childNodes = parent.childNodes;

    currentParent = targetChild.getParentElement;
    while (currentParent !== parent) {
    }

    for (let node of childNodes) {
        console.log(node);
        if (targetChild === node) return offset;
        else {
            if (node.nodeType === Selected.nodeType.text) {
                offset += node.textContent.length;
            }
        }
    }

}

/**
 * Get the offset where the html of child begins in the html of parent.
 * @param {type} parent
 * @param {type} targetChild
 * @returns {undefined}
 */
Selected.offsetInParentHTML = function (targetNode) {

    let offset = 0;
    let childNodes = targetNode.parentElement.childNodes;

    for (let node of childNodes) {
        if (targetNode === node) return offset;
        else {
            if (node.nodeType === Selected.nodeType.text) {
                offset += node.textContent.length;
            }
        }
    }
    return -1; /* sanity check */
};

