'use strict';

/**
 * Return the unique identifier for this source.  This should have no spaces
 * and be in all lower case, as it is used as an identifier.
 * @returns {String}
 */
function getUID(){
    return "geonames";
}

/**
 * Return the ui display name for this source.
 * @returns {String}
 */
function getDisplayName(){
    return "GeoNames";
}


/*
     config is passed through to fetch, so could include things like:
     {
         method: 'get',
         credentials: 'same-origin'
    }
    Note that the default config includes the accept header.  If an over-riding config
    is passed in, don't forget to set the accept header so we get json back from dbpedia
    and not XML.
*/

function fetchWithTimeout(url, config = {headers: {'Accept': 'application/json'}}, timeout = 30000) {

        return new Promise((resolve, reject) => {
            // the reject on the promise in the timeout callback won't have any effect, *unless*
            // the timeout is triggered before the fetch resolves, in which case the setTimeout rejects
            // the whole outer Promise, and the promise from the fetch is dropped entirely.
            setTimeout(() => reject(new Error('Call to geonames timed out')), timeout);
            fetch(url, config).then(resolve, reject);
        }).then(
            response=>{
                // check for ok status
                if (response.ok) {
                    return response.json()
                }
                // if status not ok, through an error
                throw new Error(`Something wrong with the call to geonames, possibly a problem with the network or the server. HTTP error: ${response.status}`);
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

function getPlaceLookupURI(queryString) {
    return `https://secure.geonames.org/searchJSON?q=${encodeURIComponent(queryString)}&username=cwrcgeonames&maxRows=10`
}

function callGeonamesURL(url, queryString) {

    return fetchWithTimeout(url).then((parsedJSON)=>{
        return parsedJSON.geonames.map(
            ({
                 toponymName,
                 adminName1: state = '',
                 countryName = '',
                 geonameId,
                 fcodeName: description = 'No description available'
             }) => {
                let name = `${toponymName} ${state} ${countryName}`;
                let uri = `http://geonames.org/${geonameId}`
                return {
                    nameType: 'place',
                    id: uri,
                    uri,
                    uriForDisplay: null,
                    externalLink: uri,
                    name,
                    repository: 'geonames',
                    originalQueryString: queryString,
                    description
                }
            })
    })
}

function findPlace(queryString) {
    return callGeonamesURL(getPlaceLookupURI(queryString), queryString)
}


module.exports = {
    findPlace: findPlace,
    getPlaceLookupURI: getPlaceLookupURI,
    getUID: getUID,
    getDisplayName: getDisplayName    
}