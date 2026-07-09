/*
作者：hsu po-wei
E-Mail：hpw925@hotmail.com
授權：GPL 3
*/

// 全區域儲存 目前 某一個 pagination 他當下選的到 page_index 是哪一個
const s_page_index = new Map();

// element_table_grid_id 顯示表格的地方 table
// element_span_pagination_id 顯示分頁的地方
// count_of_page 一頁有幾筆資料
// row_count 一共有幾筆資料
// func_select_page 當點擊 某一頁後 取的的內容
function tablepage_d(
  element_span_pagination_id,
  count_of_page,
  row_count,
  func_select_page,
) {
  let page_index_ = 1;
  let curr_index_ = 1;
  const sector_count_ = 10; // 一次捲動10頁
  let page_str_ = "";
  const row_count_ = row_count;
  //const source_ = element_table_grid_id;
  const no_sel_color_ = "#CCCCCC";
  const sel_color_ = "black";
  const boarder_color_ = "white";
  const page_font_color_ = "white";
  const status_font_color_ = "black";

  // [新增] 國際化 (i18n) 處理
  const lang = window.localStorage.getItem("language") || "zh-tw";
  const isEn = lang.includes("en");
  const locale = window.localeData?.common || {};
  const textPage = locale.page || (isEn ? "Page" : "頁");
  const textTotalRecords = (
    locale.total_records ||
    (isEn ? "Total {{count}} records" : "共 {{count}} 筆")
  ).replace("{{count}}", row_count_);
  const textPrefix = isEn ? "" : "第";
  const textSuffix = isEn ? "" : "頁";

  change_page_content();

  function change_page_content() {
    // 取得資料筆數
    const obj_element_span_pagination_id = element_span_pagination_id.id;
    if (s_page_index.get(obj_element_span_pagination_id) !== undefined) {
      curr_index_ = s_page_index.get(obj_element_span_pagination_id);
    }

    // 2025-07-24 如果清空地層檢查
    {
      // 如果目前所在的頁數 已經超過 對大的筆數 那就回第一頁吧
      if (curr_index_ >= row_count / count_of_page + 1) {
        curr_index_ = 1;
      }
    }

    // 顯示頁碼
    page_str_ = "<table><tr>";

    if (row_count_ > 0) {
      if (page_index_ > 1) {
        // 前10頁
        page_str_ += `<td class='tablepage_prev_sector' style='cursor:pointer;color:${status_font_color_};'>&lt</td>`;
      } else {
        page_str_ += `<td style="color:${status_font_color_};"></td>`;
      }

      page_str_ += "<td>&nbsp</td>";

      let page_counter = sector_count_ * count_of_page; // 一次會可以預顯的資料數
      let curr_page = page_index_;
      // [修改] 使用翻譯字串
      if (!isEn) {
        page_str_ += `<td style='color:${status_font_color_};'><b>${textPrefix}</b></td>`;
      }
      for (
        let i = (page_index_ - 1) * count_of_page;
        i < row_count_;
        i += count_of_page
      ) {
        // 最多只畫10頁
        if (page_counter <= 0) {
          // 之後還有資料
          break;
        }
        page_counter -= count_of_page;

        if (curr_index_ === curr_page) {
          page_str_ += `<td valign='top'><table data-page='${curr_page}' style='width:20px;cursor:pointer;color:${page_font_color_};border-collapse:collapse;border-style:solid;border-width:1px;border-color:${boarder_color_};background-color:${sel_color_}'><tr><th>${curr_page++}</th></tr></table></td>`;
        } else {
          page_str_ += `<td valign='top'><table data-page='${curr_page}' style='width:20px;cursor:pointer;color:${page_font_color_};border-collapse:collapse;border-style:solid;border-width:1px;border-color:${boarder_color_};background-color:${no_sel_color_}'><tr><th>${curr_page++}</th></tr></table></td>`;
        }
      }

      // [修改] 使用翻譯字串
      if (!isEn) {
        page_str_ += `<td style="color:${status_font_color_}"><b>${textSuffix}</b></td>`;
      }
      page_str_ += `<td>&nbsp</td>`;

      // 判斷還有沒有下10頁
      if (page_counter <= 0) {
        page_str_ += `<td class="tablepage_next_sector" style="cursor:pointer;color:${status_font_color_}">&gt</td>`;
      } else {
        page_str_ += `<td style="color:${status_font_color_}"></td>`;
      }
      page_str_ += "<td>&nbsp</td>";
    }
    let count_of_all_page = Math.ceil(row_count_ / count_of_page);
    // [修改] 使用翻譯字串
    let pageInfoStr;
    if (isEn) {
      pageInfoStr = `${textPage} ${count_of_all_page}&nbsp;&nbsp;&nbsp;&nbsp;${textTotalRecords}`;
    } else {
      pageInfoStr = `${count_of_all_page}${textPage}&nbsp&nbsp&nbsp&nbsp${textTotalRecords}`;
    }
    page_str_ += `<td style="color:${status_font_color_};">${pageInfoStr}</td> </tr></table>`;

    element_span_pagination_id.innerHTML = page_str_;

    // 加入換頁事件
    const prev_sector = element_span_pagination_id.querySelector(
      ".tablepage_prev_sector",
    );
    if (prev_sector !== null) {
      prev_sector.onclick = function () {
        console.log("PrevPage");
        page_index_ -= sector_count_;
        if (page_index_ < 1) {
          page_index_ = 1;
        }
        change_page_content();
      };
    }

    const next_sector = element_span_pagination_id.querySelector(
      ".tablepage_next_sector",
    );
    if (next_sector !== null) {
      next_sector.onclick = function () {
        console.log("NextPage");
        if (
          page_index_ + sector_count_ <=
          Math.ceil(row_count_ / count_of_page)
        ) {
          page_index_ += sector_count_;
        }
        change_page_content();
      };
    }

    const pageTables =
      element_span_pagination_id.querySelectorAll("table table");
    pageTables.forEach((table) => {
      table.addEventListener("click", function () {
        curr_index_ = parseInt(this.getAttribute("data-page"));
        if (curr_index_ > 0) {
          const obj_element_span_pagination_id = element_span_pagination_id.id;
          s_page_index.set(obj_element_span_pagination_id, curr_index_);
          change_page_content();
        }
      });
    });

    // [防禦性設計] 將外部回呼移至最後，並加入 try...catch 避免破壞分頁元件自身邏輯
    if (row_count_ > 0 && typeof func_select_page === "function") {
      try {
        func_select_page((curr_index_ - 1) * count_of_page, count_of_page);
      } catch (e) {
        console.error("[tablepage] External callback error:", e);
      }
    }
  }
}

