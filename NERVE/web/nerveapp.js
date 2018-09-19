(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
////window.jQuery = require("jquery");
//window.$ = jQuery;
//
//require("./util/customQuery");
//
//const View = require("./mvc/view/View");
//const EntityDialog = require("./mvc/EntityDialog");
//const EnityPanelWidget = require("./mvc/EnityPanelWidget");
//const Menu = require("./mvc/menu/Menu");
//const MessageHandler = require("./mvc/messageHandler");
//const CWRCDialogModel = require("./mvc/CWRCDialogModel");
//const Model = require("./mvc/model/Model");
//const HostInfo = require("./util/hostinfo");
//const TaggedEntityWidget = require("./mvc/TaggedEntityWidget");
//const nerve = require("nerve");
//const AbstractModel = require("Nidget/src/AbstractModel");
//const CustomQuery = require("./util/CustomQuery");
//const UndoHandler = require("./mvc/UndoHandler");
//
//const LemmmaDialog = require("LemmaDialog");
//
//window.jjjrmi = require("jjjrmi");
//
//$(window).on('load', async function () {
//    console.log("Initializing main");
//
////    jjjrmi.JJJRMISocket.flags.CONNECT = true;
////    jjjrmi.JJJRMISocket.flags.RECEIVED = true;
////    jjjrmi.JJJRMISocket.flags.SENT = true;
//
//    jjjrmi.JJJRMISocket.registerPackage(require("nerscriber"));
//    jjjrmi.JJJRMISocket.registerPackage(require("jjjsql"));
//    jjjrmi.JJJRMISocket.registerPackage(nerve);
//
//    window.main = new Main();
//    await main.initialize();
//
//    console.log("... main init complete");
//});
//
//class Main extends AbstractModel {
//    constructor() {
//        super();
//        this.model = null;
//        this.view = null;
//    }
//    async initialize() {       
//        /* --- USER INTERACTION & DOCUMENT MODEL --- */
//        this.model = new Model();
//        this.view = new View();        
//        this.cwrc = new CWRCDialogModel();        
//        this.undo = new UndoHandler();
//        
//        this.view.setThrobberMessage("Loading...");
//        this.view.showThrobber(true, 1.0);
//        
//        this.model.addListener(this.view);
//        this.model.addListener(new MessageHandler($("#userMessage")));
//        this.model.addListener(this.cwrc);
//        this.model.addListener(CustomQuery.instance);
//                
//        
//        /* --- LEMMA DIALOG (LHS) --- */
//        this.lemmaDialog = new LemmmaDialog("#lemmaDialog");
//
//        /* --- ENTITY PANEL (middle) --- */
//        this.entityPanelWidget = new EnityPanelWidget();
//
//        /* --- ENTITY DIALOG (RHS) --- */
////        this.entityDialog = new EntityDialog();        
//
//        /* --- MENU (top) --- */
//        this.menu = new Menu();
//        
//        /* SETUP ALL CROSS LISTENERS (order may matter) */
//        /* undo saves state and has to be the last listener */
//        this.model.addListener(this.lemmaDialog);        
//        this.model.addListener(this.entityPanelWidget);
////        this.model.addListener(this.entityDialog);
//        this.model.addListener(TaggedEntityWidget.contextMenu);
//        this.model.addListener(TaggedEntityWidget.delegate);
//                
//        this.entityPanelWidget.addListener(this.lemmaDialog);
//        this.entityPanelWidget.addListener(this.model);
//        this.entityPanelWidget.addListener(this.undo);
//        
//        this.lemmaDialog.addListener(this.entityPanelWidget);    
//        
////        this.entityDialog.addListener(this.lemmaDialog);
////        this.entityDialog.addListener(this.entityPanelWidget);        
////        this.entityDialog.addListener(this.cwrc);
////        this.entityDialog.addListener(this.model);
////        
////        this.entityPanelWidget.addListener(this.entityDialog);
//
//        this.cwrc.addListener(this.entityPanelWidget);
////        this.cwrc.addListener(this.entityDialog);        
//
//        this.menu.addListener(this.view);        
//        this.menu.addListener(this.entityPanelWidget);
//        this.menu.addListener(this.model);
////        this.menu.addListener(this.entityDialog);
//        this.menu.addListener(this.undo);
//                
//        TaggedEntityWidget.delegate.addListener(TaggedEntityWidget.contextMenu);
//        TaggedEntityWidget.delegate.addListener(this.entityPanelWidget);
////TaggedEntityWidget.delegate.addListener(this.lemmaDialogWidget);
//        TaggedEntityWidget.delegate.addListener(this.model);
//        TaggedEntityWidget.delegate.addListener(this.undo);
//        
//        this.undo.addListener(this.model);
////this.undo.addListener(this.lemmaDialogWidget);
//        this.undo.addListener(this.entityPanelWidget);
//        
//        /* --- CONNECT SOCKET AND EXTRANEOUS SETUP --- */
//        this.rootSocket = new jjjrmi.JJJRMISocket("NerveSocket");   
//        this.rootObject = await this.rootSocket.connect();
//        this.scriber = this.rootObject.scriber;
//        this.model.setScriber(this.scriber);
//
//        this.rootObject.getProgressMonitor().addListener(this.view);
//
//        /* model.init has to be kept near the end as it triggers a notifyContextChange event */
//        await this.entityPanelWidget.init(this.rootObject.dictionary);
//        await this.model.init(this.rootObject.dictionary);        
//        
//        this.view.showThrobber(false);
//        
//        TaggedEntityWidget.contextMenu.setDictionary(this.rootObject.dictionary);     
//        
//        this.entityPanelWidget.addListener(TaggedEntityWidget.contextMenu);
//        this.addListener(TaggedEntityWidget.contextMenu);
////        this.addListener(this.entityDialog);
//        
//        this.notifyListeners("notifyReady");
//    }
//}
},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkM6L1VzZXJzL2Vkd2FyZC9BcHBEYXRhL1JvYW1pbmcvbnBtL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvd2ViL2pzL21haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiLy8vL3dpbmRvdy5qUXVlcnkgPSByZXF1aXJlKFwianF1ZXJ5XCIpO1xyXG4vL3dpbmRvdy4kID0galF1ZXJ5O1xyXG4vL1xyXG4vL3JlcXVpcmUoXCIuL3V0aWwvY3VzdG9tUXVlcnlcIik7XHJcbi8vXHJcbi8vY29uc3QgVmlldyA9IHJlcXVpcmUoXCIuL212Yy92aWV3L1ZpZXdcIik7XHJcbi8vY29uc3QgRW50aXR5RGlhbG9nID0gcmVxdWlyZShcIi4vbXZjL0VudGl0eURpYWxvZ1wiKTtcclxuLy9jb25zdCBFbml0eVBhbmVsV2lkZ2V0ID0gcmVxdWlyZShcIi4vbXZjL0VuaXR5UGFuZWxXaWRnZXRcIik7XHJcbi8vY29uc3QgTWVudSA9IHJlcXVpcmUoXCIuL212Yy9tZW51L01lbnVcIik7XHJcbi8vY29uc3QgTWVzc2FnZUhhbmRsZXIgPSByZXF1aXJlKFwiLi9tdmMvbWVzc2FnZUhhbmRsZXJcIik7XHJcbi8vY29uc3QgQ1dSQ0RpYWxvZ01vZGVsID0gcmVxdWlyZShcIi4vbXZjL0NXUkNEaWFsb2dNb2RlbFwiKTtcclxuLy9jb25zdCBNb2RlbCA9IHJlcXVpcmUoXCIuL212Yy9tb2RlbC9Nb2RlbFwiKTtcclxuLy9jb25zdCBIb3N0SW5mbyA9IHJlcXVpcmUoXCIuL3V0aWwvaG9zdGluZm9cIik7XHJcbi8vY29uc3QgVGFnZ2VkRW50aXR5V2lkZ2V0ID0gcmVxdWlyZShcIi4vbXZjL1RhZ2dlZEVudGl0eVdpZGdldFwiKTtcclxuLy9jb25zdCBuZXJ2ZSA9IHJlcXVpcmUoXCJuZXJ2ZVwiKTtcclxuLy9jb25zdCBBYnN0cmFjdE1vZGVsID0gcmVxdWlyZShcIk5pZGdldC9zcmMvQWJzdHJhY3RNb2RlbFwiKTtcclxuLy9jb25zdCBDdXN0b21RdWVyeSA9IHJlcXVpcmUoXCIuL3V0aWwvQ3VzdG9tUXVlcnlcIik7XHJcbi8vY29uc3QgVW5kb0hhbmRsZXIgPSByZXF1aXJlKFwiLi9tdmMvVW5kb0hhbmRsZXJcIik7XHJcbi8vXHJcbi8vY29uc3QgTGVtbW1hRGlhbG9nID0gcmVxdWlyZShcIkxlbW1hRGlhbG9nXCIpO1xyXG4vL1xyXG4vL3dpbmRvdy5qampybWkgPSByZXF1aXJlKFwiampqcm1pXCIpO1xyXG4vL1xyXG4vLyQod2luZG93KS5vbignbG9hZCcsIGFzeW5jIGZ1bmN0aW9uICgpIHtcclxuLy8gICAgY29uc29sZS5sb2coXCJJbml0aWFsaXppbmcgbWFpblwiKTtcclxuLy9cclxuLy8vLyAgICBqampybWkuSkpKUk1JU29ja2V0LmZsYWdzLkNPTk5FQ1QgPSB0cnVlO1xyXG4vLy8vICAgIGpqanJtaS5KSkpSTUlTb2NrZXQuZmxhZ3MuUkVDRUlWRUQgPSB0cnVlO1xyXG4vLy8vICAgIGpqanJtaS5KSkpSTUlTb2NrZXQuZmxhZ3MuU0VOVCA9IHRydWU7XHJcbi8vXHJcbi8vICAgIGpqanJtaS5KSkpSTUlTb2NrZXQucmVnaXN0ZXJQYWNrYWdlKHJlcXVpcmUoXCJuZXJzY3JpYmVyXCIpKTtcclxuLy8gICAgampqcm1pLkpKSlJNSVNvY2tldC5yZWdpc3RlclBhY2thZ2UocmVxdWlyZShcImpqanNxbFwiKSk7XHJcbi8vICAgIGpqanJtaS5KSkpSTUlTb2NrZXQucmVnaXN0ZXJQYWNrYWdlKG5lcnZlKTtcclxuLy9cclxuLy8gICAgd2luZG93Lm1haW4gPSBuZXcgTWFpbigpO1xyXG4vLyAgICBhd2FpdCBtYWluLmluaXRpYWxpemUoKTtcclxuLy9cclxuLy8gICAgY29uc29sZS5sb2coXCIuLi4gbWFpbiBpbml0IGNvbXBsZXRlXCIpO1xyXG4vL30pO1xyXG4vL1xyXG4vL2NsYXNzIE1haW4gZXh0ZW5kcyBBYnN0cmFjdE1vZGVsIHtcclxuLy8gICAgY29uc3RydWN0b3IoKSB7XHJcbi8vICAgICAgICBzdXBlcigpO1xyXG4vLyAgICAgICAgdGhpcy5tb2RlbCA9IG51bGw7XHJcbi8vICAgICAgICB0aGlzLnZpZXcgPSBudWxsO1xyXG4vLyAgICB9XHJcbi8vICAgIGFzeW5jIGluaXRpYWxpemUoKSB7ICAgICAgIFxyXG4vLyAgICAgICAgLyogLS0tIFVTRVIgSU5URVJBQ1RJT04gJiBET0NVTUVOVCBNT0RFTCAtLS0gKi9cclxuLy8gICAgICAgIHRoaXMubW9kZWwgPSBuZXcgTW9kZWwoKTtcclxuLy8gICAgICAgIHRoaXMudmlldyA9IG5ldyBWaWV3KCk7ICAgICAgICBcclxuLy8gICAgICAgIHRoaXMuY3dyYyA9IG5ldyBDV1JDRGlhbG9nTW9kZWwoKTsgICAgICAgIFxyXG4vLyAgICAgICAgdGhpcy51bmRvID0gbmV3IFVuZG9IYW5kbGVyKCk7XHJcbi8vICAgICAgICBcclxuLy8gICAgICAgIHRoaXMudmlldy5zZXRUaHJvYmJlck1lc3NhZ2UoXCJMb2FkaW5nLi4uXCIpO1xyXG4vLyAgICAgICAgdGhpcy52aWV3LnNob3dUaHJvYmJlcih0cnVlLCAxLjApO1xyXG4vLyAgICAgICAgXHJcbi8vICAgICAgICB0aGlzLm1vZGVsLmFkZExpc3RlbmVyKHRoaXMudmlldyk7XHJcbi8vICAgICAgICB0aGlzLm1vZGVsLmFkZExpc3RlbmVyKG5ldyBNZXNzYWdlSGFuZGxlcigkKFwiI3VzZXJNZXNzYWdlXCIpKSk7XHJcbi8vICAgICAgICB0aGlzLm1vZGVsLmFkZExpc3RlbmVyKHRoaXMuY3dyYyk7XHJcbi8vICAgICAgICB0aGlzLm1vZGVsLmFkZExpc3RlbmVyKEN1c3RvbVF1ZXJ5Lmluc3RhbmNlKTtcclxuLy8gICAgICAgICAgICAgICAgXHJcbi8vICAgICAgICBcclxuLy8gICAgICAgIC8qIC0tLSBMRU1NQSBESUFMT0cgKExIUykgLS0tICovXHJcbi8vICAgICAgICB0aGlzLmxlbW1hRGlhbG9nID0gbmV3IExlbW1tYURpYWxvZyhcIiNsZW1tYURpYWxvZ1wiKTtcclxuLy9cclxuLy8gICAgICAgIC8qIC0tLSBFTlRJVFkgUEFORUwgKG1pZGRsZSkgLS0tICovXHJcbi8vICAgICAgICB0aGlzLmVudGl0eVBhbmVsV2lkZ2V0ID0gbmV3IEVuaXR5UGFuZWxXaWRnZXQoKTtcclxuLy9cclxuLy8gICAgICAgIC8qIC0tLSBFTlRJVFkgRElBTE9HIChSSFMpIC0tLSAqL1xyXG4vLy8vICAgICAgICB0aGlzLmVudGl0eURpYWxvZyA9IG5ldyBFbnRpdHlEaWFsb2coKTsgICAgICAgIFxyXG4vL1xyXG4vLyAgICAgICAgLyogLS0tIE1FTlUgKHRvcCkgLS0tICovXHJcbi8vICAgICAgICB0aGlzLm1lbnUgPSBuZXcgTWVudSgpO1xyXG4vLyAgICAgICAgXHJcbi8vICAgICAgICAvKiBTRVRVUCBBTEwgQ1JPU1MgTElTVEVORVJTIChvcmRlciBtYXkgbWF0dGVyKSAqL1xyXG4vLyAgICAgICAgLyogdW5kbyBzYXZlcyBzdGF0ZSBhbmQgaGFzIHRvIGJlIHRoZSBsYXN0IGxpc3RlbmVyICovXHJcbi8vICAgICAgICB0aGlzLm1vZGVsLmFkZExpc3RlbmVyKHRoaXMubGVtbWFEaWFsb2cpOyAgICAgICAgXHJcbi8vICAgICAgICB0aGlzLm1vZGVsLmFkZExpc3RlbmVyKHRoaXMuZW50aXR5UGFuZWxXaWRnZXQpO1xyXG4vLy8vICAgICAgICB0aGlzLm1vZGVsLmFkZExpc3RlbmVyKHRoaXMuZW50aXR5RGlhbG9nKTtcclxuLy8gICAgICAgIHRoaXMubW9kZWwuYWRkTGlzdGVuZXIoVGFnZ2VkRW50aXR5V2lkZ2V0LmNvbnRleHRNZW51KTtcclxuLy8gICAgICAgIHRoaXMubW9kZWwuYWRkTGlzdGVuZXIoVGFnZ2VkRW50aXR5V2lkZ2V0LmRlbGVnYXRlKTtcclxuLy8gICAgICAgICAgICAgICAgXHJcbi8vICAgICAgICB0aGlzLmVudGl0eVBhbmVsV2lkZ2V0LmFkZExpc3RlbmVyKHRoaXMubGVtbWFEaWFsb2cpO1xyXG4vLyAgICAgICAgdGhpcy5lbnRpdHlQYW5lbFdpZGdldC5hZGRMaXN0ZW5lcih0aGlzLm1vZGVsKTtcclxuLy8gICAgICAgIHRoaXMuZW50aXR5UGFuZWxXaWRnZXQuYWRkTGlzdGVuZXIodGhpcy51bmRvKTtcclxuLy8gICAgICAgIFxyXG4vLyAgICAgICAgdGhpcy5sZW1tYURpYWxvZy5hZGRMaXN0ZW5lcih0aGlzLmVudGl0eVBhbmVsV2lkZ2V0KTsgICAgXHJcbi8vICAgICAgICBcclxuLy8vLyAgICAgICAgdGhpcy5lbnRpdHlEaWFsb2cuYWRkTGlzdGVuZXIodGhpcy5sZW1tYURpYWxvZyk7XHJcbi8vLy8gICAgICAgIHRoaXMuZW50aXR5RGlhbG9nLmFkZExpc3RlbmVyKHRoaXMuZW50aXR5UGFuZWxXaWRnZXQpOyAgICAgICAgXHJcbi8vLy8gICAgICAgIHRoaXMuZW50aXR5RGlhbG9nLmFkZExpc3RlbmVyKHRoaXMuY3dyYyk7XHJcbi8vLy8gICAgICAgIHRoaXMuZW50aXR5RGlhbG9nLmFkZExpc3RlbmVyKHRoaXMubW9kZWwpO1xyXG4vLy8vICAgICAgICBcclxuLy8vLyAgICAgICAgdGhpcy5lbnRpdHlQYW5lbFdpZGdldC5hZGRMaXN0ZW5lcih0aGlzLmVudGl0eURpYWxvZyk7XHJcbi8vXHJcbi8vICAgICAgICB0aGlzLmN3cmMuYWRkTGlzdGVuZXIodGhpcy5lbnRpdHlQYW5lbFdpZGdldCk7XHJcbi8vLy8gICAgICAgIHRoaXMuY3dyYy5hZGRMaXN0ZW5lcih0aGlzLmVudGl0eURpYWxvZyk7ICAgICAgICBcclxuLy9cclxuLy8gICAgICAgIHRoaXMubWVudS5hZGRMaXN0ZW5lcih0aGlzLnZpZXcpOyAgICAgICAgXHJcbi8vICAgICAgICB0aGlzLm1lbnUuYWRkTGlzdGVuZXIodGhpcy5lbnRpdHlQYW5lbFdpZGdldCk7XHJcbi8vICAgICAgICB0aGlzLm1lbnUuYWRkTGlzdGVuZXIodGhpcy5tb2RlbCk7XHJcbi8vLy8gICAgICAgIHRoaXMubWVudS5hZGRMaXN0ZW5lcih0aGlzLmVudGl0eURpYWxvZyk7XHJcbi8vICAgICAgICB0aGlzLm1lbnUuYWRkTGlzdGVuZXIodGhpcy51bmRvKTtcclxuLy8gICAgICAgICAgICAgICAgXHJcbi8vICAgICAgICBUYWdnZWRFbnRpdHlXaWRnZXQuZGVsZWdhdGUuYWRkTGlzdGVuZXIoVGFnZ2VkRW50aXR5V2lkZ2V0LmNvbnRleHRNZW51KTtcclxuLy8gICAgICAgIFRhZ2dlZEVudGl0eVdpZGdldC5kZWxlZ2F0ZS5hZGRMaXN0ZW5lcih0aGlzLmVudGl0eVBhbmVsV2lkZ2V0KTtcclxuLy8vL1RhZ2dlZEVudGl0eVdpZGdldC5kZWxlZ2F0ZS5hZGRMaXN0ZW5lcih0aGlzLmxlbW1hRGlhbG9nV2lkZ2V0KTtcclxuLy8gICAgICAgIFRhZ2dlZEVudGl0eVdpZGdldC5kZWxlZ2F0ZS5hZGRMaXN0ZW5lcih0aGlzLm1vZGVsKTtcclxuLy8gICAgICAgIFRhZ2dlZEVudGl0eVdpZGdldC5kZWxlZ2F0ZS5hZGRMaXN0ZW5lcih0aGlzLnVuZG8pO1xyXG4vLyAgICAgICAgXHJcbi8vICAgICAgICB0aGlzLnVuZG8uYWRkTGlzdGVuZXIodGhpcy5tb2RlbCk7XHJcbi8vLy90aGlzLnVuZG8uYWRkTGlzdGVuZXIodGhpcy5sZW1tYURpYWxvZ1dpZGdldCk7XHJcbi8vICAgICAgICB0aGlzLnVuZG8uYWRkTGlzdGVuZXIodGhpcy5lbnRpdHlQYW5lbFdpZGdldCk7XHJcbi8vICAgICAgICBcclxuLy8gICAgICAgIC8qIC0tLSBDT05ORUNUIFNPQ0tFVCBBTkQgRVhUUkFORU9VUyBTRVRVUCAtLS0gKi9cclxuLy8gICAgICAgIHRoaXMucm9vdFNvY2tldCA9IG5ldyBqampybWkuSkpKUk1JU29ja2V0KFwiTmVydmVTb2NrZXRcIik7ICAgXHJcbi8vICAgICAgICB0aGlzLnJvb3RPYmplY3QgPSBhd2FpdCB0aGlzLnJvb3RTb2NrZXQuY29ubmVjdCgpO1xyXG4vLyAgICAgICAgdGhpcy5zY3JpYmVyID0gdGhpcy5yb290T2JqZWN0LnNjcmliZXI7XHJcbi8vICAgICAgICB0aGlzLm1vZGVsLnNldFNjcmliZXIodGhpcy5zY3JpYmVyKTtcclxuLy9cclxuLy8gICAgICAgIHRoaXMucm9vdE9iamVjdC5nZXRQcm9ncmVzc01vbml0b3IoKS5hZGRMaXN0ZW5lcih0aGlzLnZpZXcpO1xyXG4vL1xyXG4vLyAgICAgICAgLyogbW9kZWwuaW5pdCBoYXMgdG8gYmUga2VwdCBuZWFyIHRoZSBlbmQgYXMgaXQgdHJpZ2dlcnMgYSBub3RpZnlDb250ZXh0Q2hhbmdlIGV2ZW50ICovXHJcbi8vICAgICAgICBhd2FpdCB0aGlzLmVudGl0eVBhbmVsV2lkZ2V0LmluaXQodGhpcy5yb290T2JqZWN0LmRpY3Rpb25hcnkpO1xyXG4vLyAgICAgICAgYXdhaXQgdGhpcy5tb2RlbC5pbml0KHRoaXMucm9vdE9iamVjdC5kaWN0aW9uYXJ5KTsgICAgICAgIFxyXG4vLyAgICAgICAgXHJcbi8vICAgICAgICB0aGlzLnZpZXcuc2hvd1Rocm9iYmVyKGZhbHNlKTtcclxuLy8gICAgICAgIFxyXG4vLyAgICAgICAgVGFnZ2VkRW50aXR5V2lkZ2V0LmNvbnRleHRNZW51LnNldERpY3Rpb25hcnkodGhpcy5yb290T2JqZWN0LmRpY3Rpb25hcnkpOyAgICAgXHJcbi8vICAgICAgICBcclxuLy8gICAgICAgIHRoaXMuZW50aXR5UGFuZWxXaWRnZXQuYWRkTGlzdGVuZXIoVGFnZ2VkRW50aXR5V2lkZ2V0LmNvbnRleHRNZW51KTtcclxuLy8gICAgICAgIHRoaXMuYWRkTGlzdGVuZXIoVGFnZ2VkRW50aXR5V2lkZ2V0LmNvbnRleHRNZW51KTtcclxuLy8vLyAgICAgICAgdGhpcy5hZGRMaXN0ZW5lcih0aGlzLmVudGl0eURpYWxvZyk7XHJcbi8vICAgICAgICBcclxuLy8gICAgICAgIHRoaXMubm90aWZ5TGlzdGVuZXJzKFwibm90aWZ5UmVhZHlcIik7XHJcbi8vICAgIH1cclxuLy99Il19
