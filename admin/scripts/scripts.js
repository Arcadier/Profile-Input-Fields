/**
 * @fileOverview admin side code of Custom Fields plugin that has backend for plugin page
 * and edits the user management page
 *
 * @author Naseer Ahmed Khan
 */
/**
 * metaCF - It is the custom field that stores information on all the Custom Fields the admin has added.
 * @type {JSON}
 * @constant
 *
 */
const metaCF = retrieveCfValueJSON("metacfdata");

/**
 * baseURL - This is a JSON object that has information about the URL.
 * @type {JSON}
 * @constant
 */
const baseUrl = window.location;

//Calling main function
adminCode(baseUrl);


/**
 * adminCode - This is the main function that runs on the plugin page and the user management page. It
 * edits the DOM elements in the user management to add each users custom field values in the user info page.
 *
 * On the plugin page it provides backend code for the table to add custom fields.
 *
 * @param  {JSON} locationInfo It takes in window.location
 */
function adminCode(locationInfo) {

  //Get URL of the page
  var pageUrl = locationInfo.href;

  //If its the plugin page
  if (pageUrl.indexOf("admin/plugins") != -1) {

    //Add onclick function to the add button
    var button = document.getElementById("add");
    button.onclick = addRow;

    //Fill the table with rows of existing Custom Fields.
    var table = document.getElementById("CFTable");
    if (metaCF) {
      var tableData = metaCF["Values"][0];
      var rows = Object.keys(tableData);
      for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        var name = tableData[row]["name"];
        var type = tableData[row]["type"];
        var enable = tableData[row]["enable"];
        var options = tableData[row]["options"];

        if (enable) {
          enable = "checked";
        }
        else {
          enable = "";
        }

        if (options == null) {
          options = '"" disabled';
        }
        else {
          options = '"' + String(options) + '"';
        }
        //Row Node with details filed in using the custom field data
        var rowHTML = $.parseHTML(`<tr id="` + row + `" onchange="rowChange(this)">
          <td  onfocusout="focusoutFuction(this)" onclick="focusFunction(this)"><input type="text" placeholder="Enter Custom Field Name" onfucus=true value="`+ name + `" style="background-color: #d3d3d3"></td>
          <td ><select onchange="setTextField(this)">
            <option value="string">Text</option>
            <option value="number">Number</option>
            <option value="checkbox">Checkbox</option>
            <option value="selector">Dropdown</option>
          </select></td>
          <td><input type="checkbox" `+ enable + `></td>
          <td><input type="text" name="" value=`+ options + `></td>
        </tr>`)[0];
        table.appendChild(rowHTML);
        //Setting the value of dropdown using javascript
        var dropdown = rowHTML.children[1].children[0]
        dropdown.value = type;
      }
    }
  }
  //If it is the user-manangement page
  if (pageUrl.indexOf("admin/usermanager/userdetail") != -1) {
    var userID;
    //Get all uls that have user data
    var ul = document.getElementsByClassName('w-list-items');
    //Extracting all user data
    var firstName = ul[0].children[0].children[1].innerText;
    var lastName = ul[0].children[1].children[1].innerText;
    var contactNum = ul[0].children[2].children[1].innerText;
    var notifEmail = ul[1].children[0].children[1].innerText;
    //Converting date joined to unix time
    var dateJoined = document.getElementById("dateJoined").innerText;
    //Splitting by " " gives us an array with date and time
    var date = dateJoined.split(" ");
    //date[0] gives us date and splitting by / gives us an array [DD,MM,YYYY]
    var dateArr = date[0].split("/");
    //Switching positions of date and month
    var temp = dateArr[0];
    dateArr[0] = dateArr[1];
    dateArr[1] = temp;
    //Converting back to string
    var corrDate = dateArr.join("/");
    //concatinating time
    date = corrDate + " " + date[1];
    //Making a date object using the string
    dateJoined = new Date(date).getTime() / 1000;
    //Iterating through all users and matching all the data to get userGuid.
    // This matching of data was a work around for the fact that we dont have userGuid on the user management page.
    // TODO: When userGuid is implemented in this page, just retrieve custom fields data of the user using userGuid.
    var allUsers = getRecordsUserDetails();
    for (var i = 0; i < allUsers.length; i++) {
      var user = allUsers[i];
      var joined = user["DateJoined"];
      var email = user["Email"];
      var fName = user["FirstName"];
      var lName = user["LastName"];
      var contact = user["PhoneNumber"];
      var pageData = [dateJoined, notifEmail, firstName, lastName, contactNum];
      var apiData = [joined, email, fName, lName, contact];
      //If the data mathced, get the userID and break the loop
      if (arrayMatch(pageData, apiData)) {
        userID = user["ID"];
        break;
      }

    }
    //Use this userID to get custom field data
    var customData = returnSavedUserData(userID, "customFieldsUserData");
    if (customData) {
      var allData = JSON.parse(customData["allData"]);
      for (key in allData) {
        var newLi = $.parseHTML(`<li><label>${key}</label><p>${allData[key]}</p></li>`)[0];
        ul[0].appendChild(newLi);
      }
    }

  }
}