function tablepage_s(
  element_table_grid_id,
  element_span_pagination_id,
  count_of_page,
  page_flag,
) {
  let page_index_ = 1;
  let curr_index_ = 1;
  let page_str_ = "";
  let row_count_ = 0;
  const source_ = element_table_grid_id;
  const no_sel_color_ = "#CCCCCC";
  const sel_color_ = "black";
  const page_font_color_ = "white";

  change_page_content();

  function change_page_content() {
    if (page_flag === true) {
      const abc = document.querySelectorAll(
        "#prd_list-span-show_element_span_pagination_id table table",
      );
      abc.forEach((obj, i) => {
        console.log(i, obj.style.backgroundColor);
        if (obj.style.backgroundColor === "black") {
          curr_index_ = i + 1;
        }
      });
    }
    page_flag = false;

    // 取得資料筆數
    row_count_ = source_.querySelectorAll("tr").length - 1;

    // 顯示頁碼
    page_str_ = "<table><tr><td style='height:30px;'><b>第</b></td>";

    page_index_ = 1;

    for (let i = 1; i <= row_count_; i += count_of_page) {
      if (curr_index_ === page_index_) {
        page_str_ += `<td valign='top'><table data-page='${page_index_}' style='width:20px;height:20px;cursor:pointer;color:${page_font_color_};border-collapse:collapse;border-style:solid;border-width:1px;border-color:${sel_color_};background-color:${sel_color_}'><tr><th>${page_index_++}</th></tr></table></td>`;
      } else {
        page_str_ += `<td valign='top'><table data-page='${page_index_}' style='width:20px;height:20px;cursor:pointer;color:${page_font_color_};border-collapse:collapse;border-style:solid;border-width:1px;border-color:${no_sel_color_};background-color:${no_sel_color_}'><tr><th>${page_index_++}</th></tr></table></td>`;
      }
    }

    page_str_ += `<td><b>頁</b></td> <td>共${row_count_}筆</td> </tr></table>`;

    element_span_pagination_id.innerHTML = page_str_;

    page_index_ = 1;

    // 過濾表格內容
    const rows = source_.querySelectorAll("tr");
    rows.forEach((row, index) => {
      if (
        page_index_ <= (curr_index_ - 1) * count_of_page + 1 ||
        page_index_ > curr_index_ * count_of_page + 1
      ) {
        row.style.display = "none";
      } else {
        row.style.display = "";
      }
      page_index_++;
    });

    rows[0].style.display = ""; // head 一定要顯示

    // 加入換頁事件
    const pageTables =
      element_span_pagination_id.querySelectorAll("table table");
    pageTables.forEach((table) => {
      table.addEventListener("click", function () {
        curr_index_ = parseInt(this.getAttribute("data-page"));
        if (curr_index_ > 0) {
          change_page_content();
        }
      });
    });
  }
}

