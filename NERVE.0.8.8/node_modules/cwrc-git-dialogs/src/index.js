'use strict';

var prevJQuery = window.jQuery;
var $ = require('jquery');
window.jQuery = $;
require('bootstrap');
window.jQuery = prevJQuery;

var Cookies = require('js-cookie');
var cwrcGit = require('cwrc-git-server-client');

var cwrcAppName = "CWRC-GitWriter" + "-web-app";
var blankTEIDoc = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-model href="https://cwrc.ca/schemas/cwrc_tei_lite.rng" type="application/xml" schematypens="http://relaxng.org/ns/structure/1.0"?>
<?xml-stylesheet type="text/css" href="https://cwrc.ca/templates/css/tei.css"?>
<TEI xmlns="http://www.tei-c.org/ns/1.0" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
	xmlns:cw="http://cwrc.ca/ns/cw#" xmlns:w="http://cwrctc.artsrn.ualberta.ca/#">
	<text>
		<body>
			<div>
				<head>
					<title>Replace with your title</title>
				</head>
				<p>Replace with your text</p>
			</div>
		</body>
	</text>
</TEI>`;

let dialogs = {
    
}

function getInfoAndReposForAuthenticatedUser(writer) {
    return cwrcGit.getInfoForAuthenticatedUser()
        .done(function(info) {
            writer.githubUser = info
            $('#private-tab').text(`${writer.githubUser.login} documents`)
            showRepos(writer, writer.githubUser.login, '#github-private-doc-list')
        }).fail(function(errorMessage) {
            console.log("in the fail in getInfoAndReposForAuthenticatedUser")
            var message = (errorMessage == 'login')?`You must first authenticate with Github.`:`Couldn't find anything for that id.  Please try again.`
            console.log(message)
            $('#cwrc-message').text(message).show()
        });
}

/* TODO: might want to set the github details somewhere else, like maybe here in the object exported from the module.*/

function setDocInEditor(writer, result) {
    writer.repoName = result.repo;
    writer.repoOwner = result.owner;
    writer.parentCommitSHA = result.parentCommitSHA;
    writer.baseTreeSHA = result.baseTreeSHA;
    var xmlDoc = $.parseXML(result.doc);
    writer.fileManager.loadDocumentFromXml(xmlDoc);
    //writer.editor.isNotDirty = 1;
  // writer.loadDocument(xmlDoc);
}

function removeDocFromEditor(writer) {
    delete writer.repoName 
    delete writer.parentCommitSHA
    delete writer.baseTreeSHA 
}

function setBlankDocumentInEditor(writer) {
    var defaultxmlDoc = $.parseXML(blankTEIDoc);
   // writer.fileManager.loadDocumentFromXml(defaultxmlDoc);
   writer.fileManager.loadDocumentFromXml(defaultxmlDoc);
}

function isCurrentDocValid(writer) {
    return writer.getDocRawContent().includes('_tag')
}

function loadDoc(writer, reponame) {
    return cwrcGit.getDoc(reponame)
        .done(function( result ) {
            setDocInEditor(writer, result)
        }).fail(function(errorMessage) {
            console.log("in the getDoc fail");
            console.log(errorMessage);
        });
}


function createRepoForCurrentDoc(writer, repoName, repoDesc, isPrivate) {
    writer.event('savingDocument').publish();
    var annotations = "some annotations";
    var versionTimestamp = Math.floor(Date.now() / 1000);
    var docText = writer.converter.getDocumentContent(true);
    return cwrcGit.createCWRCRepo(repoName, repoDesc, isPrivate, docText, annotations, versionTimestamp)
        .done(function(result){
            setDocInEditor(writer, result);
            writer.event('documentSaved').publish(true)
        })
        .fail(function(errorMessage){
            writer.event('documentSaved').publish(false)
        })
}

function processSuccessfulSave(writer) {
    writer.editor.isNotDirty = 1; // force clean state
    writer.dialogManager.show('message', {
        title: 'Document Save',
        msg: 'Saved successfully.'
    });
    writer.event('documentSaved').publish(true);
};

