class SearchView{
    notifySearchChange(range){
        console.log(range);
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
    }
}

module.exports = SearchView;