// 建立panel的列表
createPanel(document.getElementById("panelLeft"));

$(document).ready(function () {
    $("body > [data-role='panel']").enhanceWithin().panel();
    adjustPanelVertical();

    request_supplier();
});

$('#supplier_list-select-supplier_name').on(
    {
        "change": function () {
            // 重新繪製圖形
            $('#barChart').remove();
            $('#Contain').append('<canvas id="barChart"></canvas>');

            $('#pieChart').remove();
            $('#Contain1').append('<canvas id="pieChart"></canvas>');

            generate_bar_chart();
            generate_pie_chart();
            request_order_list();
        }
    }
);

/**
 *  根據廠商編號，自動帶入前6個月(包含本月)的銷售額度
 */
function generate_bar_chart() {
    var today = new Date();
    var fisrt_day_this_month = new Date(today.getFullYear(), today.getMonth(), 1);
    var five_month_ago = DateAdd("m", -5, fisrt_day_this_month);

    var month_labels = new Array();
    for (var i = -5; i <= 0; i++) {
        month_labels.push(DateMonthToString(DateAdd("m", i, new Date())));
    }

    var suppiler_uid = $("#supplier_list-select-supplier_name").val();
    Supplier_Request_Half_Year_Sales(suppiler_uid, DateToString(five_month_ago), DateToString(today),
        function (result) {
            var sales_data = result.records;

            var ctx = document.getElementById("barChart");
            ctx.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
            ctx.width = 400;
            ctx.height = 200;
            var barChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: month_labels,
                    datasets: [{
                        label: '売上',
                        data: sales_data,
                        backgroundColor: [
                            'rgba(153, 102, 255, 0.2)',
                            'rgba(153, 102, 255, 0.2)',
                            'rgba(153, 102, 255, 0.2)',
                            'rgba(153, 102, 255, 0.2)',
                            'rgba(153, 102, 255, 0.2)',
                            'rgba(153, 102, 255, 0.2)'
                        ],
                        borderColor: [
                            'rgba(153, 102, 255, 1)',
                            'rgba(153, 102, 255, 1)',
                            'rgba(153, 102, 255, 1)',
                            'rgba(153, 102, 255, 1)',
                            'rgba(153, 102, 255, 1)',
                            'rgba(153, 102, 255, 1)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    title: {
                        display: true,
                        text: '最近半年の売上'
                    },
                    tooltips: {
                        callbacks: {
                            label: function (tooltipItem, data) {
                                return data.datasets[0].label + ": " + tooltipItem.yLabel.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                            }
                        }
                    },
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero: true,
                                callback: function (value, index, values) {
                                    return value.toLocaleString();
                                }
                            },
                            scaleLabel: {
                                display: true,
                                labelString: '売上'
                            }
                        }],
                        xAxes: [{
                            ticks: {
                                beginAtZero: true
                            },
                            scaleLabel: {
                                display: true,
                                labelString: '期間'
                            }
                        }]
                    },
                    plugins: {
                        labels: {
                            render: function (args) {
                                return '';
                            }
                        }
                    }
                }
            });
        }
    );
}

/**
 *  根據廠商編號，預設自動帶入上個月前5名的regular round商品
 */
