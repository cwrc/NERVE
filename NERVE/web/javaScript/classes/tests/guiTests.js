class GUITests{

    constructor(events, controller){
        this.events = events;
        this.controller = controller;
    }

    run(){
        this.testSet00();
    }

    testSet00(){
        EventAutomation.clickElement("NV00001");
        this.events.menuUntag(new Event("keypress"));
        EventAutomation.selectRange("NOT001", 6, 29);
        this.events.entityPanelClick(new Event("click"))
    }
}