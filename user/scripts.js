/**
 * @fileOverview user side script for the plugin to add input fields inside the user settings page
 *
 * @author Abhinav Narayana Balasubramaniam
 * @author Naseer Ahmed Khan
 */

/**
 * an array of JSON settings for each input field which is going to be added into the settings table
 * @type {array}
 */
var fields = [];

/**
 * Values corresponding to each new field in the settings page
 * @type {array}
 */
var fieldValues = [];
/**
 * name of the custom table where the data is being stored
 * @constant
 * @type {string}
 */
var tableName = "customFieldsUserData";

/**
 * name of the domain being used
 * @constant
 * @type {string}
 */
var baseUrl = document.location.hostname;

// TODO: make it dynamic and extract it from the URL
/**
 * Guid of the current package
 * @constant
 * @type {string}
 */
var packageIdUCF = document.currentScript.src.replace('/scripts/scripts.js','').trim().split('/');
packageIdUCF = packageIdUCF[(packageIdUCF).length-1];
console.log(packageIdUCF);
$(document).ready(function() {
  // checks if the page is right by checking against the body's class
  if (
    document.body.className ==
    "page-seller seller-items page-settings pace-running"
  ) {
    // getting the table settings node
    var settingsTable = document.getElementsByClassName("seller-common-box")[0];
    // getting the parent of where the fields have to be appended
    var parentElement = settingsTable.children[0];
    // retrieving the stored fields settings of the columns and parsing the stringified JSON
    var retrieved = JSON.parse(returnCustomField("metacfdata").Values[0]);
    // pushing in all enabled field settings into fields
    for (key in retrieved) {
      if (retrieved[key].enable) {
        fields.push(retrieved[key]);
      }
    }
    // making and inserting the fields inside the settings table
    makeFields(fields, parentElement);
    // adding an event listener to the save button to store the values when clicked
    document
      .getElementsByClassName("my-btn btn-red")[1]
      .addEventListener("click", saveCustomFields);
  }
});

/**
 * Append element at the required position in the settings table
 * @param {Node} element node element which is going to be inserted
 * @param {Node} parent node element in which the element is going to be added into
 */
function appendRequired(element, parent) {
  var position = parent.children.length - 2;
  var insertBeforeElement = parent.children[position + 1];
  parent.insertBefore(element, insertBeforeElement);
}

/**
 * Make the different input nodes and append them at the required position in the settings table
 * @param {array} fieldsArray array of all the settings needed to make each input field inside the settings table
 * @param {node} settingsElement the table element where the input tags have to be added in
 */
