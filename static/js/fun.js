/**
 *
 * @authors 陈小雪 (shell_chen@yeah.net)
 * @date    2016-01-13 17:48:43
 * @version $Id$
 */

 var CHECK_CLASS = "btn-success";

(function($){
    $.fn.TcptraceCharts = function(options){
        var defaluts = {
            type:"line"
        };

        var settings = $.extend(true, defaluts, options);

        return this.each(function(){
            var $this = $(this);
            $this.highcharts({
                chart:{
                    height: $(window).height() - 100,
                    zoomType: 'x',
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
                credits: {
                    enabled: false
                },
                tooltip: {
                    shared: true,
                },
                plotOptions: {
                    series: {
                        marker: {
                            radius: 2,
                            enabled:true,
                        },
                    },
                },
                series: settings.series,
            });
        });
    }
})(jQuery);


/*
flag time seq ack win
flag 为 > 的使用 time—ack,  time—-win 做两个图
flag 为 < 的使用 time—seq
*/

function get_json_data(filename, call_fun){
    $.getJSON("store/"+ filename, function(datas){
        var data_seq = [],
            data_ack = [],
            data_win = [];
        for(var i=0; i<datas.length; i++){
            var data = datas[i],
                flag = data[0],
                time = data[1],
                seq = data[2],
                ack = data[3],
                win = data[4];

            if(flag == "<"){
                data_seq.push([time, seq]);
            }
            else if(flag == ">"){
                data_ack.push([time, ack]);
                data_win.push([time, win]);
            }
        };

        var series = [{
            name: filename+ "-seq",
            data: data_seq,
        },{
            name: filename+"-ack",
            data: data_ack,
        },{
            name: filename+"-win",
            data: data_win,
        }];

        call_fun(series);
    }).error(function(obj, status){
        alert("Down Load Error!!");
    });
}


function Drawing(){
    var names = get_names(),
        serieses = [],
        length = names.length;

    if(length == 0){
        alert("请选择文件");
        return;
    }
    for(var i=0; i<length; i++){
        var name = names[i];
        get_json_data(name, function(series){
            serieses = serieses.concat(series);
            if(serieses.length == names.length * 3){
                $("#charts").TcptraceCharts({
                    series: serieses,
                });
            }
        });
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

    var mode_btn = $("#mode").find("input");
    var filenames_obj = $("#filenames");

    for(var i=0; i<names.length; i++){
        var name = names[i],
            btn = mode_btn.clone();
        $(btn).attr("value", name);
        filenames_obj.append(btn);
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

