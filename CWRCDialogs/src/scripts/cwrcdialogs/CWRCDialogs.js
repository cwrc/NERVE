const $ = window.$ ? window.$ : require("jquery");
const jQuery = $;
const Widget = require("nidget").Widget;
const FileOperations = require("@thaerious/utility").FileOperations;
const ResultWidget = require("./ResultWidget");

class CWRCDialogs extends Widget {
    constructor(delegate) {
        super(null, delegate);
        this.channel = undefined;
        this.popoverAnchor = null;

        this.entitySources = [];
        this.entityFormsRoot = '';
        this.collectionsRoot = '';
        this.showCreateNewButton = true;
        this.showEditButton = true;
        this.showNoLinkButton = true;

        this.currentSearchOptions = {
            entityType: undefined,
            entityLookupMethodName: undefined,
            entityLookupTitle: undefined,
            searchOptions: undefined
        };
        this.selectedResult = undefined;
    }

    async load() {
        let domElement = await FileOperations.loadDOMElement(`assets/cwrcdialogs/dialog.frag.html`);
        $("body").append(domElement);
        this.setElement(domElement);
        
        $("#cwrc-entity-lookup-redo").click((event)=>{
            let query = $("#cwrc-entity-query").val();
            this.search(query);
        });
        
        $("#cwrc-entity-query").keyup((event)=>{
            if (event.key === "Enter"){
                let query = $("#cwrc-entity-query").val();
                this.search(query);
            }
        });        
        
        return this;
    }

    /**
     * Valid source methods are:
     * async findPerson() : 
     * async findPlace() : 
     * async findOrganization() : 
     * async findTitle() :
     * @param {type} entityQuery The string to query.
     * @param {type} action
     * @returns {undefined}
     */
    async search(entityQuery, action = this.lastAction) {
        $($("[id^=cwrc-panel-]")).hide();

        $("#cwrc-entity-query").val(entityQuery);

        this.lastAction = action;
        let tagName = "";
        let sourceMethod = "";
                
        switch (action.toLowerCase()) {
            case "location":
            case "findplace":
                tagName = "LOCATION";
                sourceMethod = "findPlace";
                $("#cwrc-entity-lookup-title").text("Search Location");
                break;
            case "person":
            case "findperson":
                tagName = "PERSON";
                sourceMethod = "findPerson";
                $("#cwrc-entity-lookup-title").text("Search Person");
                break;
            case "organization":
            case "findorganization":
                tagName = "ORGANIZATION";
                sourceMethod = "findOrganization";
                $("#cwrc-entity-lookup-title").text("Search Organization");
                break;
            case "title":
            case "findtitle":
                tagName = "TITLE";
                sourceMethod = "findTitle";
                $("#cwrc-entity-lookup-title").text("Search Title");
                break;
        }

        for (let source of this.entitySources) {
            if (typeof source[sourceMethod] === "function") {
                this.__performSearch(source, entityQuery, sourceMethod, tagName);
            }
        }
        
        return this;
    }

    /**
     * Perform the actual search from 3rd party sites.
     * @param {type} source
     * @param {type} entityQuery
     * @param {type} sourceMethod
     * @param {type} tagName
     * @returns {undefined}
     */
    async __performSearch(source, entityQuery, sourceMethod, tagName) {
        $("[id^=cwrc-list]").empty();
        $(`#cwrc-panel-${source.getUID()}`).show();

        let result = source[sourceMethod](entityQuery);
        let onSuccess = (results) => this.showResults(results, source.getUID(), tagName);
        let onError = (error) => this.showError(error, source.getUID());

        result.then(onSuccess, onError);
    }

    async showResults(resultArray, entitySourceName, tagName) {
        let resultList = $(`#cwrc-list-${entitySourceName}`);

        if (resultArray.length === 0) {
            resultList.append('<li class="list-group-item">No results</li>');
        } else {
            for (let result of resultArray) {
                let resultWidget = new ResultWidget(this, result, tagName);
                await resultWidget.load();
                resultList.append(resultWidget.getElement());
            }
        }
    }

    showError(error, entitySourceName) {
        console.log("ERROR");
        console.log(entitySourceName);
        console.log(error);
    }