function makeFields(fieldsArray, settingsElement) {
  // userGuid of the current user
  var userId = document.getElementById("userGuid").value;
  // name of the custom table being used to store all the required data

  // get the corresponding saved data
  data = returnSavedUserData(userId, tableName);
  // check if data exists
  if (data) {
    // parse the stringified data
    data = JSON.parse(data.allData);
  } else {
    // assign the data to empty strings
    data = {};
    for (var i = 0; i < fields.length; i++) {
      data[fields[i].name] = "";
    }
  }
  // going to iteratively add all the input tags
  for (i = 0; i < fieldsArray.length; i++) {
    // make a row after 2 iterations
    if (i % 2 == 0) {
      var rowElement = $.parseHTML(`<div class="item-form-group"></div>`)[0];
    }
    // name and type of the current input tag
    var heading = fieldsArray[i].name;
    var type = fieldsArray[i].type;

    // if a new field was created by the admin, and no data exists inside the custom table set value to null
    if (!data[heading]) {
      data[heading] = "";
    }

    // if the type of input is checkbox
    if (type == "checkbox") {
      // value of the checkbox is stored as a number, 0 for false and 1 for true
      if (Number(data[heading])) {
        // if value is 1 setting checked attribute
        var check = "checked";
      } else {
        // if value is 0 not setting checked attribute
        var check = "";
      }
      // using parse html to make the required column elment using all the required statuses
      var colElement = $.parseHTML(`<div class="col-md-6">
          <label>${heading}</label>
          <input type="${type}" class="required" id="custom-field-${heading}" name="${heading}" ${check} onclick="this.value=Number(this.checked)">
      </div>`)[0];
    }
    // if the type of the input is selector
    else if (type == "selector") {
      // options is an array of all possible options
      var options = fieldsArray[i].options;
      // making a new column node, with a selector inside it
      var colElement = $.parseHTML(`<div class="col-md-6">
          <label>${heading}</label>
          <select class="required" id="custom-field-${heading}" name="${heading}"></select></div>`)[0];
      // appending all the options to the selector
      for (var j = 0; j < options.length; j++) {
        // current option being added
        var currOption = options[j];
        // parsingHTML on the current selector option
        var optionTag = $.parseHTML(
          `<option value="${currOption}">${currOption}</option>`
        )[0];
        // appending the option node to the selector
        colElement.children[1].appendChild(optionTag);
      }
      // setting the selected value to the stored value
      colElement.children[1].value = data[heading];
    }
    // the cases when the type of input are number or text
    else {
      // using parse html on the following string to make the required column element
      var colElement = $.parseHTML(`<div class="col-md-6">
          <label>${heading}</label>
          <input type="${type}" class="required" id="custom-field-${heading}" name="${heading}" value="${data[heading]}">
      </div>`)[0];
    }
    // appending the column element to the row element
    rowElement.appendChild(colElement);
    // appending the column element to the settings table after 2 columns have been added or if it is the last column element
    if (i % 2 == 1 || i == fieldsArray.length - 1) {
      appendRequired(rowElement, settingsElement);
    }
  }
}

/**
 * Returns the required custom field JSON, false if not found
 * @param {string} customFieldName name of the required custom field
 * @returns {JSON|boolean} the JSON object of the required custom field will be returned, false if the custom field is not found in the implementations table
 */
function returnCustomField(customFieldName) {
  // gets the users webapitoken
  var userToken = getCookie("webapitoken");

  // settings used to make the API call to get all marketplace data
  var settings = {
    url: "https://" + baseUrl + "/api/v2/marketplaces",
    method: "GET",
    async: false,
    headers: {
      authorization: "Bearer " + userToken
    }
  };
  // JSON object of all the marketplace custom fields
  var marketPlaceCustomFields;
  // making the ajax call, assigning the custom fields
  $.ajax(settings).done(function(response) {
    marketPlaceCustomFields = response.CustomFields;
  });
  // finding the required custom field inside the list of all custom field
  for (i = 0; i < marketPlaceCustomFields.length; i++) {
    if (marketPlaceCustomFields[i]["Name"] == customFieldName) {
      return marketPlaceCustomFields[i];
    }
  }
  // return false if the required custom field isn't found inside the list of marketplace custom fields
  return false;
}

/**
 * Function to return the value of the cookie
 * @param {string} name name of the cookie whose value needs to be found
 * @returns {string} returns the string value of the cookie when found
 */
function getCookie(name) {
  var value = "; " + document.cookie;
  var parts = value.split("; " + name + "=");
  if (parts.length === 2) {
    return parts
      .pop()
      .split(";")
      .shift();
  }
}

/**
 * This is run after the onclick on the save button
 * It saves the values of the newly entered data inside custom tables
 */
function saveCustomFields() {
  // userGuid of the user entering data in the table
  var userId = document.getElementById("userGuid").value;

  // finding all the input tags and storing their values inside an array of fieldValues
  for (i = 0; i < fields.length; i++) {
    // the current field of the iteration
    var currField = document.getElementById("custom-field-" + fields[i].name);
    // pushing the value of the current field into the field values array
    if (currField) {
      fieldValues.push(currField.value);
    } else {
      fieldValues.push("");
    }
  }
  // data going to be added into the allData column of the custom table
  var tableData = {};
  for (i = 0; i < fields.length; i++) {
    tableData[fields[i].name] = fieldValues[i];
  }

  // retrieving the stored data for the corresponding user
  userStoredData = returnSavedUserData(userId, tableName);

  if (userStoredData) {
    // if the current user data exists inside the table edit the existing row
    editRowCustomTable(userStoredData.Id, tableData, tableName);
  } else {
    // if the current user data doesn't exist inside the table add a new row to the table
    addRowCustomTable(userId, tableData, tableName);
  }
}

