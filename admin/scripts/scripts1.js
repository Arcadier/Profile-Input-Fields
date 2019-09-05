var totalRows;
var metaData;
var metaCustomField;
var rowTypeCorrecter = {
  checkbox: "Checkbox",
  string: "Text",
  selector: "Dropdown",
  number: "Number"
};
var rowTypeInverse = {
  Checkbox: "checkbox",
  Text: "string",
  Dropdown: "selector",
  Number: "number"
};
function addEditFieldListener(number) {
  $("body").on(
    "click",
    ".field" + number + " .field-options .repogram",
    function() {
      var current = $(this);
      $(".field" + number + " .field-options .repogram").toggleClass("edit");
      $(".field" + number + " .field-options .repogram").toggleClass(
        "icon-edit icon-edit-save"
      );
      $(".field" + number + " .btn.btn-default.dropdown-toggle").attr(
        "disabled",
        false
      );
      if (current.hasClass("edit")) {
        $(".field" + number + " .field-name").removeClass("invisible");
        $(".field" + number + " .field-name").addClass("visible");
        $(".field" + number + " .current-label").removeClass("visible");
        $(".field" + number + " .current-label").addClass("invisible");
        if ($(".field" + number + " .selected-display").html() == "Dropdown") {
          $(".field" + number + " .dropdown-options").removeClass("invisible");
          $(".field" + number + " .dropdown-options").addClass("visible");
          $(".field" + number + " .dropdown-options-label").removeClass(
            "visible"
          );
          $(".field" + number + " .dropdown-options-label").addClass(
            "invisible"
          );
        } else {
          $(".field" + number + " .dropdown-options").removeClass("visible");
          $(".field" + number + " .dropdown-options").addClass("invisible");
          $(".field" + number + " .dropdown-options-label").removeClass(
            "invisible"
          );
          $(".field" + number + " .dropdown-options-label").addClass("visible");
        }
      } else {
        var fieldName = $(".field" + number + " .field-name").val();
        var fieldType = $(
          ".field" + number + " .dropdown .selected-display"
        ).text();
        var fieldOptions = $(".field" + number + " .dropdown-options").val();
        var fieldEnabled = $("#option" + number)[0].checked;
        var success = true;
        if (fieldName == "") {
          success = false;
          toastr.error("name of the field has to be entered", "error");
        }
        if (fieldType == "- Select -") {
          success = false;
          toastr.error("field type cannot be left unselected", "error");
        }
        if (fieldType == "Dropdown" && fieldOptions == "") {
          success = false;
          toastr.error(
            "dropdown options must be mentioned if field type is dropdown",
            "error"
          );
        }
        if (success) {
          var rowJson = {
            enable: fieldEnabled,
            name: fieldName,
            type: rowTypeInverse[fieldType]
          };
          if (fieldOptions == "") {
            rowJson.options = null;
          } else {
            rowJson.options = fieldOptions.split(",");
          }
          metaData["row" + (number + 1)] = rowJson;
          createCfImplementations("metacfdata", metaData, metaCustomField);
          $(".field" + number + " .field-name").removeClass("visible");
          $(".field" + number + " .field-name").addClass("invisible");
          $(".field" + number + " .current-label").removeClass("invisible");
          $(".field" + number + " .current-label").addClass("visible");
          $(".field" + number + " .dropdown-options").removeClass("visible");
          $(".field" + number + " .dropdown-options").addClass("invisible");
          $(".field" + number + " .dropdown-options-label").removeClass(
            "invisible"
          );
          $(".field" + number + " .dropdown-options-label").addClass("visible");
          $(current)
            .closest(".field" + number + "")
            .find(".current-label")
            .text($(".field" + number + " .field-name").val());
          $(current)
            .closest(".field" + number + "")
            .find(".dropdown-options-label")
            .text($(".field" + number + " .dropdown-options").val());
          disableDropDown(number);
        } else {
          $(".field" + number + " .field-options .repogram").toggleClass(
            "edit"
          );
          $(".field" + number + " .field-options .repogram").toggleClass(
            "icon-edit icon-edit-save"
          );
        }
      }
    }
  );
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

function disableDropDown(number) {
  $(".field" + number + " .btn.btn-default.dropdown-toggle").attr(
    "disabled",
    true
  );
}

function addDropDownLinkEventListener(number) {
  $("body").on(
    "click",
    ".field" + number + " .dropdown .dropdown-toggle",
    function() {
      $(".field" + number + " .dropdown .dropdown-menu").toggleClass("visible");
    }
  );
  $("body").on("click", ".field" + number + " .dropdown-menu li a", function() {
    var current = $(this);
    $(".field" + number + " .dropdown-menu li a").removeClass("active");

    if (!current.hasClass("active")) {
      current.addClass("active");
    }
    var selectedOption = $(current).text();
    $(this)
      .closest(".type-select")
      .find(".selected-display")
      .addClass("selected-focus")
      .text(selectedOption);
    if (selectedOption == "Dropdown") {
      $(".field" + number + " .dropdown-options").removeClass("invisible");
      $(".field" + number + " .dropdown-options").addClass("visible");
      $(".field" + number + " .dropdown-options-label").removeClass("visible");
      $(".field" + number + " .dropdown-options-label").addClass("invisible");
    } else {
      $(".field" + number + " .dropdown-options").removeClass("visible");
      $(".field" + number + " .dropdown-options").addClass("invisible");
      $(".field" + number + " .dropdown-options-label").removeClass("visible");
      $(".field" + number + " .dropdown-options-label").addClass("invisible");
      $(".field" + number + " .dropdown-options").val("");
      $(".field" + number + " .dropdown-options-label").html("");
    }
    $(".field" + number + " .dropdown .dropdown-menu").toggleClass("visible");
  });
}

function addCheckBoxEventListener(number) {
  $("body").on(
    "click",
    ".field" + number + " .field-options label",
    function() {
      console.log(number);
      console.log($("#option" + number)[0].checked);
      var currCheckState = !$("#option" + number)[0].checked;
      metaData["row" + (number + 1)].enable = currCheckState;
      createCfImplementations("metacfdata", metaData, metaCustomField);
    }
  );
}

function addRow(
  number,
  name,
  type,
  enabled,
  newField = false,
  dropdownOptions = false
) {
  var highlighted = "selected-focus";
  var checkbox = "";
  if (newField) {
    name = "";
    type = "- Select -";
    highlighted = "";
    enabled = false;
    totalRows++;
  }
  if (enabled) {
    checkbox = " checked";
  }
  if (type != "Dropdown") {
    dropdownOptions = "";
  } else {
    dropdownOptions = dropdownOptions.join(",").replace(/, /g, ",");
  }
  console.log("input dropdown options", dropdownOptions);
  var rowString = `<tr class="field${number}">
    <td>
        <span class="current-label visible">${name}</span>
        <input type="text" class="field-name invisible" name="" value="${name}">
    </td>
    <td>
        <div class="dropdown type-select">
            <button class="btn btn-default dropdown-toggle" type="button" id="report-menu"
        data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
                <span class="selected-display ${highlighted}">${type}</span>
                <span class="carat up"><img src="./images/chevron_black_down.svg" alt=""
                title=""></span>
            </button>
            <ul class="dropdown-menu" aria-labelledby="report-menu">
                <li><a id="rank-based" href="#">Text</a></li>
                <li><a id="time-based" href="#">Number</a></li>
                <li><a id="rank-based" href="#">Checkbox</a></li>
                <li><a id="time-based" href="#">Dropdown</a></li>
            </ul>
        </div>

    </td>
    <td>
        <span class="dropdown-options-label visible">${dropdownOptions}</span>
        <input type="text" class="dropdown-options invisible" name="" value=${dropdownOptions}>
    </td>
    <td>
        <div class="field-options">
            <input type="checkbox" id="option${number}" ${checkbox} /><label for="option${number}" ></label>
            <a href="#"><i class="icon repogram icon-edit"></i></a>
            <a href="#" class="btn_delete_act"><i class="icon icon-delete"></i></a>
        </div>
    </td>
</tr>`;
  var rowNode = $.parseHTML(rowString)[0];
  var tableBody = document.getElementById("user-custom-field");
  tableBody.appendChild(rowNode);
  addEditFieldListener(number);
  disableDropDown(number);
  addDropDownLinkEventListener(number);
  addCheckBoxEventListener(number);
}

function initialRowAdding(customFieldMetaData) {
  var count = 0;
  for (row in customFieldMetaData) {
    var currMeta = customFieldMetaData[row];
    var rowName = currMeta.name;
    var rowType = rowTypeCorrecter[currMeta.type];
    var rowStatus = currMeta.enable;
    var rowOptions = currMeta.options;
    if (!rowOptions) {
      rowOptions = false;
    }
    addRow(count, rowName, rowType, rowStatus, false, rowOptions);

    count++;
  }
}

$(document).ready(function() {
  metaData = retrieveMetaData();
  console.log(metaData);
  // get from api and then count
  totalRows = Object.keys(metaData).length;
  console.log("total rows", totalRows);
  retrieveMetaData();
  initialRowAdding(metaData);
});

function retrieveMetaData() {
  metaCustomField = retrieveCfValueJSON("metacfdata");
  var metaDataCf;
  if (metaCustomField) {
    metaDataCf = metaCustomField.Values[0];
  } else {
    metaDataCf = {};
    createCfImplementations("metacfdata", metaDataCf, false);
    metaCustomField = retrieveCfValueJSON("metacfdata");
  }
  return metaDataCf;
}

/**
 * retrieve the json of the stored stringified custom field
 * @param {String} cfName the string of the stored custom field
 * @returns {JSON|boolean} the JSON of the custom field if it exists it returns false if the custom field doesn't exist
 */
function retrieveCfValueJSON(cfName) {
  var baseUrl = document.location.hostname;
  // baseUrl = "forgottentoy.test.arcadier.io";
  var admintoken = getCookie("webapitoken");
  // admintoken =
  //   "N3pQ-D-eUnJG0hb2q8bO2G8rla-VPFLZKG7Ug1kH9k9kkZ9PhPuexhG3geDxkMPs0nmLxDT-ZrraR7HTZU6cpHMbbWgIPw-_LzR23cGjrAeNc41kbWS4_7r5Uj8sqcPYGG_rw8P5i4yjdV04ZW2hnFtnEelGyExn03xwrvUgXpZPD9WzurEtudPe0HnD90hoTUZnkPNj0Fkt1w88gY9XNOb7kIh-xIevke8QVxICmLT6eh0KBlZvkp2OGHrgYYz9nyRpmMydp9Gzxyedp-fwe5oECjLVqPG4EFDM4n1BqKRc2NyRS01Swv4rUfr4RDo6XG9ZXP6BA7bQVWD0iiJMxhMpOo9234F7q_03ihbyOQyZCECH04M1Nq2rBYgiFp2UQ4bQes7GH8aGmTbLKq88EyjndTVpnjMrlBq2gJEpyy6zvxyk9p-lG211xCYYnkWRdHajZHWHdMYiRaW6zLbR5Cmxz59Ty4YtY2ZP5yB_cEvs538fAedTlUTQYfPKFKgyBuKUvjQT2FlmAqh3a30JF5hP7ihX-BQ3Aqq9BJyHBzq8qoHvFX4pCjHG02AZhaf-GQ-FFRTCSXwAP1t7Vs7Lo4tJ5kZ--MP0lvfI8_3y73tzYD-09hvoR7kBOWeUU_SZIbKhVt6egs-VCp8akvvXE9S_AqKjIAuyPo4v6cIeJHgbdU0IxemuUihDIG9Q5f1qfMpx0sLQa4eQqi5Q33BKazXs1QSMtrsqu6WXwjzAbztJ_eE9xmVQUsR5jPJtimEvqUpiDmu46two9KprI17dgILMXvE4-T_1KLksbdzmGcrq0We4";
  // settings for the api call to return the custom field
  var settings1 = {
    url: "https://" + baseUrl + "/api/v2/marketplaces",
    method: "GET",
    async: false,
    headers: {
      authorization: "Bearer " + admintoken
    }
  };
  // setting all the marketplace custom fields
  var mpCustomFields = [];
  $.ajax(settings1).done(function(response) {
    mpCustomFields = response.CustomFields;
  });
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
  } else {
    return false;
  }
}

