'use strict';

/**
 * Return the unique identifier for this source.  This should have no spaces
 * and be in all lower case, as it is used as an identifier.
 * @returns {String}
 */
function getUID(){
    return "viaf";
}

/**
 * Return the ui display name for this source.
 * @returns {String}
 */
function getDisplayName(){
    return "VIAF";
}

/*
     config is passed through to fetch, so could include things like:
     {
         method: 'get',
         credentials: 'same-origin'
    }
*/
function fetchWithTimeout(url, config = {}, timeout = 30000) {

        return new Promise((resolve, reject) => {
            // the reject on the promise in the timeout callback won't have any effect, *unless*
            // the timeout is triggered before the fetch resolves, in which case the setTimeout rejects
            // the whole outer Promise, and the promise from the fetch is dropped entirely.
            setTimeout(() => reject(new Error('Call to VIAF timed out')), timeout);
            fetch(url, config).then(resolve, reject);
        }).then(
            response=>{
                // check for ok status
                if (response.ok) {
                    return response.json()
                }
                // if status not ok, through an error
                throw new Error(`Something wrong with the call to VIAF, possibly a problem with the network or the server. HTTP error: ${response.status}`);
            }/*,
            // instead of handling and rethrowing the error here, we just let it bubble through
            error => {
            // we could instead handle a reject from either of the fetch or setTimeout promises,
            // whichever first rejects, do some loggingor something, and then throw a new rejection.
                console.log(error)
                return Promise.reject(new Error(`some error jjk: ${error}`))
            }*/
        )
}

// note that this method is exposed on the npm module to simplify testing,
// i.e., to allow intercepting the HTTP call during testing, using sinon or similar.
function getEntitySourceURI(queryString, methodName) {
    return `https://viaf.org/viaf/search?query=${methodName}+all+%22${encodeURIComponent(queryString)}%22&httpAccept=application/json&maximumRecords=5`;
}

function getPersonLookupURI(queryString) {
    return getEntitySourceURI(queryString, 'local.personalNames')
}

function getPlaceLookupURI(queryString) {
    return getEntitySourceURI(queryString, 'local.geographicNames')
}

function getOrganizationLookupURI(queryString) {
    return getEntitySourceURI(queryString, 'local.corporateNames')
}

function getTitleLookupURI(queryString) {
    return getEntitySourceURI(queryString, 'local.uniformTitleWorks')
}

function callVIAF(url, queryString) {

        return fetchWithTimeout(url).then((parsedJSON)=>{
            console.log(parsedJSON)
            return parsedJSON.searchRetrieveResponse.records ? parsedJSON.searchRetrieveResponse.records.map(
                ({
                     record: {
                         recordData: {
                             nameType,
                             Document: {'@about': uri},
                             mainHeadings: {data: headings}
                            // mainHeadings: {data: {text: name}}

                         }
                     }
                 }) => {
                    let name = Array.isArray(headings) ?
                        headings[0].text:
                        headings.text;
                    let uriForDisplay = uri.replace('http', 'https')
                    return {nameType, id: uri, uri, uriForDisplay, name, repository: 'VIAF', originalQueryString: queryString}
                }) : []
        })

}

 function findPerson(queryString) {
    return callVIAF(getPersonLookupURI(queryString), queryString)
}

 function findPlace(queryString) {
    return callVIAF(getPlaceLookupURI(queryString), queryString)
}

 function findOrganization(queryString) {
    return callVIAF(getOrganizationLookupURI(queryString), queryString)
}

 function findTitle(queryString) {
    return callVIAF(getTitleLookupURI(queryString), queryString)
}

module.exports = {
    findPerson: findPerson,
    findPlace: findPlace,
    findOrganization: findOrganization,
    findTitle: findTitle,
    getPersonLookupURI: getPersonLookupURI,
    getPlaceLookupURI: getPlaceLookupURI,
    getOrganizationLookupURI: getOrganizationLookupURI,
    getTitleLookupURI: getTitleLookupURI,
    fetchWithTimeout: fetchWithTimeout,
    getUID: getUID,
    getDisplayName: getDisplayName    
}