function saveDoc(writer) {
    writer.event('savingDocument').publish();
    var versionTimestamp = Math.floor(Date.now() / 1000);
    var docText = writer.converter.getDocumentContent(true);
    
  //  1.  MAYBE PUT THE VALIDATION CHECK HERE, BUT MAYBE PUT IT IN CWRCGIT?  PROBABLY BETTER HERE SINCE I ALREADY HAVE THE 
  //  CALL TO THE VALIDATOR HERE VIA THE WRITER.  AND DONT' WANT TO PUT THAT INTO THE CWRCGIT.  
  
    return cwrcGit.saveDoc(writer.repoName, writer.repoOwner, writer.parentCommitSHA, writer.baseTreeSHA, docText, versionTimestamp)
        .done(function(result){
            setDocInEditor(writer, result);
            processSuccessfulSave(writer)
           // writer.event('documentSaved').publish(true)
        })
        .fail(function(errorMessage){
            writer.event('documentSaved').publish(false)
        })
}


function showRepos(writer, gitName, listContainerId, searchTerms) {   
        var queryString = cwrcAppName;
        if (searchTerms) queryString += "+" + searchTerms;
        if (gitName) queryString += "+user:" + gitName;

        cwrcGit.search(queryString)
            .done(function (results) {
                populateResultList(writer, results, listContainerId)
            }).fail(function(errorMessage) {
                $('#cwrc-message').text(`Couldn't find anything for your query.  Please try again.`).show()
            })
}

function showTemplates(writer) {   
    cwrcGit.getTemplates()
        .done(function( templates ) {
            populateTemplateList(writer, templates, '#template-list')
        }).fail(function(errorMessage) {
            $('#cwrc-message').text(`Couldn't find the templates. Please check your connection or try again.`).show();
        });
}

function populateTemplateList(writer, templates, listGroupId) {
    $(function () { 
        var listContainer = $(listGroupId);
        listContainer.empty()

        for (var template of templates) {
            listContainer.prepend(`
                <a id="gh_${template.name}" href="#" data-template="${template.name}" class="list-group-item git-repo">
                    <h4 class="list-group-item-heading">${template.name}</h4>
                </a>`);
        }

        $('#cwrc-message').hide();
        
        $(`${listGroupId} .list-group-item`).on('click', function() {
            var $this = $(this);
            var $templateName = $this.data('template');
            loadTemplate(writer, $templateName);
            
            $('#githubLoadModal').modal('hide');
        });
        
    });
}

function loadTemplate(writer, templateName) {
    cwrcGit.getTemplate(templateName)
        .done(function( result ) {
            writer.fileManager.loadDocumentFromXml(result);
        }).fail(function(errorMessage) {
            console.log("in the getTemplate fail");
            console.log(errorMessage);
        });
}


 function populateResultList(writer, results, listGroupId) {
    $(function () { 
        var listContainer = $(listGroupId);
        listContainer.empty()
        for (var result of results.items) {
            var htmlForResultRow =
                `<a id="gh_${result.repository.id}" href="#" data-ghrepo="${result.repository.full_name}" data-ghrepoid="${result.repository.id}" class="list-group-item git-repo">
                    <h4 class="list-group-item-heading">${result.repository.full_name}</h4>
                    <p class="list-group-item-text">${result.repository.description?result.repository.description:'(no description)'}</p>`;
            for (var textMatch of result.text_matches) {
                if (! textMatch.fragment.includes(cwrcAppName)) {
                    var fragment = textMatch.fragment;
                    var searchString = textMatch.matches[0].text;
                    var boldSearchString = `<b>${searchString}</b>`;
                    var regex = new RegExp(searchString,"gi");
                    var boldFragment = fragment.replace('<', '&lt;').replace('>', '&gt;').replace(regex, boldSearchString);

                    htmlForResultRow += `<p>${boldFragment}</p>`
                } 
            }
            htmlForResultRow += `</a>`;
            listContainer.prepend(htmlForResultRow);
            
        }

        $('#cwrc-message').hide();
        
        $(`${listGroupId} .list-group-item`).on('click', function() {
            var $gitHubRepoName = $(this).data('ghrepo');
            loadDoc(writer, $gitHubRepoName);
            $('#githubLoadModal').modal('hide');
        });
        
    });
}

