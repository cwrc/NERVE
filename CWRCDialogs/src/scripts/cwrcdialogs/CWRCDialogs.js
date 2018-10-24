const $ = window.$ ? window.$ : require("jquery");
const jQuery = $;
const Widget = require("nidget").Widget;
const FileOperations = require("utility").FileOperations;
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

        $('#cwrc-entity-lookup button[data-dismiss="modal"]').on('click', () => cancel());
        $('#cwrc-entity-lookup-title').text(this.currentSearchOptions.entityLookupTitle);
        $('#cwrc-entity-query').keyup((event) => {
            if (event.which === 13) {
                this.find($('#cwrc-entity-query').val());
            }
        });
        $('#cwrc-entity-lookup-redo').click(function (event) {
            find($('#cwrc-entity-query').val());
        });
        $('#cwrc-manual-input').keyup(function (event) {
            $(this).parent().removeClass('has-error').find('span.help-block').remove();
            handleSelectButtonState();
        });
        $('#cwrc-entity-lookup-new').click(function (event) {
            if (this.currentSearchOptions.entityType === 'title') {
                $('#cwrc-entity-lookup').modal('hide');
                doShowModal('cwrc-title-entity-dialog');
            } else {
                openEntityFormWindow(false);
            }
        });
        $('#cwrc-entity-lookup-edit').click(function (event) {
            if (this.currentSearchOptions.entityType === 'title') {
                $('#cwrc-entity-lookup').modal('hide');
                doShowModal('cwrc-title-entity-dialog');
            } else if (this.selectedResult !== undefined && this.selectedResult.repository === 'CWRC') {
                openEntityFormWindow(true);
            }
        });
        $('#cwrc-entity-lookup-nolink').click(function (event) {
            returnResult({});
        });

        $('#cwrc-title-entity-dialog-ok').click(function (event) {
            openEntityFormWindow();
            $('#cwrc-title-entity-dialog').modal('hide');
            doShowModal('cwrc-entity-lookup');
        });
        $('#cwrc-title-entity-dialog button[data-dismiss="modal"]').click(function (event) {
            $('#cwrc-title-entity-dialog').modal('hide');
            doShowModal('cwrc-entity-lookup');
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
     * @param {type} sourceMethod The name of the method to call on the target.
     * @returns {undefined}
     */
    async search(entityQuery, sourceMethod) {
        $($("[id^=cwrc-panel-]")).hide();

        for (let source of this.entitySources) {
            if (typeof source[sourceMethod] === "function") {
                this.performSearch(source, entityQuery, sourceMethod);
            }
        }
    }

    async performSearch(source, entityQuery, sourceMethod) {
        $("[id^=cwrc-list]").empty();
        $(`#cwrc-panel-${source.getUID()}`).show();
        let result = source[sourceMethod](entityQuery);
        console.log(result);

        let tagName = "";
        switch (sourceMethod) {
            case "findPlace":
                tagName = "LOCATION";
                $("#cwrc-entity-lookup-title").text("Search Location");
                break;
            case "findPerson":
                tagName = "PERSON";
                $("#cwrc-entity-lookup-title").text("Search Person");
                break;
            case "findOrganization":
                tagName = "ORGANIZATION";
                $("#cwrc-entity-lookup-title").text("Search Organization");
                break;
            case "findTitle":
                tagName = "TITLE";
                $("#cwrc-entity-lookup-title").text("Search Title");
                break;
        }

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
    }

    hide() {
        $(this.getElement()).modal('hide');
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