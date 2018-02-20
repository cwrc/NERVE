
class EntityPanelWidget {
    constructor(target) {
        this.container = document.createElement("ul");
        $(this.container).attr("data-role", "listview");
        $(this.container).attr("data-inset", "false");
        $(this.container).attr("data-iconpos", "right");

        $(target).append(this.container);
        $(this.container).listview();
    }
    addCategory(catName) {
        let categoryElement = document.createElement("li");
        let categoryHeader = document.createElement("h2");

        $(categoryElement).attr("data-role", "collapsible");
        $(categoryElement).attr("data-iconpos", "right");
        $(categoryElement).attr("data-inset", "false");
        $(categoryHeader).text(catName);
        $(categoryElement).append(categoryHeader);

        let list = document.createElement("ul");
        $(list).attr("data-listContainer", catName);
        $(list).attr("data-role", "listview");
        $(list).attr("data-iconpos", "right");
        $(list).attr("data-inset", "false");

        $(categoryElement).append(list);
        $(this.container).append(categoryElement);

        $(this.container).listview("refresh");
        $(categoryElement).collapsible();
        $(list).listview();

        return this;
    }
    addItem(catName, itemName, action, item) {
        let categoryElement = $(`[data-listContainer="${catName}"`);
        let listElement = document.createElement("li");
        let listAnchor = document.createElement("a");
        $(listAnchor).attr("href", "#");
        $(listAnchor).text(itemName);

        $(categoryElement).append(listElement);
        $(listElement).append(listAnchor);

        $(listAnchor).click((event)=>action(event, item));

        $(categoryElement).listview("refresh");
        return this;
    }
}