/**
 * arrayMatch - This function checks if 2 arrays are equal, ignoring the nulls and empty strings
 *
 * @param  {array} arr1 The first array
 * @param  {array} arr2 The second array
 * @return {boolean} true if arrays are equal and false if arrays are not equal
 */
function arrayMatch(arr1, arr2) {
  var equal = true;
  for (var i = 0; i < arr1.length; i++) {
    var arr1elem = arr1[i];
    var arr2elem = arr2[i];
    if (arr1elem != "" && arr2elem != null) {
      if (arr1elem != arr2elem) {
        equal = false;
        break;
      }
    }
  }
  return equal;
}


/**
 * addRow - This run function runs when you click the add custom fields button.
 */
function addRow() {
  var table = document.getElementById("CFTable");
  var numRows = table.children.length;
  //Parse HTML for a row with ids calculated by their row numbers
  var row = $.parseHTML(`<tr id="row` + numRows + `" onchange="rowChange(this)">
    <td id="name`+ numRows + `" onfocusout="focusoutFuction(this)" onclick="focusFunction(this)"><input type="text" placeholder="Enter Custom Field Name" onfucus=true></td>
    <td id="type`+ numRows + `"><select onchange="setTextField(this)">
      <option value="string">Text</option>
      <option value="number">Number</option>
      <option value="checkbox">Checkbox</option>
      <option value="selector">Dropdown</option>
    </select></td>
    <td id="enable`+ numRows + `"><input type="checkbox"></td>
    <td id="dropwdown`+ numRows + `"><input type="text" name="" value="" disabled></td>
  </tr>`);

  //append the row to the table
  table.appendChild(row[0]);
}


/**
 * focusFunction - This function takes in the input td and changes the its colour when you click on it.
 * It also selects the whole text so its easier to edit
 *
 * @param  {Node} td The td that needs to be edited
 */
function focusFunction(td) {
  var input = td.children[0];
  input.style = "background-color: white"
  input.select();
}


/**
 * getRecordsUserDetails - This function calls API to get information on all the users in the marketplace.
 *
 * @return {JSON}  This JSON file has a key "Records" that is an array of JSON files containing information on each user.
 */
function getRecordsUserDetails() {
  baseURL = window.location.hostname;
  //Getting authorization token
  adminToken = getCookie("webapitoken");
  //Getting adminID
  adminID = document.getElementById("userGuid").value;

  var records;
  //This ajax call is used to see the total size of records. If the size is too big, the response will be in pages, and it takes 1 API call to
  // get each page. This is too time consuming. A better solution is to check the record size and then change pageSize of API response accordingly.
  var settings = {
    "url": "https://" + baseURL + "/api/v2/admins/" + adminID + "/users/?pageSize=1",
    "method": "GET",
    "async": false,
    "headers": {
      "Authorization": "Bearer " + adminToken
    },
  };

  var pageSize;
  $.ajax(settings).done(function (response) {
    //Storing record size
    pageSize = response.TotalRecords;
  });
  //Making another API call with pageSize = record size
  var settings2 = {
    "url": "https://" + baseURL + "/api/v2/admins/" + adminID + "/users/?pageSize=" + pageSize,
    "method": "GET",
    "async": false,
    "headers": {
      "Authorization": "Bearer " + adminToken
    },
  };
  var records;
  $.ajax(settings2).done(function (response) {
    //Storing the user details array
    records = response.Records;
  });
  return records;
}

