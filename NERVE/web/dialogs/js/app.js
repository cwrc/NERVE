// a test app using the core pieces cD.j and cwrc-api.js
// see cwrcDialogBridge.js for a cleaner example :
// https://github.com/cwrc/CWRC-Writer/blob/5618be7b83ccd643d26709cf549edd0682fbfc81/src/js/dialogs/cwrcDialogBridge.js
//
window.cwrcSetup = function(){
    // set the BASE URL to the Entity API for loading/saving/creating/searching
    cD.setCwrcApi('http://cwrc-dev-06.srv.ualberta.ca/islandora/cwrc_entities/v1/');
    // set the BASE URL of the source object link in the search information boxes
    cD.setRepositoryBaseObjectURL('http://cwrc-dev-01.srv.ualberta.ca/islandora/object/');
    // set Schemas
    cD.setPersonSchema("http://cwrc.ca/schemas/entities.rng");
    cD.setOrganizationSchema("http://cwrc.ca/schemas/entities.rng");
    cD.setPlaceSchema("http://cwrc.ca/schemas/entities.rng");
    // set URL from the outside linked data sources
    cD.setGeonameUrl("http://cwrc-dev-06.srv.ualberta.ca/cwrc-mtp/geonames/");
    cD.setViafUrl("http://cwrc-dev-06.srv.ualberta.ca/services/viaf/");
    cD.setGoogleGeocodeUrl("http://maps.googleapis.com/maps/api/geocode/xml");

    $("#addPerson").click(function () {
        $("#entityXMLContainer").text("");
        var opts = {
            success: function (result) {
                if (result.response.error) {
                    alert(result.response.error);
                    $("#entityXMLContainer").text("");
                } else {
                    if (result.response !== undefined && result.response.pid !== undefined)
                    {
                        $("#resultHeader").text("Person entity " + result.response.pid);
                        $("#entityXMLContainer").text(result.data);
                    } else
                    {
                        alert(result.response.message);
                        $("#resultHeader").text(result.response.message);
                    }

                }
            },
            error: function (errorThrown) {
                $("#entityXMLContainer").text("");
                $("#resultHeader").text("Entity ");
            },
            startValue: $("#startValuePerson").val()
        };
        cD.popCreatePerson(opts);
    });

    $("#addOrganization").click(function () {
        $("#resultHeader").text("Entity ");
        $("#entityXMLContainer").text("");
        var opts = {
            success: function (result) {
                if (result.response.error) {
                    alert(result.response.error);
                    $("#entityXMLContainer").text("");
                } else {
                    if (result.response !== undefined && result.response.pid !== undefined)
                    {
                        $("#resultHeader").text("Organization entity " + result.response.pid);
                        $("#entityXMLContainer").text(result.data);
                    } else
                    {
                        alert(result.response.message);
                        $("#resultHeader").text(result.response.message);
                    }
                }
            },
            error: function (errorThrown) {
                $("#entityXMLContainer").text("");
                $("#resultHeader").text("Entity ");
            },
            startValue: $("#startValueOrganization").val()
        };
        cD.popCreateOrganization(opts);
    });

    $("#addPlace").click(function () {
        $("#resultHeader").text("Entity ");
        $("#entityXMLContainer").text("");
        var opts = {
            success: function (result) {
                if (result.response.error) {
                    alert(result.response.error);
                    $("#entityXMLContainer").text("");
                } else {
                    if (result.response !== undefined && result.response.pid !== undefined)
                    {
                        $("#resultHeader").text("Place entity " + result.response.pid);
                        $("#entityXMLContainer").text(result.data);
                    } else
                    {
                        alert(result.response.message);
                        $("#resultHeader").text(result.response.message);
                    }
                }
            },
            error: function (errorThrown) {
                $("#entityXMLContainer").text("");
                $("#resultHeader").text("Entity ");
            },
            startValue: $("#startValuePlace").val()
        };
        cD.popCreatePlace(opts);
    });

    $("#addTitle").click(function () {
        $("#resultHeader").text("Entity ");
        $("#entityXMLContainer").text("");
        var opts = {
            success: function (result) {
                if (result.response.error) {
                    alert(result.response.error);
                    $("#entityXMLContainer").text("");
                } else {
                    if (result.response !== undefined && result.response.pid !== undefined)
                    {
                        $("#resultHeader").text("Title entity " + result.response.pid);
                        $("#entityXMLContainer").text(result.data);
                    } else
                    {
                        alert(result.response.message);
                        $("#resultHeader").text(result.response.message);
                    }
                }
            },
            error: function (errorThrown) {
                $("#entityXMLContainer").text("");
                $("#resultHeader").text("Entity ");
            },
            startValue: $("#startValueTitle").val()
        };
        cD.popCreateTitle(opts);
    });


    $("#searchPerson").click(function () {
        $("#resultHeader").text("Entity ");
        $("#entityXMLContainer").text("");

        var customAction = function (data) {

//            var result = "";
//            for (var i in data) {
//                if (data.hasOwnProperty(i)) {
//                    result += i + " : " + data[i] + "	";
//                }
//            }
//
//            $("#resultHeader").text("Result");
//            $("#entityXMLContainer").text(result);
        };

        var opts = {
            success: function (result) {
                $("#resultHeader").text("Added");
                $("#entityXMLContainer").text(JSON.stringify(result));
            },
            error: function (errorThrown) {
                $("#entityXMLContainer").text("");
                $("#resultHeader").text("Entity ");
            },
            buttons: [
                {
                    label: "Show response",
                    isEdit: false,
                    action: customAction
                },
                {
                    label: "Create",
                    isEdit: false,
                    action: cD.popCreatePerson
                },
                {
                    label: "Edit",
                    isEdit: true,
                    action: cD.popEditPerson
                }

            ],
            query: $("#startValuePerson").val()
        }

        cD.popSearchPerson(opts);
    });


    $("#searchOrganization").click(function () {
        $("#resultHeader").text("Organization ");
        $("#entityXMLContainer").text("");

        var opts = {
            success: function (result) {
                $("#resultHeader").text("Added");
                $("#entityXMLContainer").text(JSON.stringify(result));
            },
            error: function (errorThrown) {
                $("#entityXMLContainer").text("");
                $("#resultHeader").text("Entity ");
            },
            buttons: [
                {
                    label: "Create",
                    isEdit: false,
                    action: cD.popCreateOrganization
                },
                {
                    label: "Edit",
                    isEdit: true,
                    action: cD.popEditOrganization
                },
            ],
            query: $("#startValueOrganization").val()
        }

        cD.popSearchOrganization(opts);
    });

    $("#searchPlace").click(function () {
        $("#resultHeader").text("Place ");
        $("#entityXMLContainer").text("");

        var opts = {
            success: function (result) {
                console.log(result);
//                $("#resultHeader").text("Added");
//                $("#entityXMLContainer").text(JSON.stringify(result));
            },
//            error: function (errorThrown) {
//                $("#entityXMLContainer").text("");
//                $("#resultHeader").text("Entity ");
//            },
//            buttons: [
//                {
//                    label: "Create",
//                    isEdit: false,
//                    action: cD.popCreatePlace
//                },
//                {
//                    label: "Edit",
//                    isEdit: true,
//                    action: cD.popEditPlace
//                },
//            ],
            query: $("#startValuePlace").val()
        }

        cD.popSearchPlace(opts);
    });

    $("#searchTitle").click(function () {
        $("#resultHeader").text("Title ");
        $("#entityXMLContainer").text("");

        var opts = {
            success: function (result) {
                $("#resultHeader").text("Added");
                $("#entityXMLContainer").text(JSON.stringify(result));
            },
            error: function (errorThrown) {
                $("#entityXMLContainer").text("");
                $("#resultHeader").text("Entity ");
            },
            buttons: [
                {
                    label: "Create",
                    isEdit: false,
                    action: cD.popCreateTitle
                },
                {
                    label: "Edit",
                    isEdit: true,
                    action: cD.popEditTitle
                },
            ],
            query: $("#startValueTitle").val()
        }

        cD.popSearchTitle(opts);
    });

    $("#searchCustomButton").click(function () {
        var searchName = $("#customSearchSelectionButton").text();
        var searchType = searchName.toLowerCase().trim();
        var searchQuery = $("#searchPersonInput").val();

        $("#resultHeader").text(searchName + " ");
        $("#entityXMLContainer").text("");

        var opts = {
            success: function (result) {
                $("#resultHeader").text("Added");
                $("#entityXMLContainer").text(JSON.stringify(result));
            },
            error: function (errorThrown) {
                $("#entityXMLContainer").text("");
                $("#resultHeader").text("Entity ");
            },
            buttons: [
                {
                    label: "Edit",
                    isEdit: true,
                    action: cD.popEdit[searchType]
                },
            ],
            query: searchQuery
        }

        cD.popSearch[searchType](opts)

    });

    $('#customSearchSelection li > a').click(function (e) {
        $("#customSearchSelectionButton").html(this.innerHTML + ' <span class="caret"></span>');
    });

    $("#clear-button").click(function () {
        $("#entityXMLContainer").text("");
        $("#resultHeader").text("Entity ");
    });
};