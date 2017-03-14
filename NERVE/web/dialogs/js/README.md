CWRC Dialogs
============

This project aims to provide a set of dialogs to peform lookups, create and edit
4 types of entities for all CWRC applications.

These entities include:

+ person
+ organization
+ place
+ title

Status
------

The current version has a working lookup dialog that queries the CWRC repository
and the VIAF data source.  In order to use the CWRC Dialogs the file `cD.js`
needs to be included like any other javascript framework.

Also, the dialogs depend on the following frameworks and APIs:

+ [jQuery](http://jquery.com)
+ [jQueryUI](http://jqueryui.com) - For dragging modals
+ [Knockoutjs](http://knockoutjs.com/)
+ [Bootstrap](http://getbootstrap.com/)
+ [Bootstrap datepicker](http://www.eyecon.ro/bootstrap-datepicker/)
+ [CWRC API](https://github.com/cwrc/CWRC-ccm-rest-api)

The following is an example of all the files that need to be included:

```
	<script src="js/jquery-1.11.0.js"></script>
	<script src="js/jquery-ui-1.10.4.custom.js"></script>
	<script src="js/knockout-2.3.0.js"></script>
	<script src="js/bootstrap.js"></script>
	<script src="js/bootstrap-datepicker.js"></script>
	<script src="js/cwrc-api.js"></script>
	<script src="js/cD.js"></script>
	<script src="js/app.js"></script>

	<link rel="stylesheet" type="text/css" href="css/bootstrap.css">
	<link rel="stylesheet" type="text/css" href="css/datepicker.css">
	<link rel="stylesheet" href="font-awesome/css/font-awesome.min.css">
	<link rel="stylesheet" type="text/css" href="css/cD.css">
```

* Note: the "fonts" directory inlcuding the glyphicons needs to be available as
well.

A test application is included with the code. This application can be reached by
opening the `index.html` file. The test application queries the solr engine and
adds entries to a list. The application logic is located on the `app.js` file.

From the `app.js` file you can see that the CWRC dialogs need to be initialized
for the cwrc api to work. You can initialize it with the `initializeWithLogin`
or `initializeWithCookieData` methods.

Service call urls can be customized by using the functions `setCwrcApi`,
`setGeonameUrl`, and `setViafUrl`.

The location of entity schemas can be defined by using the functions
`setPersonSchema`, `setOrganizationSchema`, or `setPlaceSchema`.

The interface as opened to the user includes:

+ initializeWithCookieData
+ initializeWithLogin
+ popCreatePerson
+ popCreateOrganization
+ popCreatePlace
+ popCreateTitle
+ popSearchPerson
+ popSearchOrganization
+ popSearchPlace
+ popSearchTitle
+ popCreate
+ popSearch
+ popEdit
+ setCwrcApi
+ setRepositoryBaseObjectURL
+ setGeonameUrl
+ setGoogleGeocodeUrl
+ setViafUrl
+ setPersonSchema
+ setOrganizationSchema
+ setPlaceSchema

The dialogs can be initialized using the function initializeWithCookieData by
passing in the data string representing the cookies containing the session
information. The passed in cookie string must be in the format
"cookiename=cookiedata;". Each cookie can be separated by a semicolon. This
cookie string usually can be obtained by using the javascript function
'document.cookie'.

The objects `popCreate`, `popSearch`, and `popEdit` provide key base access to
the create and search dialogs respectively using the entity names as keys
(person, organization etc.).

Methods popCreatePerson, popCreateOrganization, popCreatePlace, popCreateTitle
can take the following arguments as part of a hash:

+ success - Function to execute when an entity is created.
+ error - Function to execute when entity creation fails.
+ startValue - Starting value for the dialog.

When opening the search dialog on can pass different options to the call
function that will modify the behaviour of the dialog.

+ success - a function to be called when selecting an entry
+ error - a function to call when an error occurs
+ buttons - this array defines custom butons with ther actions, each entry in
the array takes the form of an object with a `label` string and an `action` in
the form of the function to be run on click.
+ query - the search dialog will open with a search using this parameter

An example follows

```
	var customAction = function(data) {

		var result = "";
		for (var i in data) {
			if (data.hasOwnProperty(i)) {
				result += i + " : " + data[i] + "	";
			}
		}

		$("#resultHeader").text("Result");
		$("#entityXMLContainer").text(result);
	};

	var opts = {
		success: function(result) {
			$("#resultHeader").text("Added");
			$("#entityXMLContainer").text(JSON.stringify(result));
		},
		error : function(errorThrown) {
			$("#entityXMLContainer").text("");
			$("#resultHeader").text("Entity ");
		},
		buttons : [
			{
				label : "Show response",
				action : customAction
			}
		],
		query : "Bruce Wayne"
	}

	cD.popSearchPerson(opts);
```

The data return has the following format:

+ name - name of entry as defined in the repository
+ id - id corresponding to the entry in the repository
+ uri - external facing uri representing the object
+ repository - repository from where the entry was obtained
+ data - raw data of the entry in text format as provided by the repository

The following is an example of a resulting object:

```
id : cwrc:640cbd44-fcfe-4d0a-b964-d10ae5bf68cb
uri : http://commons.cwrc.ca/cwrc:640cbd44-fcfe-4d0a-b964-d10ae5bf68cb
name : Austin
repository : cwrc
data : <?xml version="1.0" encoding="UTF-8"?> <?xml-model href="http://cwrc.ca/schema/person.rng" type="application/xml" schematypens="http://relaxng.org/ns/structure/1.0"?> <entity> <person> <recordInfo> <originInfo> <projectId>eccji</projectId> </originInfo> <accessCondition type="use and reproduction">Use of this public-domain resource is governed by the <a href="http://creativecommons.org/licenses/by-nc/3.0/" rel="license">Creative Commons Attribution-NonCommercial 3.0 Unported License</a>.</accessCondition> <personTypes> <personType>creator</personType> </personTypes> </recordInfo> <identity> <preferredForm> <namePart partType="surname">Austin</namePart> <namePart partType="forename">Prof.</namePart> </preferredForm> </identity> </person> </entity>

```

Search
------

Search dialogs can use a endpoints the CWRC entities, VIAF, Geonames, or the
Google GeoCode endpoints.

The CWRC entities endpoint assumes a Solr based JSON response.  As of
2015-05-22, the Solr fields required:

```
object_label
object_url
PID
numFound
```