dialogs.save = function(writer){
    var el = writer.dialogManager.getDialogWrapper();
    $(el).append($.parseHTML(
        
    `<div id="githubSaveModal" class="modal fade">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                
                <div id="menu" class="modal-body">
                    
                    <div style="margin-bottom:2em">
                        <button type="button" class="close" data-dismiss="modal" aria-hidden="true" style="float:right"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button>
                        <h4 id="gh-modal-title' class="modal-title" style="text-align:center">Save</h4>
                    </div>

                    <div style="well" style="margin-top:1em;text-align:center">
                        <h5 id="save-cwrc-message">
                            This document is associated with the ${writer.repoOwner}/${writer.repoName} GitHub repository.  You may save to it, or save to a new repository.
                        </h5>
                    </div>

                    <form id="github-save-new-form" class="well collapse" style="margin-top:1em">
                                
                                    <div class="form-group">
                                        <label for="save-git-doc-name">Document Name</label>
                                        <small id="new-document-name-help" class="text-muted" style="margin-left:1em">
                                        The name for the document and also for the new Github repository that will be created for the document.
                                        </small>
                                        <input id="save-git-doc-name" type="text" class="form-control" aria-describedby="new-document-name-help"/>
                                    </div><!-- /form-group -->
                                
                                    <div class="form-group">
                                        <label for="save-git-doc-description">Description of document</label>
                                        <small id="new-document-description-help" class="text-muted" style="margin-left:1em">
                                              A short description of the document that will appear on the github page.
                                        </small>
                                        <textarea class="form-control" id="save-git-doc-description" rows="3" aria-describedby="new-document-description-help"></textarea>    
                                     </div><!-- /form-group -->
                                
                                    <div class="form-group">
                                        <div class="form-check">
                                            <label class="form-check-label">
                                                <input id="save-git-doc-private" type="checkbox" class="form-check-input" aria-describedby="new-document-private-help">
                                                Private
                                            </label>
                                            <small id="new-document-private-help" class="text-muted" style="margin-left:1em">
                                                  You may create a private repository if you have a paid Github account.
                                            </small>
                                        </div>
                                     </div><!-- /form-group -->
                                
                                    <div class="form-group">
                                        <button id="dismiss-save-new-btn" type="button" class="btn btn-default"  >Cancel</button>
                                        <button type="submit" value="Submit" id="create-doc-btn" class="btn btn-default">Create</button>
                                    </div>
                            
                    </form> 

                </div><!-- /.modal-body -->
                <div class="modal-footer">
                    <form id="github-save-form"  style="margin-top:1em">
                            <div class="form-group">
                                <button id="save-doc-btn" class="btn btn-default">Save</button>
                                <button id="open-save-new-doc-btn" href="#github-save-new-form" class="btn btn-default"  data-toggle="collapse">Save to a new repository</button>
                                <button class="btn btn-default" data-dismiss="modal">Cancel</button>
                                
                            </div>              
                    </form>
                </div><!-- /.modal-footer -->
            </div><!-- /.modal-content -->
        </div><!-- /.modal-dialog -->
    </div><!-- /.modal -->`));

    $(function () {
        $('[data-toggle="popover"]').popover()
    });


    $('#github-save-new-form').submit(function(event){
      event.preventDefault();
      var repoName = $('#save-git-doc-name').val();
      var repoDesc = $('#save-git-doc-description').val();
      var isPrivate = $('#save-git-doc-private').checked;
      $('#githubSaveModal').modal('hide');
      createRepoForCurrentDoc(writer, repoName, repoDesc, isPrivate).then(
        function(success){
                //alert(success);
               // $('#githubSaveModal').modal('hide');
                $('#save-cwrc-message').text(`This document is associated with the ${writer.repoOwner}/${writer.repoName} GitHub repository.  You may save to it, or save to a new repository.`);
            },
        function(failure){
            console.log(failure);
            $('#save-cwrc-message').text("Couldn't save.").show()
        });
    });

    if (Cookies.get('cwrc-token')) {
        // the user should already be logged in if they've edited a doc.
        // So, don't need this check.  what I really want to check is if they've
        // already selected a repository.  if so, show the save button.  if not, hide the save button 
        // and only show the save to new repo button.
        $('#open-save-new-doc-btn').show();
    } else {
        $('#open-save-new-doc-btn').hide();
    }

    $('#open-save-new-doc-btn').click(function(ev){$('#github-save-form').hide()});

    $('#dismiss-save-new-btn').click(function(ev){
        $('#github-save-form').show();
        $('#github-save-new-form').hide();
    });
    
    $('#githubSaveModal').modal({backdrop: 'static', keyboard: false}).on('hidden.bs.modal', function() {
            $(this).remove()
        });
        
    var data = $('#githubSaveModal').data('bs.modal');
    data.$backdrop.detach().appendTo(el);
    
    if (!writer.repoName) {
        $('#save-doc-btn').hide();
        $('#save-cwrc-message').text("This document isn't yet associated with a GitHub repository.");
    } 
    $('#save-doc-btn').click(function(event){
        $('#githubSaveModal').modal('hide');
        saveDoc(writer).then(
            function(success){
                //$('#githubSaveModal').modal('hide');
            },
            function(failure){
                console.log("save failed, and the return value is: ");
                console.log(failure);
                //alert(failure);
            }
        );
    });
};

