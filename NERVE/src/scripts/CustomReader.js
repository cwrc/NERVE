
class CustomReader{    
    constructor(target){
        this.target = target;
        
        this.reader = new FileReader();
        this.reader.model = this;
        
        this.reader.onload = async function (event) {
            let result = {
                filename : this.filename,
                contents : event.target.result
            };
            this.resolve(result);
        }.bind(this);

        /* file dialog event - related to menu open */
        $(target).change(async (event) => {
            this.filename = event.currentTarget.files[0].name;
            await this.reader.readAsText(event.currentTarget.files[0]);
            $(target).val("");
        });
    }
    
    /*
     * Return an object with {filename, contents}
     * @returns {Promise}
     */
    async show(){               
        let callback = function (resolve, reject) {
            this.resolve = resolve;
            this.reject = reject;
        }.bind(this);
        
        $(this.target).click();
        
        return new Promise(callback);
    }
    
    async loadDocument(filename, text, action) {
        let encodeResponse = null;
        switch (action) {
            case "OPEN": /* NER & dict */
                encodeResponse = await this.scriber.encode(text);
                break;
            case "EDIT": /* open no dict, no NER */
                encodeResponse = await this.scriber.edit(text);
                break;
            case "TAG": /* NER only */
                encodeResponse = await this.scriber.tag(text);
                break;
            case "LINK": /* NER only */
                encodeResponse = await this.scriber.link(text);
                break;
        }

        encodeResponse.setFilename(filename);
        await this.setDocument(encodeResponse.text, encodeResponse.context, encodeResponse.filename, encodeResponse.schemaURL);
        this.isSaved = true;
    }    
}

module.exports = CustomReader;