/**
 * focusoutFuction - This function changes the colour of the td when you click out
 *
 * @param  {Node} td The td that needs to be edited
 */
function focusoutFuction(td) {
  var input = td.children[0];
  input.style = "background-color: #d3d3d3";

}


/**
 * setTextField - This function enables/disables the options input tag depending on the type selected by the user.
 *
 * @param  {Node} select The select tag that has changed
 */
function setTextField(select) {
  //Get the row node
  var row = select.parentNode.parentNode;
  if (select.value == "selector") {
    //If type selected is dropwdown, enable the options input tag
    row.children[3].children[0].disabled = false;
  }
  else {
    //Otherwise clear everything that is present in the input tag
    row.children[3].children[0].disabled = true;
    row.children[3].children[0].value = "";
  }


}


/**
 * getCookie - This function returns the value of cookie
 *
 * @param  {String} name The name of the cookie
 * @return {String}      Its value
 */
function getCookie(name) {
  var value = '; ' + document.cookie;
  var parts = value.split('; ' + name + '=');
  if (parts.length === 2) {
    return parts.pop().split(';').shift();
  }
}


/**
 * create a custom field inside the implementations and set the value of it
 * @param {String} cfName name of the custom field whose value needs to be set
 * @param {String} storedData value which is going to be stored inside a custom field
 * @param {JSON|boolean} cf a json object of the existing custom field, false if a custom field doesn't exist
 */
function createCfImplementations(cfName, storedData, cf) {
  var baseUrl = document.location.hostname;
  var adminID = document.getElementById("userGuid").value;
  var admintoken = getCookie('webapitoken');

  // if the custom field already exists
  if (cf) {
    // body of the json used to make the custom field
    data = {
      "CustomFields": [
        {
          "Code": cf.Code,
          "Values": [
            storedData
          ]
        }
      ]
    }
    // settings of the api call being used to make the api call
    var settings1 = {
      "url": "https://" + baseUrl + "/api/v2/marketplaces",
      "method": "POST",
      // "async": false,
      "headers": {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + admintoken
      },
      "data": JSON.stringify(data)
    };

    $.ajax(settings1);

  }
  // if the custom field doesn't already exists
  else {
    // the json body to make the post request to make a custom field
    data = {
      "Name": cfName,
      "IsMandatory": true,
      "DataInputType": "textfield",
      "ReferenceTable": "Implementations",
      "DataFieldType": "string"
    }
    // settings used to make the post request to make the custom field
    var settings2 = {
      "url": "https://" + baseUrl + "/api/v2/admins/" + adminID + "/custom-field-definitions",
      "method": "POST",
      "headers": {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + admintoken
      },
      // "async": false,
      "data": JSON.stringify(data)
    };
    // making the ajax call to make the custom field definition
    $.ajax(settings2).done(function (response) {
      cf = response;
      // body to update the newly made custom field
      data2 = {
        "CustomFields": [
          {
            "Code": cf.Code,
            "Values": [
              storedData
            ]
          }
        ]
      }
      // settings to update the value of the new custom field
      var settings3 = {
        "url": "https://" + baseUrl + "/api/v2/marketplaces",
        "method": "POST",
        "headers": {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + admintoken
        },
        // "async": false,
        "data": JSON.stringify(data2)
      };
      // making the API call to make the new custom field
      $.ajax(settings3);
    });


  }

}

/**
 * to store in stringified version of the json in a custom field
 * @param {String} cfName the name of the custom field to store in the JSON data
 * @param {JSON} storedDataJSON JSON which is going to be stored in the custom field
 * @param {JSON|boolean} cf JSON of the existing custom field, false if it doesn't exist
 */
function createCfImplementationsJSON(cfName, storedDataJSON, cf) {
  // calling the make custom fields function
  createCfImplementations(cfName, JSON.stringify(storedDataJSON), cf);
}

/**
 * retrieve the json of the stored stringified custom field
 * @param {String} cfName the string of the stored custom field
 * @returns {JSON|boolean} the JSON of the custom field if it exists it returns false if the custom field doesn't exist
 */
