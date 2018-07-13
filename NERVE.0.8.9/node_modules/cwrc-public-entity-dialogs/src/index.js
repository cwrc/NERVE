var prevJQuery = window.jQuery;
var $ = require('jquery');
window.jQuery = $;
require('bootstrap');
window.jQuery = prevJQuery;


// entitySources is an object passed in by registerEntitySources that looks like:
// where the value of each setter on the map is an imported module.
/*
{
    people: (new Map()).set('viaf', viaf).set('dbpedia': dbpedia).set('wikidata': wikidata).set('getty':getty),
    places: (new Map()).set('viaf', viaf).set('dbpedia': dbpedia).set('wikidata': wikidata).set('getty':getty),
    organizations: (new Map()).set('viaf', viaf).set('dbpedia': dbpedia).set('wikidata': wikidata).set('getty':getty),
    titles: (new Map()).set('viaf', viaf).set('dbpedia': dbpedia).set('wikidata': wikidata).set('getty':getty),
}
*/

let entitySources;
function registerEntitySources(sources) {
    entitySources = sources;
}

function destroyModal() {
    let modal = $('#cwrc-entity-lookup');
    modal.modal('hide').data( 'bs.modal', null );
    modal[0].parentNode.removeChild(modal[0]);
}

function returnResult(result, searchOptions) {
    destroyModal()
    searchOptions.success(result);
}

function cancel(searchOptions) {
    destroyModal()
    if (searchOptions.cancel) searchOptions.cancel()
}

function clearOldResults() {
    $('.cwrc-result-list').empty()
}

function find(searchOptions) {
    clearOldResults()
    entitySources[searchOptions.entityType].forEach(
        (entitySource, entitySourceName)=>{
            entitySource[searchOptions.entityLookupMethodName](searchOptions.query).then(
                (results)=>showResults(results, entitySourceName, searchOptions),
                (error)=>console.log(`an error in the find: ${error}`))
        }
    )
}


var popoverAnchor = null;

function showPopover(result, li, ev) {

    ev.stopPropagation()

    if (popoverAnchor) {
        if (popoverAnchor[0] === li) {
            return  // we've already got a popup for this list item, so just return
        } else {
            popoverAnchor.popover('destroy')
            popoverAnchor = null;
            // have to remove the old click handler on the modal, which would have been bound to the old popover,
            // which now doesn't exist anymore, and so would try to destroy a non-existant popover, causing an
            // exception
            $('#cwrc-entity-lookup').off('.popover')

        }
    }

    popoverAnchor = $(li);

    popoverAnchor.popover({
        // delay: { "show": 600, "hide": 100 },
        animation: true,
        trigger: "manual",
        //placement: "auto",
        html: true,
        title: result.name,
        content: ()=>`<iframe id="entity-iframe" src="${result.uriForDisplay}" style="border:none;height:40em;width:38em"/>`
    })

    popoverAnchor.popover('show')

    // resize the popover
    popoverAnchor.data("bs.popover").tip().css({"max-width": "40em"})

    // add a check on the modal for a click event --> this will close the popover
    $('#cwrc-entity-lookup').on('click.popover', function(ev){
        // close popover
        popoverAnchor.popover('destroy')
        popoverAnchor = null;
        // remove this click handler
        $('#cwrc-entity-lookup').off('.popover')
    })

}

function showResults(results, entitySourceName, searchOptions) {
    let resultList = document.getElementById(`cwrc-${entitySourceName}-list`);
    //<li class="list-group-item">One</li>
    results.forEach((result, i)=>{
        let li = document.createElement('li')
        li.className = 'list-group-item cwrc-result-item'

        let descDiv = document.createElement('div')
        li.appendChild(descDiv)
        descDiv.innerHTML=result.description?
            `<b>${result.name}</b> - <i>${result.description}</i>`:
            `<b>${result.name}</b>`

        if (result.externalLink) {
            let linkDiv = document.createElement('div')
            li.appendChild(linkDiv)
            linkDiv.innerHTML =
                `<a href="${result.externalLink}" target="_blank">Open Full Description in New Window</a>`
        }

        resultList.appendChild(li)

        if (result.uriForDisplay) {
            $(li).on('click', function (ev) {
                showPopover(result, li, ev)
            })
        }
        li.ondblclick = ()=>returnResult(result, searchOptions)
    })
}

