/**
 *
 * @authors 陈小雪 (shell_chen@yeah.net)
 * @date    2016-01-13 17:48:43
 * @version $Id$
 */

 var CHECK_CLASS = "btn-success";




function showChart(datas){

    function getPlotBandsDatas(seriesDatas){
        var plotBands_from = 999999,
            plotBands_to = -999999;

        $.each(seriesDatas, function(index, seriesData){
            var data = seriesData.data,
                from = data[0][0],
                to = data[data.length - 1][0];
            if(from < plotBands_from){
                plotBands_from = from;
            }
            if(to > plotBands_to){
                plotBands_to = to;
            }
        });
        return {
            from: plotBands_from,
            to: plotBands_to
        }

    }

    function createDetail(masterChart) {
        // prepare the detail chart
        var detailSeries = [];

        $.each(masterChart.series, function(index, series){
            var detailStart = datas[index].data[0][0],
                detailData = [],
                seriesDatas = series.data,
                count = 0;

            for(var j=0; j<seriesDatas.length; j++){
                var data = seriesDatas[j];
                if(data.x >= detailStart ){
                    detailData.push([data.x, data.y]);
                    count++;
                }
                if(count >= 60) break;
            }

            detailSeries.push({
                name : series.name,
                data: detailData,
            });
        });

        detailChart = $('#detail-container').highcharts({
            chart: {
                reflow: false,
                // marginLeft: 50,
                // marginRight: 20,
                zoomType:"x",
            },
            credits: {
                enabled: false
            },
            title: {
                align:"center",
                text: "Tcptrace"
            },
            yAxis:[{
                title: {
                    text: "数量",
                },
                min: 0,
            }],
            xAxis:[{
                title: {
                    text: "时间(s)",
                    align: "high",
                }
            }],
            tooltip: {
                formatter: function () {
                    var point = this.points[0];
                    return '<b>' + point.series.name + '</b><br/>' +this.x + ':<br/>' + Highcharts.numberFormat(point.y, 2);
                },
                shared: true
            },
            legend: {
                enabled: false
            },
            plotOptions: {
                series: {
                    marker: {
                        radius: 1,
                        enabled: true,
                        lineWidth : 2,
                        fillColor: "blue",
                        lineColor: null,
                        states: {
                            hover: {
                                enabled: true,
                                radius: 3
                            }
                        }
                    }
                }
            },
            exporting: {
                enabled: false
            },
            series: detailSeries,
        }).highcharts();
    }

    function createMaster() {
        plotBandsData = getPlotBandsDatas(datas);

        $('#master-container').highcharts({
            chart: {
                type: "line",
                height:"200",
                reflow: false,
                borderWidth: 0,
                backgroundColor: null,
                marginLeft: 50,
                marginRight: 20,
                zoomType: 'x',
                events: {
                    selection: function (event) {
                        var extremesObject = event.xAxis[0],
                            min = extremesObject.min,
                            max = extremesObject.max,
                            detailSeries = [],
                            xAxis = this.xAxis[0];

                        // reverse engineer the last part of the data
                        $.each(this.series, function(index, series){
                            var detailData = [],
                                seriesDatas = series.data;

                            $.each(seriesDatas, function(j, data){
                                if(data.x > min && data.x < max){
                                    detailData.push([data.x, data.y]);
                                }
                            });
                            detailSeries.push({
                                name : series.name,
                                data: detailData,
                            });
                        });

                        // move the plot bands to reflect the new detail span
                        xAxis.removePlotBand('mask-before');
                        xAxis.addPlotBand({
                            id: 'mask-before',
                            from: plotBandsData.from,
                            to: min,
                            color: 'rgba(0, 0, 0, 0.2)'
                        });

                        xAxis.removePlotBand('mask-after');
                        xAxis.addPlotBand({
                            id: 'mask-after',
                            from: max,
                            to: plotBandsData.to,
                            color: 'rgba(0, 0, 0, 0.2)'
                        });

                        $.each(detailChart.series,  function(index, series){
                            detailChart.series[index].setData(detailSeries[index].data);
                        });

                        return false;
                    }
                }
            },
            title: {
                text: null
            },
            xAxis: {
                showLastTickLabel: true,
                plotBands: [{
                    id: 'mask-before',
                    from: plotBandsData.from,
                    to: plotBandsData.to,
                    color: 'rgba(0, 0, 0, 0.2)'
                }],
                title: {
                    text: null,
                }
            },
            yAxis: {
                gridLineWidth: 0,
                labels: {
                    enabled: false
                },
                title: {
                    text: null
                },
                min: 0.6,
                showFirstLabel: false
            },
            tooltip: {
               shared: true,
            },
            legend: {
                align: 'center',
                verticalAlign: 'bottom',
                enabled: true,
                x:0,
                y:0,

            },
            credits: {
                enabled: false
            },
            plotOptions: {
                series: {
                    lineWidth: 1,
                    marker: {
                        enabled: false
                    },
                    shadow: false,
                    states: {
                        hover: {
                            lineWidth: 1
                        }
                    },
                    enableMouseTracking: false
                }
            },
            exporting: {
                enabled: false
            },
            series: datas,

        }, function (masterChart) {
            createDetail(masterChart);
        }).highcharts();
    }

    createMaster();
}

