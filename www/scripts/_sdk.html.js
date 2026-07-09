//  各種常用 呼叫 function
//
//
//
//
//
//
//
//

//=============================================================================
//   Object 建立一個表格在 這一個區塊中
//
//   傳入 object
//=============================================================================
function create_JsonObjectToTable(obj, myJObject) {
    if (myJObject == null) return null;
    //var arr = [];
    // 判斷是不是一個 array
    if (Object.prototype.toString.call(myJObject) != "[object Object]") {
        return null;
    }

    var tbd = document.createElement("tbody");
    //var tbd = obj
    {
        var tr = document.createElement("tr");
        {
            var td = document.createElement("td");
            td.innerHTML = JSON.stringify(myJObject);
            tr.appendChild(td);
        }
        tbd.appendChild(tr);
    }
    obj.appendChild(tbd);
}

//=============================================================================
//   1DArray 建立一個表格在 這一個區塊中
//
//   傳入1D array
//=============================================================================
function create_Json1DArrayToTable(obj, my1DArray) {
    if (my1DArray == null) return null;
    //var arr = [];
    // 判斷是不是一個 array
    if (Object.prototype.toString.call(my1DArray) != "[object Array]") {
        return null;
    }

    var tbd = document.createElement("tbody");
    //var tbd = obj;
    {
        var tr = document.createElement("tr");
        for (var i = 0; i < my1DArray.length; i++) {
            //console.log(Object.prototype.toString.call(my1DArray[i]));  //"[object Array]"
            {
                var td = document.createElement("td");
                if (Object.prototype.toString.call(my1DArray[i]) == "[object Object]") {
                    create_JsonObjectToTable(td, my1DArray[i]);
                } else {
                    td.innerHTML = my1DArray[i];
                }
                tr.appendChild(td);
            }
        }
        tbd.appendChild(tr);
    }
    obj.appendChild(tbd);
}

//=============================================================================
//   2D陣列 建立一個表格在 這一個區塊中
//   <table id="TablePlace" border="1"><tr><td>這是表格</td></tr></table>建立一個表格再
//   傳入2D array
//=============================================================================
/* example
    var array1 = '[["1", "Haparinnkusu", "SaLafe", "", "1", "莎樂菲", "Launch Cart", ""], ["1", "Haparinnkusu", "SaLafe", "", "1", "莎樂菲", "Launch Cart", ""]]';
    create_2DArrayToTable( array1 );
*/
function create_Json2DArrayToTable(obj, my2DArray) {
    if (my2DArray == null) return null;
    //var arr = [];
    // 判斷是不是一個 array
    if (Object.prototype.toString.call(my2DArray) != "[object Array]") {
        return null;
    }

    // 先清除
    {
        var tb = obj.getElementsByTagName("tbody");
        for (var i = 0; i < tb.length; i++) {
            obj.removeChild(tb[i]);
        }
    }

    var tbd = document.createElement("tbody");
    //var tbd = obj;

    //for ( var item in my2DArray )
    for (var i = 0; i < my2DArray.length; i++) {
        var item = my2DArray[i];
        var tr = document.createElement("tr");
        for (var j = 0; j < item.length; j++) {
            //console.log(Object.prototype.toString.call(my2DArray[i][j]));  //"[object Array]"
            var td = document.createElement("td");
            if (Object.prototype.toString.call(item[j]) == "[object Object]") {
                create_JsonObjectToTable(td, item[j]);
            } else if (Object.prototype.toString.call(item[j]) == "[object Array]") {
                create_Json1DArrayToTable(td, item[j]);
            } else {
                td.innerHTML = item[j];
            }
            tr.appendChild(td);
        }
        tbd.appendChild(tr);
    }

    /*
    for ( var i = 0; i < my2DArray.length; i++ )
    {
        var tr = document.createElement( 'tr' );
        for ( var j = 0; j < my2DArray[i].length; j++ )
        {
            //console.log(Object.prototype.toString.call(my2DArray[i][j]));  //"[object Array]"
            var td = document.createElement( 'td' );
            if ( Object.prototype.toString.call( my2DArray[i][j] ) == '[object Object]' )
            {
                create_JsonObjectToTable( td, my2DArray[i][j] );
            }
            else if ( Object.prototype.toString.call( my2DArray[i][j] ) == '[object Array]' )
            {
                create_Json1DArrayToTable( td, my2DArray[i][j] );
            }
            else
            {
                td.innerHTML = my2DArray[i][j];
            }
            tr.appendChild( td );
        }
        tbd.appendChild( tr );
    }
    */
    obj.appendChild(tbd);
    return tbd;
}