function showLoadModal(writer) {
    var el = writer.dialogManager.getDialogWrapper();
    $(el).append($.parseHTML(
            
        `<div id="githubLoadModal" class="modal fade">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
     
                    <div id="menu" class="modal-body">
                        <div style="margin-bottom:2em">
                              <button id="close-load-btn" type="button" class="close"  aria-hidden="true" style="float:right"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button>
                           <h4 id="gh-modal-title' class="modal-title" style="text-align:center">Load From a CWRC-enabled Github Repository</h4>
                        </div>
                        <div style="margin-top:1em">
                            <div id="cwrc-message" class="text-warning" style="margin-top:1em">some text</div>
                        </div>


                            <!-- Nav tabs -->
                        <ul class="nav nav-tabs" role="tablist">
                          <li class="nav-item">
                            <a class="nav-link active" id="private-tab" data-toggle="tab" href="#private" role="tab">My Documents</a>
                          </li>
                          <li class="nav-item">
                            <a class="nav-link" data-toggle="tab" href="#public" role="tab">Search all public CWRC Github documents</a>
                          </li>
                          <li class="nav-item">
                            <a class="nav-link" data-toggle="tab" href="#templates" role="tab">CWRC Templates</a>
                          </li>
                          
                        </ul>

                        <!-- Tab panes -->
                        <div class="tab-content">
                            <div class="tab-pane active" id="private" role="tabpanel">
                                <form role="search" id="github-private-form">
                                    <div class="row" style="margin-top:1em">
                                        <div class="col-xs-4">   
                                            <div class="input-group">
                                                <input type="text" class="form-control input-md" id="private-search-terms" name="private-search-terms"
                                                       placeholder="Search your documents"/>
                                                <span class="input-group-btn">
                                                    <button type="submit" value="Submit" class="btn btn-default"><span class="glyphicon glyphicon-search" aria-hidden="true"></span>&nbsp;</button>
                                                </span>
                                            </div>  
                                        </div>
                                        <div class="col-xs-4">
                                            
                                        </div>
                                        <div class="col-xs-4">
                                            <!--button id="open-new-doc-btn" href="#github-new-form"  class="btn btn-default"  style="float:right" data-toggle="collapse" >Blank Document</button-->
                                            <button id="blank-doc-btn" class="btn btn-default"  style="float:right" >Blank Document</button>
                                        </div>
                                    </div>
                                </form>
                          
                                <div id="github-private-doc-list" class="list-group" style="padding-top:1em"></div>
                            </div><!-- /tab-pane -->
                            
                            <!-- PUBLIC REPOS PANE -->
                            <div class="tab-pane" id="public" role="tabpanel">
                                
                                    <form role="search" id="github-public-form">
                                        <div class="row" style="margin-top:1em">
                                            <div class="col-xs-4">   
                                                <div class="input-group">
                                                    <input type="text" class="form-control input-md" id="public-search-terms" name="public-search-terms"
                                                           placeholder="Search"/>
                                                    <span class="input-group-btn">
                                                        <button type="submit" value="Submit" class="btn btn-default"><span class="glyphicon glyphicon-search" aria-hidden="true"></span>&nbsp;</button>
                                                    </span>
                                                </div>  
                                            </div>
                                            <div class="col-xs-4">
                                                <!--div class="input-group">
                                                    <input type="text" class="form-control input-md" id="public-topic-terms" name="public-topic-terms"
                                                           placeholder="Filter by GitHub topic"/>
                                                    <span class="input-group-btn">
                                                        <button type="submit" value="Submit" class="btn btn-default"><span class="glyphicon glyphicon-search" aria-hidden="true"></span>&nbsp;</button>
                                                    </span>
                                                </div-->  
                                            </div>
                                            <div class="col-xs-4">
                                                <div class="input-group" >
                                                    <input id="git-user" type="text" class="form-control" placeholder="Limit to github user or organization" aria-describedby="git-user-addon"/>
                                                    <div class="input-group-btn" id="git-user-id-addon">
                                                        <button type="submit" value="Submit" id="new-user-btn" class="btn btn-default"><span class="glyphicon glyphicon-search" aria-hidden="true"></span>&nbsp;</button>
                                                    </div>
                                                </div><!-- /input-group -->
                                            </div>
                                        </div>
                                    </form>

                               
                                <div id="github-public-doc-list" class="list-group" style="padding-top:1em"></div>
                            </div><!-- /tab-pane -->

                            <!-- TEMPLATES PANE -->
                            <div class="tab-pane" id="templates" role="tabpanel">
                            
                                <div id="template-list" class="list-group" style="padding-top:1em"></div>
                            </div><!-- /tab-pane -->                     

                        </div> <!-- /tab-content -->
                    </div><!-- /.modal-body -->
                    <div class="modal-footer">
                        <button type="button" class="btn btn-default" id="cancel-load-btn">Cancel</button>
                    </div>
                </div><!-- /.modal-content -->
            </div><!-- /.modal-dialog -->
        </div><!-- /.modal -->`));

        // enable popover functionality - bootstrap requires explicit enabling
        $(function () {
            $('[data-toggle="popover"]').popover()
        });

         $('#close-load-btn').add('#cancel-load-btn').click(function(event){
            // if the load popup window has been triggered then don't allow it to close unless we have
            // a valid document in the editor.
            if (isCurrentDocValid(writer)) {
                $('#githubLoadModal').modal('hide');
            } else {
                $('#cwrc-message').text('You must either load a document from GitHub or choose "Blank Document"').show()
            }
        });

         $('#blank-doc-btn').click(function(event){
            $('#githubLoadModal').modal('hide');
            setBlankDocumentInEditor(writer);
        });

        $('#github-public-form').submit(function(event){
          event.preventDefault();
          var gitName = $('#git-user').val();
          var publicSearchTerms = $('#public-search-terms').val();
         // var publicTopicTerms = $('#public-topic-terms').val();
          showRepos(writer, gitName,'#github-public-doc-list',publicSearchTerms);
        });

        $('#github-private-form').submit(function(event){
          event.preventDefault();
          var privateSearchTerms = $('#private-search-terms').val();
          showRepos(writer, writer.githubUser.login,'#github-private-doc-list',privateSearchTerms);
        });


        $('#github-new-form').submit(function(event){
          event.preventDefault();
          var repoName = $('#git-doc-name').val();
          var repoDesc = $('#git-doc-description').val();
          var isPrivate = $('#git-doc-private').checked;
         // console.log("should be about to close the repo");
          $('#githubLoadModal').modal('hide');
           createRepoWithBlankDoc(writer, repoName, repoDesc, isPrivate);
        });
        
        getInfoAndReposForAuthenticatedUser(writer);
        showTemplates(writer);
        $('#open-new-doc-btn').show();
        $('#cwrc-message').hide();
        $('#private-tab').tab('show')
        $('#githubLoadModal').modal({backdrop: 'static', keyboard: false}).on('hidden.bs.modal', function() {
            $(this).remove()
        });
        
        var data = $('#githubLoadModal').data('bs.modal');
        data.$backdrop.detach().appendTo(el);
}

