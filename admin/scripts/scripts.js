var packageIdUCF = document.currentScript.src.replace('/scripts/scripts.js','').trim().split('/');
packageIdUCF = packageIdUCF[(packageIdUCF).length-1];
console.log(packageIdUCF);
$(document).ready(function() {
  var pageUrl = window.location.href;
  if (pageUrl.indexOf("admin/usermanager/userdetail") != -1) {
    var userID;
    //Get all uls that have user data
    var ul = document.getElementsByClassName("w-list-items");
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
        var newLi = $.parseHTML(
          `<li><label>${key}</label><p>${allData[key]}</p></li>`
        )[0];
        ul[0].appendChild(newLi);
      }
    }
  }
});

/**
 * function to return the row of the user's data
 * @param {string} userId user id of the user whose data is required
 * @param {string} customTableName name of the custom table being used
 * @param {JSON} the data of the user being returned
 */
function returnSavedUserData(userId, customTableName) {
  // JSON going into the JSON field inside the ajax call
  var baseUrl = window.location.hostname;
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
  });
  return res;
}

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
    url:
      "https://" + baseURL + "/api/v2/admins/" + adminID + "/users/?pageSize=1",
    method: "GET",
    async: false,
    headers: {
      Authorization: "Bearer " + adminToken
    }
  };

  var pageSize;
  $.ajax(settings).done(function(response) {
    //Storing record size
    pageSize = response.TotalRecords;
  });
  //Making another API call with pageSize = record size
  var settings2 = {
    url:
      "https://" +
      baseURL +
      "/api/v2/admins/" +
      adminID +
      "/users/?pageSize=" +
      pageSize,
    method: "GET",
    async: false,
    headers: {
      Authorization: "Bearer " + adminToken
    }
  };
  var records;
  $.ajax(settings2).done(function(response) {
    //Storing the user details array
    records = response.Records;
  });
  return records;
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
 * getCookie - This function returns the value of cookie
 *
 * @param  {String} name The name of the cookie
 * @return {String}      Its value
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