// 使用範例
/*

<!DOCTYPE html>
<html>
<head>
    <title>動態分頁範例</title>
</head>
<body>
    <table id="myTable">
        <thead>
            <tr>
                <th>欄位1</th>
                <th>欄位2</th>
                <th>欄位3</th>
            </tr>
        </thead>
        <tbody>
            </tbody>
    </table>
    <div id="element_span_pagination_id"></div>

    <script>
        const table = document.getelement_table_grid_idById('myTable');
        const element_span_pagination_id = document.getelement_table_grid_idById('element_span_pagination_id');
        const data = []; // 模擬資料

        // 產生模擬資料
        for (let i = 1; i <= 100; i++) {
            data.push({ col1: `資料 ${i}-1`, col2: `資料 ${i}-2`, col3: `資料 ${i}-3` });
        }

        function displayPage(offset, count) {
            const tbody = table.querySelector('tbody');
            tbody.innerHTML = ''; // 清空表格內容

            for (let i = offset; i < offset + count && i < data.length; i++) {
                const row = document.createelement_table_grid_id('tr');
                row.innerHTML = `<td>${data[i].col1}</td><td>${data[i].col2}</td><td>${data[i].col3}</td>`;
                tbody.appendChild(row);
            }
        }

        tablepage_d(table, element_span_pagination_id, 10, data.length, displayPage);
    </script>
</body>
</html>
*/

