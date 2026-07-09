// 插入loading 的 dialog
// class 切換不同類型
// https://cssloaders.github.io/

//=============================================================================
// Pin 20250208 要搬走 或拿掉?
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
