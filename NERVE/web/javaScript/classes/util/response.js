/* global Utility */

/**
 * A generic response object to serve as the base class for methods that may
 * return a response.
 * Contains two fields, result:boolean and message:string.  The result indicates whether
 * the actions was a success, the message is a string to be displayed to the
 * user upon return.  This object is intended to be expanded on to return
 * extra information if necessary.
 * @type type
 */
class Response{
    constructor(result = false, message = ""){
        Utility.log(Response, "constructor");
        Utility.enforceTypes(arguments, ["optional", Boolean], ["optional", String]);
        this.result = result;
        this.message = message;
    }

    hasMessage(){
        Utility.log(Response, "hasMessage");
        Utility.enforceTypes(arguments);
        return this.message !== "";
    }
}