/*
// 一次性載入後 在隱藏欄位
// 用在資料較少的狀況
( function ( $ )
{

    $.fn.tablepage_s = function ( element_span_pagination_id, count_of_page, page_flag )
    {
        var page_index_ = 1;
        var curr_index_ = 1;
        var page_str_ = "";
        var row_count_ = 0;
        var source_ = $( this );
        var no_sel_color_ = "#CCCCCC";
        var sel_color_ = "black";
        var page_font_color_ = "white";

        change_page_content();

        function change_page_content()
        {
            if (page_flag == true)
            {
                var abc = $('#prd_list-span-show_element_span_pagination_id table table')
                abc.each(function (i, obj) {
                    console.log(i, obj.style.backgroundColor)
                    if (obj.style.backgroundColor == 'black')
                    {
                        curr_index_ = i + 1;
                    }
                })
            }
            page_flag = false;
            //取得資料筆數
            row_count_ = source_.children().children().length - 1;

            //顯示頁碼
            page_str_ = "<table><tr><td style='height:30px;'><b>第</b></td>";

            page_index_ = 1;

            for ( var i = 1; i <= row_count_; i += count_of_page )
            {
                if ( curr_index_ == page_index_ )
                {
                    page_str_ += "<td valign='top'><table style='width:20px;height:20px;cursor:pointer;color:" + page_font_color_ + ";border-collapse:collapse;border-style:solid;border-width:1px;border-color:" + sel_color_ + ";background-color:" + sel_color_ + "'><tr><th>" + ( page_index_++ ) + "</th></tr></table></td>";
                }
                else
                {
                    page_str_ += "<td valign='top'><table style='width:20px;height:20px;cursor:pointer;color:" + page_font_color_ + ";border-collapse:collapse;border-style:solid;border-width:1px;border-color:" + no_sel_color_ + ";background-color:" + no_sel_color_ + "'><tr><th>" + ( page_index_++ ) + "</th></tr></table></td>";
                }
            }

            page_str_ += "<td><b>頁</b></td>  <td>共" + row_count_ + "筆</td>  </tr></table>";

            element_span_pagination_id.html( page_str_ );

            page_index_ = 1;

            //過濾表格內容
            source_.children().children( "tr" ).each( function ()
            {

                if ( page_index_ <= ( ( ( curr_index_ - 1 ) * count_of_page ) + 1 ) || page_index_ > ( ( curr_index_ * count_of_page ) + 1 ) )
                {
                    $( this ).hide();
                }
                else
                {
                    $( this ).show();
                }

                page_index_++;
            } );

            source_.children().children( "tr" ).first().show(); //head一定要顯示

            //加入換頁事件
            element_span_pagination_id.children().children().children().children().each( function ()
            {

                $( this ).click( function ()
                {

                    curr_index_ = $( this ).find( "tr" ).text();

                    if ( curr_index_ > 0 )
                    {
                        change_page_content();
                    }
                } );
            } );
        }
    };
} )( jQuery );


// 動態要求 取得欄位
// 用在資料多的狀況 一次取出會花很多時間
var s_page_index = new Map();
(function ($) {

    // @01 要顯示選頁的地方 <span id='XXXXXXXXXXXX'></span>
    // @02 一頁有幾筆資料
    // @03 一共有幾筆資料
    // @04 當點擊 某一頁後 取的的內容
    //                       func( 目前選擇到的offset,　要取出的筆數)
    //                       傳回總比數
    $.fn.tablepage_d = function (element_span_pagination_id, count_of_page, row_count, func_select_page) {
        var page_index_ = 1;
        var curr_index_ = 1;       // 目前指向的頁數
        //var m_FirstIndex = 1;   //  區段第一頁的第一筆資料
        var sector_count_ = 10;   //  一次顯示10頁
        var page_str_ = "";
        var row_count_ = row_count;
        var source_ = $(this);
        var no_sel_color_ = "#CCCCCC";
        var sel_color_ = "black";
        var page_font_color_ = "white";

        change_page_content();

        function change_page_content() {
            //取得資料筆數
            //row_count_ = source_.children().children().length - 1;
            // 傳入要取出的資料 offset and count'
            var obj_element_span_pagination_id = element_span_pagination_id.attr('id');
            if (s_page_index.get(obj_element_span_pagination_id) != undefined) {
                curr_index_ = s_page_index.get(obj_element_span_pagination_id);
                //page_index_ = Math.ceil( row_count / count_of_page );
            }

            //顯示頁碼
            page_str_ = "<table><tr>";

            if (row_count_ > 0) {
                if (page_index_ > 1) {
                    //前10頁
                    page_str_ += "<td id='tablepage_prev_sector' style='width:20px;height:20px;cursor:pointer'>&lt</td>";
                }
                else {
                    page_str_ += "<td style='width:20px;height:20px;'></td>";
                }

                page_str_ += "<td>&nbsp</td>";

                var page_counter = sector_count_ * count_of_page; // 一次會可以預顯的資料數
                //page_index_ = 1;
                var curr_page = page_index_;
                page_str_ += "<td style='height:30px;'><b>第</b></td>";
                for (var i = ((page_index_ - 1) * count_of_page); i <= row_count_; i += count_of_page) {
                    // 最多只畫10頁
                    if (page_counter <= 0) {
                        // 之後還有資料
                        break;
                    }
                    page_counter -= count_of_page;

                    if (curr_index_ == curr_page) {
                        page_str_ += "<td valign='top'><table style='width:20px;height:20px;cursor:pointer;color:" + page_font_color_ + ";border-collapse:collapse;border-style:solid;border-width:1px;border-color:" + sel_color_ + ";background-color:" + sel_color_ + "'><tr><th>" + (curr_page++) + "</th></tr></table></td>";
                    }
                    else {
                        page_str_ += "<td valign='top'><table style='width:20px;height:20px;cursor:pointer;color:" + page_font_color_ + ";border-collapse:collapse;border-style:solid;border-width:1px;border-color:" + no_sel_color_ + ";background-color:" + no_sel_color_ + "'><tr><th>" + (curr_page++) + "</th></tr></table></td>";
                    }
                }

                page_str_ += "<td><b>頁</b></td>";
                page_str_ += "<td>&nbsp</td >";

                // 判斷還有沒有下10頁
                if (page_counter <= 0) {
                    page_str_ += "<td id='tablepage_next_sector' style='width:20px;height:20px;cursor:pointer'>&gt</td>";
                }
                else {
                    page_str_ += "<td style='width:20px;height:20px'></td>";
                }
                page_str_ += "<td>&nbsp</td>";
            }
            page_str_ += "<td>共" + row_count_ + "筆</td>  </tr></table>";

            element_span_pagination_id.html(page_str_);

            //page_index_ = 1;

            if (row_count_ > 0) {
                func_select_page(((curr_index_ - 1) * count_of_page), count_of_page);
            }

            //過濾表格內容
            //source_.children().children("tr").each( function () {
            //
            //	if (page_index_ <= (((curr_index_ - 1) * count_of_page) + 1) || page_index_ > ((curr_index_ * count_of_page) + 1))
            //	{
            //		$(this).hide();
            //	}
            //	else
            //	{
            //		$(this).show();	
            //	}
            //	
            //	page_index_++;
            //});			
            //source_.children().children("tr").first().show(); //head一定要顯示

            //加入換頁事件
            var prev_sector = document.getelement_table_grid_idById('tablepage_prev_sector');
            if (prev_sector != null) {
                prev_sector.onclick = function () {
                    console.log('PrevPage');
                    page_index_ -= sector_count_;
                    if (page_index_ < 1) {
                        page_index_ = 1;
                    }
                    //m_FirstIndex -= (sector_count_ * count_of_page); // 往前移Ｎ頁;
                    //if (m_FirstIndex < 1)
                    //{
                    //    m_FirstIndex = 1;
                    //}                        
                    change_page_content();
                };
            }

            var next_sector = document.getelement_table_grid_idById('tablepage_next_sector');
            if (next_sector != null) {
                next_sector.onclick = function () {
                    console.log('NextPage');
                    if ((page_index_ + sector_count_) <= Math.ceil(row_count_ / count_of_page)) {
                        page_index_ += sector_count_;
                    }
                    change_page_content();
                };
            }
            //table >> tr >>   td >>     table >>  tr
            element_span_pagination_id.children().children().children().children().each
                (
                    function () {
                        $(this).click
                            (
                                function () {
                                    curr_index_ = $(this).find("tr").text();
                                    if (curr_index_ > 0) {
                                        var obj_element_span_pagination_id = element_span_pagination_id.attr('id');
                                        s_page_index.set(obj_element_span_pagination_id, curr_index_);

                                        change_page_content();
                                    }
                                }
                            );
                    }
                );
        }
    };
})(jQuery);


*/
