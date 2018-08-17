/**
 * This class is a documentation of which events are fired by the LemmaDialog.
 * The 'dataObject' refers to a tagged entity.
 * @type type
 */

class LeammDialogEvents{
    notifyClickLemmaWidget(lemmaDialog, category, lemma, ctrl, shift, alt){}
    notifyDblClickLemmaWidget(lemmaDialog, category, lemma, ctrl, shift, alt){}
    notifyLemmaDropWidget(lemmaDialog, category, lemma, dataObject){}
    notifyLemmaDropObject(lemmaDialog, category, lemma, dataObject){}
    notifyExpandCategory(lemmaDialog, categoryArray){}
    notifyCollapseCategory(lemmaDialog, categoryArray){}
    notifyCategoryDropWidget(lemmaDialog, category, dataObject){}
    notifyCategoryDropObject(lemmaDialog, category, dataObject){}
    notifyEyeState(lemmaDialog, categoryArray, newState){}
}