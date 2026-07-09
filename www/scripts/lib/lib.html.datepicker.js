//  各種常用 呼叫 function
//
//
//
//
//
//
//
//
function createDatePickerMonth(id, func) {
  $(id).datepicker({
    changeMonth: true,
    changeYear: true,
    showButtonPanel: true,
    dateFormat: "yy-mm",
    monthNames: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
    monthNamesShort: [
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "11",
      "12",
    ],
    onClose: function (dateText, inst) {
      var month = $("#ui-datepicker-div .ui-datepicker-month :selected").val();
      var year = $("#ui-datepicker-div .ui-datepicker-year :selected").val();
      $(this).datepicker("setDate", new Date(year, month, 1));
      if (func) func();
    },
    beforeShow: function (input, inst) {
      var datestr = $(this).val();
      if (datestr.length > 0) {
        var actDate = datestr.split("-");
        var year = actDate[0];
        var month = actDate[1] - 1;
        $(this).datepicker("option", "defaultDate", new Date(year, month));
        $(this).datepicker("setDate", new Date(year, month));
      }
    },
  });
}

function createDatePickerDate(id, func) {
  $(id)
    .datepicker({
      changeMonth: true,
      changeYear: true,
      showButtonPanel: true,
      dateFormat: "yy-mm-dd",
      monthNames: [
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "10",
        "11",
        "12",
      ],
      monthNamesShort: [
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "10",
        "11",
        "12",
      ],
      onClose: function (dateText, inst) {
        if (func) func();
      },
    })
    .attr("autocomplete", "off");
}