//=============================================================================
//   2D陣列 建立一個select在 這一個區塊中
//   <select name="number" id="number">建立一個select再
//   傳入2D array
//=============================================================================
/* example
      var array1 = [["car01", "car011"], ["car02", "car012"], ["car03", "car013"] ];
      createSelect
      (
          "supplier", array1,
          function ()
          {
              chosenoption = this.options[this.selectedIndex];
              alert(chosenoption.value);
          }
      );
*/
function create_JsonArrayToSelect(selectobj, myArray, onchangedcb) {
    selectobj.onchange = onchangedcb;
    for (var i = 0; i < myArray.length; i++) {
        selectobj.add(new Option(myArray[i][0], i), null);
    }
}

// messageBox v4

//	buttons			[in]	buttons
//	defaultClick	[in]	defaultClick(index), index: index number of the button clicked, from 0
//	afterClose		[in]	afterClose()
// REF: https://github.com/jtsage/jquery-mobile-windows
// 		http://demos.jquerymobile.com/1.4.5/popup-dynamic

/* example
        messageBox("(This is my message box)", "Error", "Ok");

              messageBox("(This is my message box)", "Question", ["Ok", "Cancel"], function(index) { alert("click: idx=" + index); });
            messageBox("(This is my message box)", "Question", {
                Ok: function(index) { alert("click: ok, idx=" + index); },
                Cancel: function(index) { alert("click: cancel, idx=" + index); }

        messageBox("(This is my message box)", "Error", "Ok");

        messageBox("<p>(This is my message box)</p>"+
            "<h2>Are you sure you wish to exit the application?</h2>"+
            "<p>You have unsaved changes. If you exit without saving them, you will lose them.</p>", "Question", {
            Ok: {
                icon: "alert",
                text: "Just exit!",
                click: function(index) {
                    alert("click: ok: idx=" + index);
                }
            },
            Try: {
                text: "Save and exit...",
                close: false,
                theme: "c",
            },
            Cancel: {
                icon: "delete",
                theme: "b",
            }},
            function(index) {
                alert("click: idx=" + index);
            }


*/
function messageBox(text, caption, buttons, defaultClick, afterClose) {
    var options = {
        // below are basic options (same as JQM)
        //!		corners: true,				// true* | false
        dismissible: false, // true* | false
        history: false, // true* | false
        overlayTheme: "b", // swatch letter (a-z) - Default "null" (transparent background)
        //!		positionTo: "origin",		// origin* | window | selector
        //!		shadow: true,				// true* | false
        theme: null, // swatch letter (a-z) | none - Default "null" (inherited), "none" sets the popup to transparent
        //!		tolerance: "30,15,30,15",	// 30,15,30,15* - Distance from the edges of the window (top, right, bottom, left)
        transition: "pop", // none* | transition - The transition to use when making the popup appear/disappear.
        // NOTE: above ! comments because we use the defaults in this moment

        // belows are extend options
        closeButton: false,
        headerTheme: "a",
        buttonTheme: null, // "a",
    };

    var popupId = "_msgbox";

    console.log("messageBox:" + text);

    //	console.log("mb:" + $("#" + popupId + "-popup").attr("class"));
    //	console.log("mb:" + $("#" + popupId).parent().attr("class"));

    //	if ($("#" + popupId).parent().hasClass("ui-popup-active")) {
    if ($.mobile.popup.active && $.mobile.popup.active.element[0] === $("#" + popupId)[0]) {
        console.log("messageBox: last msgbox not closed!");
        alert("chaining of msgboxs was not allowed!");
        return;
    }

    if ($(".ui-page-active .ui-popup-active").length > 0) {
        console.log("messageBox: last popup not closed!");
        alert("chaining of popups was not allowed!");
        return;
    }

    if (!buttons && !options.closeButton) {
        // don't need buttons? so we must allow dismissing
        options.dismissible = true;
    }

    var popup = '<div data-role="popup" id="' + popupId + '" style="min-width: 16em;"></div>';

    // create a basic popup into document (inside a page)
    //	var page = $.mobile.activePage;							// jqm 1.4-
    var page = $("body").pagecontainer("getActivePage"); // jqm 1.5+
    var popObj = $(popup).appendTo(page);

    popObj.popup({
        //!    	corners: option.corners,
        dismissible: options.dismissible,
        history: options.history,
        overlayTheme: options.overlayTheme,
        //!   	positionTo: options.positionTo,
        //!  	shadow: options.shadow,
        theme: options.theme,
        //!    	tolerance : options.tolerance,
        transition: options.transition,
        // NOTE: above ! comments because we use the defaults in this moment

        afterclose: function () {
            // need to remove popup from document when closed
            $(this).remove();

            if ($.type(afterClose) === "function") afterClose();
        },
    });

    // makeup content
    var content = '<div role="main" class="ui-content">';
    if (text) {
        // put text here
        content += "<div>" + text + "</div>";
    }
    if (buttons) {
        // put buttons here (insert later)
        content += '<div id="_msgboxBtnsHere" style="clear: left;"></div>';
    }
    content += "</div>";

    var closebtn = "";
    if (options.closeButton)
        // TODO: support ui-btn-right or ui-btn-left option
        closebtn = '<a href="#" data-rel="back" class="ui-btn ui-corner-all ui-btn-a ui-icon-delete ui-btn-icon-notext ui-btn-right">Close</a>';

    // append header/content into the popup
    if (caption) {
        // makeup header
        var header = '<div class="message-box-header" data-theme="' + options.headerTheme + '">' + caption + "</div>";

        $(header).appendTo(popObj).toolbar().before(closebtn).after(content);
    } else {
        // only content
        $(content).appendTo(popObj).before(closebtn);
    }

    // prepare to makeup buttons...
    var thisNode = $("#_msgboxBtnsHere");
    var btnCount = 0;

    // how-to makeup a button
    function makeButton(name, props) {
        props = $.extend(
            {
                text: name,
                click: null,
                close: true,
                //!				corners: true,					// true* | false
                icon: null, // home | delete | plus | arrow-u | arrow-d | ...
                iconpos: "left", // left* | right | top | bottom | notext
                inline: true, // true | false*
                //!				mini: false,					// true | false*
                //!				shadow : true,					// true* | false
                theme: options.buttonTheme, // swatch letter (a-z)
                //! NOTE: above ! comments because we use the defaults in this moment
            },
            props
        );

        // makeup style class
        //!			var btnClass = "ui-btn";
        var btnClass = "ui-btn ui-corner-all ui-shadow";
        //!			if (props.corners)
        //!				btnClass += " ui-corner-all";
        if (props.icon) {
            btnClass += " ui-icon-" + props.icon;
            btnClass += " ui-btn-icon-" + props.iconpos;
        }
        if (props.inline) btnClass += " ui-btn-inline";
        //!			if (props.mini)
        //!				btnClass += " ui-btn-mini";
        //!			if (props.shadow)
        //!				btnClass += " ui-shadow";
        if (props.theme) btnClass += " ui-btn-" + props.theme;
        //! NOTE: above ! comments because we use the defaults in this moment

        var btnIndex = btnCount++;
        var btnId = popupId + "Btn" + btnIndex;
        var btn = '<a href="javascript:void(0);" id="' + btnId + '" class="' + btnClass + '">' + props.text + "</a>";

        $(btn)
            .appendTo(thisNode)
            .unbind("vclick click")
            .bind("click", function () {
                var returnValue = props.click ? props.click(btnIndex) : true;
                if (returnValue !== false && props.close === true) {
                    popObj.popup("close");
                }
            });
    }

    // makeup button(s)
    if ($.type(buttons) === "string") {
        // just a single text
        makeButton(buttons, { inline: false, click: defaultClick });
    } else if ($.type(buttons) === "array") {
        // just a text array
        $.each(buttons, function (index, value) {
            makeButton(value, { click: defaultClick });
        });
    } else if (buttons) {
        // a struct defined buttons
        $.each(buttons, function (name, props) {
            if ($.type(props) === "function") props = { click: props };
            else if ($.type(props.click) !== "function") props.click = defaultClick;
            makeButton(name, props);
        });
    }

    // finally...
    popObj.popup("open");
}