(function($){
    $.fn.TcptraceStockCharts = function (options) {
        var defaluts = {
            type : "line",
        };
        var settings = $.extend(true, defaluts, options);

        return this.each(function(){
            $(this).highcharts('StockChart', {
                chart:{
                    height: $(window).height() - 50,
                    zoomType: 'xy',
                },
                rangeSelector : {
                    selected : 1,
                    buttons: [{
                        type: 'millisecond',
                        count: 1000*5,
                        text: '1s'
                    }, {
                        type: 'all',
                        text: 'All'
                    }],
                    inputEnabled:false,
                },
                legend: {
                    align: 'center',
                    verticalAlign: 'bottom',
                    enabled: true,
                    x:0,
                    y:0,
                },
                title : {
                    text : settings.title,
                },
                credits: {
                    enabled: false
                },
                yAxis:{
                    labels:{
                        align: "right",
                    },
                    title:{
                        text: 'SEQ'
                    },
                    opposite: false,
                    crosshair: {
                        color: "#a0a0a0",
                        width:2
                    },
                },
                xAxis:{
                    title: {
                        text: "时间(s)",
                        align: "high",
                    },
                    //tickInterval: 100,
                    // tickPixelInterval: 1000,
                    range: 10*1000,
                    ordinal: false,
                    labels: {
                        formatter: function(){
                            return this.value/1000;
                        },
                        step: 5
                    }
                },
                plotOptions: {
                    series: {
                        lineWidth : 1,
                        marker: {
                            radius: 2,
                            enabled: true,
                            lineWidth : 2,
                            fillColor: "blue",
                            lineColor: null,
                        },
                    },
                },
                tooltip: {
                    shared: true,
                    crosshairs: false,
                },
                series : settings.series,
            });
        });
    }

})(jQuery);


(function($){
    $.fn.TcptraceCharts = function(options){
        var defaluts = {
            type:"line",
        };

        var settings = $.extend(true, defaluts, options);

        return this.each(function(){
            var $this = $(this),
                detail_obj = $this.find("#detail-container");
                master_obj = $this.find("#master-container");

            $this.highcharts({
                chart:{
                    height: $(window).height() - 100,
                    zoomType: 'xy',
                    panning: true,
                },
                title: {
                    align:"center",
                    text: settings.title,
                },
                yAxis:[{
                    title: {
                        text: "SEQ",
                    },
                    min: 0,
                }],
                xAxis:[{
                    title: {
                        text: "时间(s)",
                        align: "high",
                    }
                }],
                credits: {
                    enabled: false
                },
                tooltip: {
                    shared: true,
                },
                plotOptions: {
                    series: {
                        lineWidth : 1,
                        marker: {
                            radius: 1,
                            enabled: true,
                            lineWidth : 2,
                            fillColor: "blue",
                            lineColor: null,
                        },
                    },
                },
                series: settings.series,
            });
        });
    }
})(jQuery);


/*
 * s_to_c: from server to client
*/