function initializeEntityPopup(searchOptions) {
    if (! document.getElementById('cwrc-entity-lookup') ) {
        var el = searchOptions.parentEl || document.body;
        $(el).append($.parseHTML(
            `<div id="cwrc-entity-lookup" class="modal fade">
                <div class="modal-dialog modal-lg ui-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                            <h3 id="cwrc-entity-lookup-title" class="modal-title"></h3>
                        </div>
                        <form id="entity-search-form">
                        <div class="modal-body">
                            
                            <div style="text-align:center;margin: 0 auto;padding-bottom: 2em" >
                              <input type="text" placeholder="Enter a name to find" class="form-control" id="cwrc-entity-query"/>
                            </div>
                            <div style="width:100%">  
                                <div style="display:inline-block;width:70%">
                                
                                    <div class="panel-group cwrc-result-panel" id="cwrc-viaf-panel">
                                        <div class="panel panel-default">
                                          <div class="panel-heading">
                                            <h4 class="panel-title">
                                              <a data-toggle="collapse" data-parent="#accordion" href="#collapse1">VIAF</a>
                                            </h4>
                                          </div>
                                          <div id="collapse1" class="panel-collapse collapse in">
                                            <ul class="list-group cwrc-result-list" id="cwrc-viaf-list">
                                            </ul>  
                                          </div>
                                        </div>
                                    </div>
                                    
                                    <div class="panel-group cwrc-result-panel" id="cwrc-dbpedia-panel">
                                        <div class="panel panel-default">
                                          <div class="panel-heading">
                                            <h4 class="panel-title">
                                              <a data-toggle="collapse" href="#collapse2">DBPedia</a>
                                            </h4>
                                          </div>
                                          <div id="collapse2" class="panel-collapse collapse in">
                                            <ul class="list-group  cwrc-result-list" id="cwrc-dbpedia-list">
                                            </ul>  
                                          </div>
                                        </div>
                                    </div>
                                    
                                    <div class="panel-group cwrc-result-panel" id="cwrc-geonames-panel">
                                        <div class="panel panel-default">
                                          <div class="panel-heading">
                                            <h4 class="panel-title">
                                              <a data-toggle="collapse" href="#collapse3">GeoNames</a>
                                            </h4>
                                          </div>
                                          <div id="collapse3" class="panel-collapse collapse in">
                                            <ul class="list-group  cwrc-result-list" id="cwrc-geonames-list">
                                            </ul>  
                                          </div>
                                        </div>
                                    </div>
                                    
                                    <div class="panel-group cwrc-result-panel" id="cwrc-geocode-panel">
                                        <div class="panel panel-default">
                                          <div class="panel-heading">
                                            <h4 class="panel-title">
                                              <a data-toggle="collapse" href="#collapse4">GeoCode</a>
                                            </h4>
                                          </div>
                                          <div id="collapse4" class="panel-collapse collapse in">
                                            <ul class="list-group  cwrc-result-list" id="cwrc-geocode-list">
                                            </ul>  
                                          </div>
                                        </div>
                                    </div>
                                    
                                    <div class="panel-group cwrc-result-panel" id="cwrc-getty-panel">
                                        <div class="panel panel-default">
                                          <div class="panel-heading">
                                            <h4 class="panel-title">
                                              <a data-toggle="collapse" href="#collapse5">Getty ULAN</a>
                                            </h4>
                                          </div>
                                          <div id="collapse5" class="panel-collapse collapse in">
                                            <ul class="list-group  cwrc-result-list" id="cwrc-getty-list">
                                            </ul>  
                                          </div>
                                        </div>
                                    </div>
                                    
                                    <div class="panel-group cwrc-result-panel" id="cwrc-wikidata-panel">
                                        <div class="panel panel-default">
                                          <div class="panel-heading">
                                            <h4 class="panel-title">
                                              <a data-toggle="collapse" href="#collapse6">Wikidata</a>
                                            </h4>
                                          </div>
                                          <div id="collapse6" class="panel-collapse collapse in">
                                            <ul class="list-group  cwrc-result-list" id="cwrc-wikidata-list">
                                            </ul>  
                                          </div>
                                        </div>
                                    </div>
                               </div>
                                <!--div style="display: inline-block; vertical-align:top; width:28%; padding-left:2em">
                                    <div id="div-iframe" style="border-style: inset; border-color: grey; overflow: scroll; height:100%; width:100%"> 
                                           <iframe align="top" id="cwrc-entity-info-frame" style="height:25em"  src="" sandbox="allow-same-origin"></iframe>
                                    </div>
                                </div-->
                            </div>
                        </div><!-- /.modal-body --> 
                        <div class="modal-footer">
                            <button id="cwrc-entity-lookup-cancel" type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>
                            <button id="cwrc-entity-lookup-redo" type="submit" value="Submit"  class="btn btn-default">Search again.</button>
                        </div><!-- /.modal-footer -->   
                        </form>
                    </div><!-- /.modal-content -->
                </div><!-- /.modal-dialog -->
            <!-- /.modal -->
            </div>`
        ));
        $('#cwrc-entity-lookup button[data-dismiss="modal"]').on('click', ()=>cancel(searchOptions));
        
        $('#cwrc-entity-lookup-title').text(searchOptions.entityLookupTitle);

        $('#entity-search-form').submit(function(event) {
            event.preventDefault();
            let newSearchOptions = Object.assign(
                {},
                searchOptions,
                {query: $('#cwrc-entity-query').val()}
            );
            find(newSearchOptions);
        })
    }
    $('#cwrc-entity-lookup').modal('show');
    
	if (searchOptions.parentEl) {
		var data = $('#cwrc-entity-lookup').data('bs.modal');
		data.$backdrop.detach().appendTo(searchOptions.parentEl);
	}
}