////////////////////////////////////////////////////////////////////////////////////////////////////
//
function createDatePickerMonth(id, func) {
    $(id).datepicker({
        changeMonth: true,
        changeYear: true,
        showButtonPanel: true,
        dateFormat: "yy-mm",
        monthNames: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
        monthNamesShort: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
        onClose: function (dateText, inst) {
            var month = $("#ui-datepicker-div .ui-datepicker-month :selected").val();
            var year = $("#ui-datepicker-div .ui-datepicker-year :selected").val();
            $(this).datepicker("setDate", new Date(year, month, 1));
            if (func) func();
        },
        beforeShow: function (input, inst) {
            if ((datestr = $(this).val()).length > 0) {
                actDate = datestr.split("-");
                year = actDate[0];
                month = actDate[1] - 1;
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
            monthNames: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
            monthNamesShort: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
            onClose: function (dateText, inst) {
                if (func) func();
            },
        })
        .attr("autocomplete", "off");
}

//=============================================================================
//
// 取得select的option
//=============================================================================
function get_selected_option(select_obj) {
    if (select_obj.length <= 0) return null;
    if (select_obj.selectedIndex < 0 || select_obj.selectedIndex >= select_obj.length) return null;
    return select_obj.options[select_obj.selectedIndex];
    //return select_obj.options[select_obj.selectedIndex];
}

function get_selected_option_value(select_obj) {
    var option = get_selected_option(select_obj);
    if (option != null) return option.value;
    return "";
}

//=============================================================================
//
// 將 option value 為 value 的選項設置為被選
//=============================================================================
function set_select_option_by_value(select_obj, value) {
    for (var i = 0; i < select_obj.options.length; i++) {
        if (select_obj.options[i].value == value) {
            select_obj.options[i].selected = true;
            return true;
        }
    }
    return false;
}

//=============================================================================
//
// 清除表單內的資料
//=============================================================================
function initalize_page_value(obj) {
    if (obj.hasChildNodes()) {
        var children = obj.childNodes;

        for (var i = 0; i < children.length; i++) {
            // do something with each child as children[i]
            // NOTE: List is live, adding or removing children will change the list
            initalize_page_value(children[i]);
        }
    } else {
        if (obj.type == "text" || obj.type == "textarea" || obj.type == "number" || obj.type == "tel") {
            obj.value = "";
        }
    }
}

//=============================================================================
//
// 顯示loading
//=============================================================================
/**
 * Module for displaying "Waiting for..." dialog using Bootstrap
 *
 * @author Eugene Maslovich <ehpc@em42.ru>
 * @author Jeff Li <jeff@asian-bridge.com.tw>
 */

// styple wave01, circle01
var g_is_show_loading = 0;
var loadingBox =
    loadingBox ||
    (function ($) {
        "use strict";
        var $dialog;

        return {
            /**
             * Opens our dialog
             * @param message Custom message
             * @param options Custom options:
             * 				  options.dialogSize - bootstrap postfix for dialog size, e.g. "sm", "m";
             */
            show: function (types, message, options, style) {
                g_is_show_loading++;
                if (g_is_show_loading != 1) return;

                // Assigning defaults
                if (typeof types === "undefined") {
                    types = "waiting";
                }
                if (typeof options === "undefined") {
                    options = "m";
                }
                if (typeof message === "undefined") {
                    message = "Loading";
                }
                var settings = $.extend(
                    {
                        dialogSize: options,
                        progressType: "",
                        onHide: null, // This callback runs after the dialog was hidden
                    },
                    options
                );

                switch (style) {
                    case "circle01": {
                        $dialog = $(
                            '<div class="loader_circle01">\
                             <div class="loader_circle01-header"><h3 style="margin:0;"></h3></div>\
                             <div class="loader_circle01-inner">\
                                 <div class="loader_circle01-line-wrap">\
                                 <div class="loader_circle01-line"></div>\
                             </div>\
                             <div class="loader_circle01-line-wrap">\
                                 <div class="loader_circle01-line"></div>\
                             </div>\
                             <div class="loader_circle01-line-wrap">\
                                 <div class="loader_circle01-line"></div>\
                             </div>\
                             <div class="loader_circle01-line-wrap">\
                                 <div class="loader_circle01-line"></div>\
                             </div>\
                             <div class="loader_circle01-line-wrap">\
                                 <div class="loader_circle01-line"></div>\
                             </div>\
	                     </div >'
                        );
                    }
                    case "wave01":
                    default:
                        {
                            $dialog = $(
                                '<div class="loader_wave01_panel">\
                                 <div class="loader_wave01">\
                                    <span class="loader_wave01-span">L</span>\
                                    <span class="loader_wave01-span">O</span>\
                                    <span class="loader_wave01-span">A</span>\
                                    <span class="loader_wave01-span">D</span>\
                                    <span class="loader_wave01-span">I</span>\
                                    <span class="loader_wave01-span">N</span>\
                                    <span class="loader_wave01-span">G</span>\
                                    <div class="covers">\
                                        <span></span>\
                                        <span></span>\
                                        <span></span>\
                                        <span></span>\
                                        <span></span>\
                                        <span></span>\
                                        <span></span>\
                                    </div>\
                                 </div >\
                             </div >'
                            );
                        }
                        break;
                }

                switch (types) {
                    case "waiting":
                        // Creating modal dialog's DOM
                        // Configuring dialog
                        //$dialog.find( '.modal-dialog' ).attr( 'class', 'modal-dialog' ).addClass( 'modal-' + settings.dialogSize );
                        $dialog.find("h3").text(message);
                        break;
                    case "alert":
                        break;
                }

                // Adding callbacks
                if (typeof settings.onHide === "function") {
                    //$dialog.off( 'hidden.bs.modal' ).on( 'hidden.bs.modal', function ( e )
                    //{
                    //    settings.onHide.call( $dialog );
                    //} );
                }

                // Opening dialog
                $dialog.modal({
                    backdrop: "static",
                    keyboard: false, // to prevent closing with Esc button (if you want this too)
                });
            },
            /**
             * Closes dialog
             */
            hide: function (all) {
                if (all == 1) {
                    if (g_is_show_loading >= 1) g_is_show_loading = 1;
                    else g_is_show_loading = 0;
                }

                if (g_is_show_loading == 1) {
                    $dialog.modal("hide");
                }

                g_is_show_loading--;
                if (g_is_show_loading < 0) g_is_show_loading = 0;
            },
        };
    })(jQuery);