function retrieveCfValueJSON(cfName) {
  var baseUrl = document.location.hostname;
  var admintoken = getCookie('webapitoken');
  // settings for the api call to return the custom field
  var settings1 = {
    "url": "https://" + baseUrl + "/api/v2/marketplaces",
    "method": "GET",
    "async": false,
    "headers": {
      "authorization": "Bearer " + admintoken
    }

  }
  // setting all the marketplace custom fields
  var mpCustomFields = []
  $.ajax(settings1).done(function (response) {
    mpCustomFields = response.CustomFields;
  })
  // finding the required market place custom field
  var cf = null;
  for (i = 0; i < mpCustomFields.length; i++) {

    if (mpCustomFields[i]["Name"] == cfName) {
      cf = mpCustomFields[i];
    }
  }
  // parsing the json if it exists
  if (cf) {
    cf.Values[0] = JSON.parse(cf.Values[0]);
    return cf;
  }
  else {
    return false;
  }
}


/**
 * rowChange - This function runs everytime something changed in a row. It saves all the changes to the Implementation
 * Meta Custom Field.
 *
 * @param  {Node} row The row node that has changed
 */
function rowChange(row) {

  //Retrieve all the row data
  var data = row.children;
  var rowID = row.id;
  var checkbox = data[2];
  var name = data[0].children[0].value;
  var type = data[1].children[0].value;
  var enable = data[2].children[0].checked;
  var options = null;

  //If selected option is dropdown, retrieve options data. The options are split using "," to get array of option.
  if (type == "selector") {
    options = data[3].children[0].value.split(",");
  }
  //Make a JSON Object with all the extracted data
  var cfJSON = { "enable": enable, "name": name, "type": type, "options": options };
  //The key for each row data is its rowID. We use the rowID to edit/add rows
  if (metaCF) {
    metaCF["Values"][0][rowID] = cfJSON;
    createCfImplementations("metacfdata", JSON.stringify(metaCF["Values"][0]), metaCF);
  }
  //If this is the first time the admin is running the plugin, there will be no meta Custom Fields in Implementations.
  // So we make them.
  else {
    var newMetaCF = { [rowID]: cfJSON };
    var code = createCfImplementations("metacfdata", JSON.stringify(newMetaCF), metaCF);
    metaCF = { "Code": code, "Name": "metacfdata", "Values": [newMetaCF] };
  }


}


/**
 * getCustomTable - This function retireves the Custom table data that stores the value that each user has entered for all the custom fields.
 * TODO: Custom Tables don't need authorization now, but they will need it later. Implement authorization when it comes out
 * @param  {String} customTableName Name of the Custom Table
 * @return {JSON}                  	retruns a JSON Object that contains an array of JSON files containing row information of the custom table.
 */
function getCustomTable(customTableName) {
  var baseUrl = document.location.hostname;
  var packageId = "456a3ff5-bb72-4a0a-93f3-1743b50764c9";

  var settings = {
    "url": "https://" + baseUrl + "/api/v2/plugins/" + packageId + "/custom-tables/" + customTableName + "/",
    "method": "GET",
    "async": false,
  };
  var res;
  $.ajax(settings).done(function (response) {
    res = response;
  });
  return res.Records;
}


/**
 * function to return the row of the user's data
 * @param {string} userId user id of the user whose data is required
 * @param {string} customTableName name of the custom table being used
 * @param {JSON} the data of the user being returned
 */
function returnSavedUserData(userId, customTableName) {
  // JSON going into the JSON field inside the ajax call
  var data = [{
    "Name": "userGuid",
    "Operator": "equal",
    "Value": userId
  }];
  // settings for the ajax call to query the custom field table
  var settings = {
    "url": "https://" + baseUrl + "/api/v2/plugins/" + packageId + "/custom-tables/" + customTableName + "/",
    "method": "POST",
    "async": false,
    "headers": {
      "Content-Type": "application/json"
    },
    "data": JSON.stringify(data),
  };
  var res;
  // making the ajax call and assigning the first record, which by logic should be the only record found
  $.ajax(settings).done(function (response) {
    res = response.Records[0];
  });
  return res;
}
