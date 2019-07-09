const postJSON = require("../frame/postJSON.js");
const getXML = require("../frame/getXML.js");

function packResult(src, res, result){
    return {
        sourceDocument : src,
        resultDocument : res,
        testResult : result
    };
}

module.exports = {
    
    load_plain : {
        description : "markup the plain document using ner-service",
        run : async function(){
            this.source = await getXML("plain.xml");
            
            let settings = {
                document: this.source
            };
            
            this.result = await postJSON("ner", JSON.stringify(settings));  
            this.success = true;
        }
    },
    no_document : {
        description : "not having a document throws an error (status 400)",
        run : async function(){
            let settings = {
            };
            
            try{
                this.result = await postJSON("ner", JSON.stringify(settings));
                this.success = false;
            } catch(ex){
                this.exception = ex;
                this.success = true;
            }            
        }
    },
    null_settings : {
        description : "null settings throws and exception (status 500)",
        run : async function(){            
            try{
                this.result = await postJSON("ner", null);
                this.success = false;
            } catch(ex){
                this.exception = ex;
                this.success = true;
            }            
        }
    },
    undef_settings : {
        description : "undefined settings throws and exception (status 500)",
        run : async function(){            
            try{
                this.result = await postJSON("ner", null);
                this.success = false;
            } catch(ex){
                this.exception = ex;
                this.success = true;
            }            
        }
    }       
    
};