function showExistingDocModal(writer) {
    var el = writer.dialogManager.getDialogWrapper();
     $(el).append($.parseHTML(  
            `<div id="existing-doc-modal" class="modal fade">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div id="menu" class="modal-body">
                            <div style="margin-bottom:2em">
                                <button type="button" class="close" data-dismiss="modal" aria-hidden="true" style="float:right"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button>
                                <h4 id="gh-modal-title' class="modal-title" style="text-align:center">Existing Document</h4>
                            </div>
                            <div style="margin-top:1em">
                                <div id="cwrc-message" style="margin-top:1em">
                                    You have a document loaded into the editor.  Would you like to load a new document, and close your existing document?
                                    </a>
                                </div>
                            </div>
                            <div style="text-align:center;margin-top:3em;margin-bottom:3em" id="git-oath-btn-grp">
                                <div class="input-group" >
                                        <button type="button" class="btn btn-default" data-dismiss="modal" id="existing-doc-cancel-btn">Return to Existing Document</button>                                
                                        <button type="button" class="btn btn-default" id="existing-doc-continue-btn" >Continue to Load New Document</button>
                                    </div>
                                </div> <!--input group -->
                            </div>
                        </div><!-- /.modal-body --> 
                    </div><!-- /.modal-content -->
                </div><!-- /.modal-dialog -->
            </div><!-- /.modal -->`
        ))

        $('#existing-doc-continue-btn').click(function(event){
            $('#existing-doc-modal').modal('hide');
            removeDocFromEditor(writer)
            dialogs.load(writer)
        })

        $('#existing-doc-modal').modal('show').
        on('shown.bs.modal', function () {
            $(".modal").css('display', 'block');
        }).
        on('hidden.bs.modal', function() {
            $(this).remove()
        })
        
        var data = $('#existing-doc-modal').data('bs.modal');
        data.$backdrop.detach().appendTo(el);
}