function layoutPanels(searchOptions) {
    initializeEntityPopup(searchOptions);
    // hide all panels
    $(".cwrc-result-panel").hide()
    // show panels registered for entity type
    entitySources[searchOptions.entityType].forEach((entitySource, entitySourceName)=>$(`#cwrc-${entitySourceName}-panel`).show())
}

function initialize(entityType, entityLookupMethodName, entityLookupTitle, searchOptions) {
    // create a new object and assign a few new properties,
    // We create the new object to avoid modifying the original object, i.e., avoid at least that side effect
    let newSearchOptionsObject = Object.assign(
        {entityType: entityType, entityLookupMethodName: entityLookupMethodName, entityLookupTitle: entityLookupTitle},
        searchOptions
    )
    layoutPanels(newSearchOptionsObject)
    if (newSearchOptionsObject.query) {
        document.getElementById('cwrc-entity-query').value = newSearchOptionsObject.query
        find(newSearchOptionsObject)
    }
}

function popSearchPerson(searchOptions) {
    return initialize('people', 'findPerson', 'Find a Person', searchOptions)
}
function popSearchPlace(searchOptions) {
    return initialize('places', 'findPlace', 'Find a Place', searchOptions)
}
function popSearchOrganization(searchOptions) {
    return initialize('organizations', 'findOrganization', 'Find an Organization', searchOptions)
}
function popSearchTitle(searchOptions) {
    return initialize('titles', 'findTitle', 'Find a Title', searchOptions)
}

module.exports = {
    // registerEntitySources lets us more easily pass in mocks when testing.
    registerEntitySources: registerEntitySources,

    popSearchPerson: popSearchPerson,
    popSearchOrganization: popSearchOrganization,
    popSearchPlace: popSearchPlace,
    popSearchTitle: popSearchTitle,

    popSearch: {
            person : popSearchPerson,
            organization : popSearchOrganization,
            place : popSearchPlace,
            title : popSearchTitle
        }

}

/*
The object that is passed to popupSearchXXX :
{
    query: query,
    success: (result)=>{result is described below},
    error: (error)=>{},
    cancelled: ()=>{},
}
The object that is returned in the success callback:
{
    result.id    // the cwrcBridge callback overwrites this with the result.uri
    result.uri
    result.name
    result.repository
    result.data  // the cwrc bridge doesn't use this, and actually just deletes it.
}
    The cwrcBridge either passes this to the Entity.setLookupInfo (which uses the id, name, and repository) if the call was the result of a search on
    an existing entity, OR passes the result object to the 'local' dialog.
*/