/**
 * create a custom field inside the implementations and set the value of it
 * @param {String} cfName name of the custom field whose value needs to be set
 * @param {JSON} storedData value which is going to be stored inside a custom field
 * @param {JSON|boolean} cf a json object of the existing custom field, false if a custom field doesn't exist
 */
function createCfImplementations(cfName, storedData, cf) {
  storedData = JSON.stringify(storedData);
  var baseUrl = document.location.hostname;
  var adminID = document.getElementById("userGuid").value;
  var admintoken = getCookie("webapitoken");

  // if the custom field already exists
  if (cf) {
    // body of the json used to make the custom field
    data = {
      CustomFields: [
        {
          Code: cf.Code,
          Values: [storedData]
        }
      ]
    };
    // settings of the api call being used to make the api call
    var settings1 = {
      url: "https://" + baseUrl + "/api/v2/marketplaces",
      method: "POST",
      async: false,
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + admintoken
      },
      data: JSON.stringify(data)
    };

    $.ajax(settings1);
  }
  // if the custom field doesn't already exists
  else {
    // the json body to make the post request to make a custom field
    data = {
      Name: cfName,
      IsMandatory: true,
      DataInputType: "textfield",
      ReferenceTable: "Implementations",
      DataFieldType: "string"
    };
    // settings used to make the post request to make the custom field
    var settings2 = {
      url:
        "https://" +
        baseUrl +
        "/api/v2/admins/" +
        adminID +
        "/custom-field-definitions",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + admintoken
      },
      async: false,
      data: JSON.stringify(data)
    };
    // making the ajax call to make the custom field definition
    $.ajax(settings2).done(function(response) {
      cf = response;
      // body to update the newly made custom field
      data2 = {
        CustomFields: [
          {
            Code: cf.Code,
            Values: [storedData]
          }
        ]
      };
      // settings to update the value of the new custom field
      var settings3 = {
        url: "https://" + baseUrl + "/api/v2/marketplaces",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + admintoken
        },
        async: false,
        data: JSON.stringify(data2)
      };
      // making the API call to make the new custom field
      $.ajax(settings3);
    });
  }
}