dialogs.load = function(writer) {  
    if (dialogs.authenticate()) {
        writer.repoName?showExistingDocModal(writer):showLoadModal(writer)
    }
}

dialogs.authenticate = function() {
    
     if (Cookies.get('cwrc-token')) {
        return true
    } else {
        
        $(document.body).append($.parseHTML(  
            `<div id="githubAuthenticateModal" class="modal fade">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div id="menu" class="modal-body">
                            <div style="margin-bottom:2em">
                                <button type="button" class="close" data-dismiss="modal" aria-hidden="true" style="float:right"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button>
                                <h4 id="gh-modal-title' class="modal-title" style="text-align:center">Authenticate with Github</h4>
                            </div>
                            <div style="margin-top:1em">
                                <div id="cwrc-message" style="margin-top:1em">
                                    You must first authenticate through Github to allow the CWRC-Writer 
                                    to make calls on your behalf.  CWRC does not keep any of your github 
                                    information.  The github token issued by github is not stored on a 
                                    CWRC-Server, but is only submitted as a jwt token for each request 
                                    you make.  If you are looking for a version of the CWRC-Writer that 
                                    does not use Github to store documents, please try our other sandbox:  
                                    <a href="http://apps.testing.cwrc.ca/editor/dev/editor_dev.htm">
                                        CWRC-Writer Simple Sandbox
                                    </a>
                                </div>
                            </div>
                            <div style="text-align:center;margin-top:3em;margin-bottom:3em" id="git-oath-btn-grp">
                                <div class="input-group" >
                                    <div class="input-group-btn" >
                                        <button type="button" id="git-oauth-btn" class="btn btn-default">Authenticate with Github</button>
                                    </div>
                                </div> <!--input group -->
                            </div>
                        </div><!-- /.modal-body --> 
                    </div><!-- /.modal-content -->
                </div><!-- /.modal-dialog -->
            </div><!-- /.modal -->`
        ));

        $('#git-oauth-btn').click(function(event){
            window.location.href = "/github/authenticate";
        });

        $('#githubAuthenticateModal').modal('show').on('shown.bs.modal', function () {
            $(".modal").css('display', 'block');
        }).on('hidden.bs.modal', function() {
            $(this).remove()
        })

        return false
    }
     
}

module.exports = dialogs