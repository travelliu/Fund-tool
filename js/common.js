var API_URL = 'https://fund.pescms.com';

/**
 * 验证是否为数字
 * @param n
 * @returns {boolean}
 */
function isNumeric(n) {

    return !isNaN(parseFloat(n)) && isFinite(n);
}

/**
 * 用于判断空，Undefined String Array Object
 */
function isBlank(str) {
    if (Object.prototype.toString.call(str) === '[object Undefined]') {//空
        return true
    } else if (
        Object.prototype.toString.call(str) === '[object String]' ||
        Object.prototype.toString.call(str) === '[object Array]') { //字条串或数组
        return str.length == 0 ? true : false
    } else if (Object.prototype.toString.call(str) === '[object Object]') {
        return JSON.stringify(str) == '{}' ? true : false
    } else {
        return true
    }

}

/**
 * 封装简易的AJAX请求函数
 * @param param
 * @param callback
 */
var $ajax = function(param, callback){
    var obj = {url: '', data: {'': ''}, type: 'POST', dataType: 'JSON', dialog: true};
    $.extend(obj, param);
    var d = dialog({title: '系统提示', zIndex: '9999999'});


    var data = new FormData();
    for(var i in obj.data){
        data.append(i, obj.data[i]);
    }
    var xhr = new XMLHttpRequest();
    xhr.open(obj.type, obj.url);
    xhr.setRequestHeader("Access-Control-Allow-Origin", '*');
    // xhr.setRequestHeader("Access-Control-Allow-Headers", "X-Requested-With");
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            switch (xhr.status){
                case 200:
                    if(obj.dataType == 'JSON'){
                        var data = JSON.parse(xhr.responseText);

                        if (obj.dialog == true) {
                            d.content(data.msg).showModal();
                            setTimeout(function () {
                                d.close();
                            }, 3000);
                        }
                    }else{
                        var data = xhr.responseText;
                    }
                    callback(data, d);
                    break;
                case 404:
                case 500:
                    try{
                        var data = JSON.parse(xhr.responseText);
                        var msg = data.msg;
                    }catch (e){
                        var msg = '系统请求出错,请刷新页面再试';
                    }
                    d.content(msg).showModal();
                    setTimeout(function () {
                        d.close();
                    }, 3000);
                    break;
            }
        }
    }
    console.log(data)
    // xhr.setRequestHeader("x-requested-with", 'XMLHttpRequest');
    xhr.setRequestHeader("accept", 'application/json');
    xhr.send(data);


}

/**
 * 弹窗提醒
 * @param msg 提示信息
 * @private
 */
var _alert = function (msg) {
    var d = dialog({
        title : 'Tips',
        content : msg,
        id : '_alert'
    });
    d.showModal();
    setTimeout(function(){
        d.close().remove();
    }, 1500)

}

/**
 * 实时更新基金
 */
var refreshFund = function (user) {
    var time = moment().format('H');

    if( (parseInt(time) < 8 || parseInt(time) > 17) && user == false ){
        return false;
    }

    var xhr = [];
    for(var key in localStorage) {
        if (isNumeric(key)) {
            (function(key){
                xhr[key] = new XMLHttpRequest();
                xhr[key].open("GET", 'http://fundgz.1234567.com.cn/js/'+key+'.js?rt='+Date.parse(new Date()), true);
                xhr[key].onreadystatechange = function() {
                    if (xhr[key].readyState == 4) {
                        var result = xhr[key].responseText;
                        if(result){
                            //将JSONP格式手动解析为JSON字符串
                            try{
                                var fund = JSON.parse(result.match(/[a-z]+\((.*)\)/)[1]);
                                if(fund){
                                    //查找本地存储的基金数据
                                    var record = JSON.parse(localStorage.getItem(fund['fundcode']))
                                    if(record){
                                        //组装并更新对应基金的实时估算值
                                        record['now'] = fund['gsz'];
                                        record['nowzl'] = fund['gszzl'];
                                        record['gztime'] = fund['gztime'];
                                        record['name'] = fund['name'];
                                        localStorage.setItem(fund['fundcode'], JSON.stringify(record));
                                    }
                                }
                            }catch (err){
                                //查找本地存储的基金数据
                                console.log('获取'+key+' 基金失败');
                            }
                        }
                    }

                }
                xhr[key].send();
            })(key)

        }
    }
}

/**
 * 更新单位净值
 * @param user
 * @returns {boolean}
 */
