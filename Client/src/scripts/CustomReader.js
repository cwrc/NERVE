'use strict';

/**
 * Maintains a file load dialog.
 */
class CustomReader{    
    
    /**
     * @param {type} target id of input with type file.
     * @returns {nm$_CustomReader.CustomReader}
     */
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
}

module.exports = CustomReader;