function generate_pie_chart() {
    var suppiler_uid = $("#supplier_list-select-supplier_name").val();

    var today = new Date();
    var fisrt_day_this_month = new Date(today.getFullYear(), today.getMonth(), 1);
    var last_month = DateAdd("m", -1, fisrt_day_this_month);

    Supplier_Request_Regular_Round_Stat(suppiler_uid, DateToString(last_month),
        function (result) {

            var regular_data = new Array();
            var regular_labels = new Array();
            for (var i = 0; i < result.length; i++) {
                regular_data.push(result[i].product_set_quantity);
                regular_labels.push(result[i].product_set_name + " 回合數: " + result[i].regular_round);
            }

            var pie = document.getElementById("pieChart");
            pie.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
            pie.width = 400;
            pie.height = 200;
            var pieChart = new Chart(pie, {
                type: 'pie',
                data: {
                    datasets: [{
                        data: regular_data,
                        backgroundColor: [
                            'rgb(255, 99, 132)',
                            'rgb(255, 159, 64)',
                            'rgb(255, 205, 86)',
                            'rgb(75, 192, 192)',
                            'rgb(54, 162, 235)'
                        ],
                        label: 'Dataset 1'
                    }],
                    labels: regular_labels
                },
                options: {
                    legend: {
                        position: 'right'
                    },
                    title: {
                        display: true,
                        text: '本月熱銷前5商品銷售比例'
                    },
                    tooltips: {
                        callbacks: {
                            label: function (tooltipItem, data) {
                                var dataset = data.datasets[tooltipItem.datasetIndex];
                                var meta = dataset._meta[Object.keys(dataset._meta)[0]];
                                var total = meta.total;
                                var currentValue = dataset.data[tooltipItem.index];
                                var percentage = parseFloat((currentValue / total * 100).toFixed(1));
                                return currentValue + ' (' + percentage + '%)';
                            },
                            title: function (tooltipItem, data) {
                                return data.labels[tooltipItem[0].index];
                            }
                        }
                    },
                    plugins: {
                        labels: {
                            precision: 1,
                            fontColor: '#fff',
                            fontSize: 16,
                        }
                    },
                    responsive: true
                }
            });
        }
    );
}

function request_order_list() {
    // 重置頁面
    var Table = document.getElementById("sales-report_table-show_order");
    Table.innerHTML = "";
    var thd = document.createElement('thead');
    thd.innerHTML =
        '<thead>\
                 <tr>\
                      <th style="width:5%">注文番号</th>\
                      <th style="width:8%">商品名</th>\
                      <th style="width:8%">購入日</th>\
                 </tr>\
        </thead >';
    Table.appendChild(thd);

    var supplier_uid = $("#supplier_list-select-supplier_name").val();
    var record_state = 0;

    var today = new Date();
    var fisrt_day_this_month = new Date(today.getFullYear(), today.getMonth(), 1);
    var last_month = DateAdd("m", -1, fisrt_day_this_month);

    var bdate_str = DateToString(last_month);
    var edate_str = DateToString(today);
    var whereClause = '';
    var page_count = 5;
    var orderby = " ORDER BY shipping_date DESC";

    Return_Request_Select_Count(
        supplier_uid,
        record_state,
        bdate_str,
        edate_str,
        whereClause,
        function (result) {
            $("#sales-report_table-show_order").tablepage_d(
                $(""),
                page_count,
                result.count,
                function (NowIndex, CountOfPage) {
                    // 動態 取得 分頁內的資料
                    Return_Request_Select_Order_All(
                        supplier_uid,
                        0,
                        bdate_str,
                        edate_str,
                        NowIndex,
                        CountOfPage,
                        '',
                        orderby,
                        function (result) {
                            if (check_errno(result.errno)) {
                                return;
                            }

                            var return_list = result;
                            if (return_list.length === 0) {
                                console.log("no result");
                            } else {
                                var show_result = new Array();
                                for (var i = 0; i < return_list.length; i++) {
                                    var show_data = new Array();
                                    show_data[0] = return_list[i].order_nid;
                                    show_data[1] = return_list[i].product_item_name;
                                    show_data[2] = return_list[i].shipping_date.substring(0, 10);

                                    show_result.push(show_data);
                                }

                                var tableobj = document.getElementById("sales-report_table-show_order");
                                create_Json2DArrayToTable(tableobj, show_result);
                            }
                        }
                    );
                });
        }
    );
}

function request_supplier() {
    var select_suppliers = document.getElementById("supplier_list-select-supplier_name");
    select_suppliers.innerHTML = "";

    Supplier_Request_Select_Show(
        function (result) {
            if (check_errno(result.errno)) {
                return;
            }

            var supplier_list = result.records;
            var select_suppliers = document.getElementById("supplier_list-select-supplier_name");
            for (var i = 0; i < supplier_list.length; i++) {
                var newoption = document.createElement("option");
                newoption.value = supplier_list[i].supplier_uid;
                newoption.text = supplier_list[i].supplier_alias;
                select_suppliers.add(newoption);
            }

            generate_bar_chart();
            generate_pie_chart();
            request_order_list();
        }
    );
}