var refreshJingzhi = function (user) {
    var time = moment().format('H');

    if( (parseInt(time) > 9 && parseInt(time) < 19) && user == false ){
        return false;
    }

    var xhr = [];
    for(var key in localStorage) {
        if (isNumeric(key)) {
            (function(key){
                xhr[key] = new XMLHttpRequest();
                xhr[key].open("GET", 'http://fund.eastmoney.com/f10/F10DataApi.aspx?type=lsjz&code='+key+'&page=1&per=1&sdate=&edate=&rt='+Date.parse(new Date()), true);
                xhr[key].onreadystatechange = function() {
                    if (xhr[key].readyState == 4) {
                        var result = xhr[key].responseText;
                        if(result){
                            //将JSONP格式手动解析为JSON字符串

                            try{
                                var result_match = result.match(/<tbody.*>.*?<\/tbody>/);
                                if(result_match){
                                    var jingzhi = $(result_match[0]).find('.tor.bold').html();
                                    var jingzhi_time = $(result_match[0]).find('td').html();
                                    var record = JSON.parse(localStorage.getItem(key))
                                    if(!isBlank(jingzhi) && !isBlank(jingzhi_time) && !isBlank(record) ){
                                        if (record['jingzhi_time'] != jingzhi_time) {
                                            record['last_jingzhi'] = record['jingzhi']
                                        }
                                        record['jingzhi_time'] = jingzhi_time;
                                        record['jingzhi'] = jingzhi;
                                        localStorage.setItem(key, JSON.stringify(record));
                                    }
                                }
                            }catch (err){
                                console.log('获取'+key+' 基金单位净值失败');
                            }
                        }
                    }

                }
                xhr[key].send();
            })(key)

        }
    }
}

/**
 * 云备份
 * @param user 用户操作备份
 * @returns {boolean}
 */
var cloudBackUp = function (user) {
    var apikey = localStorage.getItem('apikey');
    // if(isBlank(apikey)){
    //     return true;
    // }

    var bak = {};

    for(var i in localStorage) {
        if (isNumeric(i)) {
            var content = localStorage.getItem(i);
            if (content != '') {
                bak[i] = JSON.parse( content );
            }
        }
    }

    var param = {
        url : getBackUrl(),
        data : {
            apikey : apikey,
            backup : JSON.stringify(bak)
        },
        dialog : user
    };

    $ajax(param, function (data) {
    })

}

/**
 * 云备份
 * @param user 用户操作备份
 * @returns {boolean}
 */
Date.prototype.Format = function (fmt) { // author: meizz
    var o = {
        "M+": this.getMonth() + 1, // 月份
        "d+": this.getDate(), // 日
        "h+": this.getHours(), // 小时
        "m+": this.getMinutes(), // 分
        "s+": this.getSeconds(), // 秒
        "q+": Math.floor((this.getMonth() + 3) / 3), // 季度
        "S": this.getMilliseconds() // 毫秒
    };
    if (/(y+)/.test(fmt))
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
            return fmt;
}

var getCurrentDate = function () {
    var now = new Date();
    var year = now.getFullYear(); //得到年份
    var month = now.getMonth() + 1;//得到月份
    var day = now.getDate();//
    if (month < 10) {
        month = "0" + month;
    }
    if (day < 10) {
        day = "0" + day;
    }
    var nowDate = year + "-" + month + "-" + day;
    return nowDate
}

var getCurrentTime = function () {
    var now = new Date();
    return now.Format("yyyy-MM-dd hh:mm:ss")
}

var getBackUrl = function() {
    var url = API_URL+'/Api/Backup/append/'+Math.random()
    var apiurl = localStorage.getItem('apiurl');
    if (apiurl != '') {
        url = apiurl
    }
    return url
}

var processPrice = function(record) {
    record['adding'] = (record['jingzhi'] * (1-record['addingPercent']/100)).toFixed(4)
    record['sell'] = (record['buy'] * (1+record['sellPercent']/100)).toFixed(4)
    // 如果上次净值为空这复制为当前最新
    if (typeof record['jingzhi'] === "undefined") {
        record['adding'] = (record['buy'] * (1-record['addingPercent']/100)).toFixed(4)
    }
    if (typeof record['last_jingzhi'] === "undefined") {
        record['last_jingzhi'] = record['jingzhi']
    }
    if (typeof record['now'] === "undefined") {
        record['now'] = ''
    }
    if (typeof record['nowzl'] === "undefined") {
        record['nowzl'] = ''
    }
    if (typeof record['gztime'] === "undefined") {
        record['gztime'] = ''
    }
    return record
}
function calcNewJingZhi(code,money) {
    console.log(code,money)
    var content = localStorage.getItem(code);
    if(content != '') {
        var json_str = JSON.parse(content);
        var totalMoney= json_str.buy * json_str.fene + money
        var totalFene = parseFloat(json_str.fene) + parseFloat(money)/parseFloat(json_str.jingzhi)
        var cost = parseFloat(totalMoney/totalFene).toFixed(4)
        console.log(code,money,totalMoney,totalFene,cost)
    }
}
function calcNewGuZhi(code,money) {

    var content = localStorage.getItem(code);
    if(content != '') {
        var json_str = JSON.parse(content);
        var totalMoney= json_str.buy * json_str.fene + money
        var totalFene = parseFloat(json_str.fene) + parseFloat(money)/parseFloat(json_str.now)
        var cost = parseFloat(totalMoney/totalFene).toFixed(4)
        console.log(code,money,json_str.now,totalMoney,totalFene,cost)
    }
}