function get_json_data(filename, s_to_c, call_fun){
    var seq_flag = '>'; // client
    if (s_to_c)
        seq_flag = '<';

    $.getJSON("store/"+ filename, function(info){
        var tuple = info.tuple;
        var datas = info.trace;

        var data_seq = [],
            data_ack = [],
            data_sack = [],
            data_win = [];

        for(var i=0; i<datas.length; i++){
            var data = datas[i],
                flag = data[0],
                time = data[1] * 1000,
                seq = data[2],
                ack = data[3],
                win = data[4],
                sack = data[5] || [],
                length = data[6] || 0;

            if(flag == seq_flag){
                data_seq.push([time, seq]);
            }
            else{
                data_ack.push([time, ack]);
                data_win.push([time, win]);
                if (sack.length > 0)
                {
                    for (var ii = 0; ii < sack.length; ii++)
                    {
                        data_sack.push([time, sack[ii][0]]);
                        data_sack.push([time, sack[ii][1]]);
                        data_sack.push([time, null]);
                    }
                }
            }
        };

        var series = [
            { name: filename + "-seq",  data: data_seq,   },
            { name: filename + "-ack",  data: data_ack, step: true  },
            { name: filename + "-win",  data: data_win, /*  visible: false */},
            { name: filename + "-sack", data: data_sack,
                        marker: {
                            enabled: false,
                        },
            },
        ];

        var from, to;
        if (s_to_c)
        {
            from = tuple[2] + ':' + tuple[3];
            to   = tuple[0] + ':' + tuple[1];
        }
        else
        {
            from = tuple[0] + ':' + tuple[1];
            to   = tuple[2] + ':' + tuple[3];
        }
        call_fun(from + '-->' + to, series);
    }).error(function(obj, status){
        alert("Down Load Error!!");
    });
}

function redirect_drawing()
{
    var names = get_names();
    names = names.join(',');
    window.location.href = "charts.html?file=" + names;
}

function getUrlParams() {
    var result = {};
    var params = (window.location.search.split('?')[1] || '').split('&');
    for(var param in params) {
        if (params.hasOwnProperty(param)) {
            paramParts = params[param].split('=');
            result[paramParts[0]] = decodeURIComponent(paramParts[1] || "");
        }
    }
    return result;
}

function Drawing(names){
    var serieses = [],
        length = names.length;

    if(length == 0){
        alert("请选择文件");
        return;
    }

    for(var i=0; i<length; i++){
        var name = names[i];
        get_json_data(name, true,
            function(title, series){
                serieses = serieses.concat(series);
                if(serieses.length == names.length * series.length){
                    $("#charts").TcptraceStockCharts({
                        series: serieses,
                        title: title,
                    });
                }
            }
        );
    }
}


function get_names(){
   var names = [],
       objs = $("#filenames input." + CHECK_CLASS);

   for(var i=0; i<objs.length; i++){
       var name = $(objs[i]).val();
       if(name){
           names.push(name);
       }
   }
   return names;
}

function LoadHTMLDoc(url){
    $.ajax({
        url: url,
        dataType: "html",
        error:function(xmlhttp, error, event){
            alert(error);
            console.log(xmlhttp);
        },
        success:function(data){
            ParseHTMLDoc(data);
        }
    });
}

function ParseHTMLDoc(data){
    var doms = $.parseHTML(data)[5],
        links = $(doms).find("a"),
        names = [];

    for(var i=0; i< links.length; i++){
        var link = $(links[i]),
            href = link.attr("href");
        if(href && href != "../"){
            names.push(href);
        }
    }

    var mode_col = $("#mode").find(".col-md-file");
    var filenames_obj = $("#filenames");

    for(var i=0; i<names.length; i++){
        var name = names[i],
            col_obj = mode_col.clone(),
            mode_btn = col_obj.find("input");
        $(mode_btn).attr("value", name);
        filenames_obj.append(col_obj);
    }
}


function checkbtn(obj){
    if($(obj).hasClass(CHECK_CLASS)){
        $(obj).removeClass(CHECK_CLASS);
    }
    else{
        $(obj).addClass(CHECK_CLASS);
    }

    var names = get_names();
    var names_str = names.join(", ");
    $("span.select-filenames").html(names_str);
}