    show() {
        $(this.getElement()).modal();
        return this;
    }

    hide() {
        $(this.getElement()).modal('hide');
        return this;
    }

    /**
     * Add a source implementing the following interface.
     * getUID() : string
     * getDisplayName() : string
     * async findPerson() : 
     * async findPlace() : 
     * async findOrganization() : 
     * async findTitle() :
     * @param {type} source
     * @returns {undefined}
     */
    async registerEntitySource(source) {
        this.entitySources.push(source);

        let varMap = new Map();
        let panelText = await FileOperations.getURL(`assets/cwrcdialogs/panel.frag.html`);

        varMap.set("panel_id", source.getUID());
        varMap.set("panel_title", source.getDisplayName());
        let panelElement = await FileOperations.stringToDOMElement(panelText, varMap);

        $(this.getElement()).find("#cwrc-panels").prepend(panelElement);
    }

    setEntityFormsRoot(url) {
        this.entityFormsRoot = url;
    }

    setCollectionsRoot(url) {
        this.collectionsRoot = url;
    }

    setShowCreateNewButton(value) {
        if (typeof value === 'boolean') {
            this.showCreateNewButton = value;
        }
    }

    setShowEditButton(value) {
        if (typeof value === 'boolean') {
            this.showEditButton = value;
        }
    }

    setShowNoLinkButton(value) {
        if (typeof value === 'boolean') {
            this.showNoLinkButton = value;
        }
    }

    destroyModal(modalId) {
        if (modalId === undefined) {
            destroyModal('cwrc-entity-lookup');
            destroyModal('cwrc-title-entity-dialog');
        } else {
            let modal = $('#' + modalId);
            modal.modal('hide').data('bs.modal', null);
            modal[0].parentNode.removeChild(modal[0]);

            if (modalId === 'cwrc-entity-lookup') {
                if (this.channel) {
                    this.channel.close();
                }
                destroyPopover();
            }
        }
    }

    destroyPopover() {
        $('#cwrc-entity-lookup').off('.popover');
        $('#entity-iframe').off('load');
        if (this.popoverAnchor) {
            this.popoverAnchor.popover('destroy');
            popoverAnchor = null;
        }
    }

    returnResult(result) {
        this.destroyModal();
        this.currentSearchOptions.success(result);
    }

    cancel() {
        this.destroyModal();
        if (this.currentSearchOptions.cancel) this.currentSearchOptions.cancel();
    }

    clearOldResults() {
        this.selectedResult = undefined;
        $('.cwrc-result-list').empty();
    }

    showPopover(result, li, event) {
        event.stopPropagation();

        if (this.popoverAnchor) {
            if (this.popoverAnchor[0] === li) {
                return;  // we've already got a popup for this list item, so just return
            } else {
                destroyPopover();
                // need to delay show until destroy method finishes hiding the previous popover (default hide time is 150 ms)
                setTimeout(() => this.doShow(result, li), 175);
            }
        } else {
            this.doShow(result, li);
        }

    }

    doShow(result, li) {
        this.popoverAnchor = $(li);

        this.popoverAnchor.popover({
            // delay: { "show": 600, "hide": 100 },
            animation: true,
            trigger: "manual",
            //placement: "auto",
            html: true,
            title: result.name,
            content: () => `<div id="entity-iframe-loading" style="width:38em">Loading...</div><iframe id="entity-iframe" src="${result.uriForDisplay}" style="display:none;border:none;height:40em;width:38em"/>`
        });

        this.popoverAnchor.popover('show');

        $('#entity-iframe').on('load', function () {
            $('#entity-iframe-loading').hide();
            $('#entity-iframe').show();
        });

        // resize the popover
        this.popoverAnchor.data("bs.popover").tip().css({"max-width": "40em"});

        // add a check on the modal for a click event --> this will close the popover
        $('#cwrc-entity-lookup').on('click.popover', function () {
            // close popover
            destroyPopover();
        });
    }

    showError(error, entitySourceName) {
        let resultList = $(`#cwrc-${entitySourceName}-list`);
        resultList.append(`<li class="list-group-item list-group-item-danger">${error}</li>`);
    }
}

module.exports = CWRCDialogs;