/**
 * function to return all the columns as JSON inside the custom table
 * TODO: account for page sizes and page numbers
 * @param {string} customTableName name of the custom table whose data is to be returned
 * @returns {array} returns an array of all rows(JSON) of the table
 */
function getCustomTable(customTableName) {
  // the settings of the ajax call to retrieve the custom table row
  var settings = {
    url:
      "https://" +
      baseUrl +
      "/api/v2/plugins/" +
      packageIdUCF +
      "/custom-tables/" +
      customTableName +
      "/",
    method: "GET",
    async: false
  };
  var res;
  // making the ajax call and assigning the data to res
  $.ajax(settings).done(function(response) {
    res = response.Records;
  });
  return res;
}

/**
 * function to return the row of the user's data
 * @param {string} userId user id of the user whose data is required
 * @param {string} customTableName name of the custom table being used
 * @param {JSON} the data of the user being returned
 */
function returnSavedUserData(userId, customTableName) {
  // JSON going into the JSON field inside the ajax call
  var data = [
    {
      Name: "userGuid",
      Operator: "equal",
      Value: userId
    }
  ];
  // settings for the ajax call to query the custom field table
  var settings = {
    url:
      "https://" +
      baseUrl +
      "/api/v2/plugins/" +
      packageIdUCF +
      "/custom-tables/" +
      customTableName +
      "/",
    method: "POST",
    async: false,
    headers: {
      "Content-Type": "application/json"
    },
    data: JSON.stringify(data)
  };
  var res;
  // making the ajax call and assigning the first record, which by logic should be the only record found
  $.ajax(settings).done(function(response) {
    res = response.Records[0];
    console.log("returned row", res);
  });
  return res;
}

/**
 * add a row to the custom table with columns [Id(id of the row)|allData(all the different input fields)]
 * @param {string} userId user Id of the required user
 * @param {JSON} inputJson JSON going to be saved inside allData
 * @param {string} customTableName name of the required custom table
 */
function addRowCustomTable(userId, inputJson, customTableName) {
  // body of the post request which is going to be made soon
  var data = {
    userGuid: userId,
    allData: JSON.stringify(inputJson)
  };
  // settings of the post request to add in a row into the custom table
  var settings = {
    url:
      "https://" +
      baseUrl +
      "/api/v2/plugins/" +
      packageIdUCF +
      "/custom-tables/" +
      customTableName +
      "/rows",
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    data: JSON.stringify(data)
  };
  // making the api call with the required settings
  $.ajax(settings).done(function(){
    console.log("added new row");
  });
}

/**
 * edit an existing row inside the custom table
 * @param {string} rowId guid of the row of the custom table
 * @param {JSON} inputJson the JSON which is going to be stored inside the corresponding all data column inside the custom table
 * @param {string} customTableName name of the custom table in which data is being stored
 */
function editRowCustomTable(rowId, inputJson, customTableName) {
  // body of the post request which is going to be made
  var data = {
    allData: JSON.stringify(inputJson)
  };
  // settings of the post request going to edit the row inside the custom table
  var settings = {
    url:
      "https://" +
      baseUrl +
      "/api/v2/plugins/" +
      packageIdUCF +
      "/custom-tables/" +
      customTableName +
      "/rows/" +
      rowId,
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    data: JSON.stringify(data)
  };
  // making the ajax call
  $.ajax(settings).done(function(){
    console.log("editted old row");
  });
}
