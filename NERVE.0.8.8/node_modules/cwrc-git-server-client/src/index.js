'use strict';
var $ = require('jquery');
var Cookies = require('js-cookie');
  
function callCWRCGitWithToken(ajaxConfig) {
	var theJWT = Cookies.get('cwrc-token');
    if (theJWT) {
    	ajaxConfig.headers = {'cwrc-token':theJWT};
    }
    return $.ajax(ajaxConfig);
}
 
function createCWRCRepo(repoName, description, isPrivate, theDoc, annotations, versionTimestamp) {
	var data = {
        repo: repoName, 
        isPrivate: isPrivate, 
        description: description, 
        doc: theDoc, 
        annotations: annotations, 
        versionTimestamp: versionTimestamp
    };
	//console.log(data);
	var ajaxConfig = {
        type: 'POST',
        dataType: 'json',
        data: data,
        url:  '/github/user/repos'
    };
  	return callCWRCGitWithToken(ajaxConfig);
}

function getReposForGithubUser(githubName) {
	var url = `/github/users/${githubName}/repos`;
	var ajaxConfig = {
        type: 'GET',
        dataType: 'json',
        url:  url
    };
    return callCWRCGitWithToken(ajaxConfig);
}

function getReposForAuthenticatedGithubUser() {
    if (Cookies.get('cwrc-token')) {
        var url = '/github/user/repos';
        var ajaxConfig = {
            type: 'GET',
            dataType: 'json',
            url:  url
        };
        return callCWRCGitWithToken(ajaxConfig);
    } else {
        return $.Deferred().reject("login").promise();
    }
}

// repoName here is the combined owner/repo, e.g., 'jchartrand/someRepoName'
function getDoc(repoName){
    var ajaxConfig = {
        type: 'GET',
        dataType: 'json',
        url: `/github/repos/${repoName}/doc`
    };
    return callCWRCGitWithToken(ajaxConfig);
}

function getInfoForAuthenticatedUser() {
    if (Cookies.get('cwrc-token')) {
        var url = '/github/users';
        var ajaxConfig = {
            type: 'GET',
            dataType: 'json',
            url:  url
        };
        return callCWRCGitWithToken(ajaxConfig);
    } else {
        return $.Deferred().reject("login").promise();
    }
}

function saveDoc(repo, owner, parentCommitSHA, baseTreeSHA, docText, versionTimestamp) {
    // I'M ADDING FAKE ANNOTATIONS HERE, BUT I COULD PASS THE REAL ONES, EXTRACTED FROM THE CWRC-WRITER
   // OR JUST PASS THE WHOLE DOC, WITH ANNOTATIONS IN THE HEADER, TO THE SERVER, AND ONLY THEN EXTRACT THE ANNOTATIONS
   // FROM THE HEADER.
    var data = {doc: docText, baseTreeSHA: baseTreeSHA, parentCommitSHA: parentCommitSHA, annotations: 'annotationText', versionTimestamp: versionTimestamp};
    
    var ajaxConfig = {
        type: 'PUT',
        dataType: 'json',
        data: data,
        url:  `/github/repos/${owner}/${repo}/doc`
    };
    return callCWRCGitWithToken(ajaxConfig)
}

function getTemplates() {
    var ajaxConfig = {
        type: 'GET',
        dataType: 'json',
        url: `/github/templates`
    };
    return callCWRCGitWithToken(ajaxConfig)
}

function getTemplate(templateName) {
    var ajaxConfig = {
        type: 'GET',
        dataType: 'xml',
        url: `/github/templates/${templateName}`
    };
    return callCWRCGitWithToken(ajaxConfig)
}

function search(query) {
    var ajaxConfig = {
        type: 'GET',
        dataType: 'json',
        url: `/github/search`,
        data: `q=${query}`
    };
    return callCWRCGitWithToken(ajaxConfig)
}



module.exports = {
	createCWRCRepo: createCWRCRepo,
	getReposForGithubUser: getReposForGithubUser,
    getReposForAuthenticatedGithubUser: getReposForAuthenticatedGithubUser,
    saveDoc: saveDoc,
    getDoc: getDoc,
    getInfoForAuthenticatedUser: getInfoForAuthenticatedUser,
    getTemplates: getTemplates,
    getTemplate: getTemplate,
    search: search
}
   

