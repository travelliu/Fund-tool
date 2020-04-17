

var _list = function(){

    var $_GET = {};

    document.location.search.replace(/\??(?:([^=]+)=([^&]*)&?)/g, function () {
        function decode(s) {
            return decodeURIComponent(s.split("+").join(" "));
        }

        $_GET[decode(arguments[1])] = decode(arguments[2]);
    });

    try {
        var preview = jQuery.parseJSON(localStorage.getItem('preview'))
    }catch (e){
        var preview = JSON.parse('{}');
    }

    var storage = $_GET['preview'] == 'true' ? preview : localStorage;


    // var storage_key = storage == null ? {} : Object.keys(storage).sort();
    // console.log(Object.keys(storage))
    var storage_key = storage == null ? {} : Object.keys(storage).sort();

    refreshFund(true);
    refreshJingzhi(true)

	$('.fund_list').remove();
    // 总估算
    var total_estimate = 0;
    var total_jingzhi = 0;
    // 持仓额
    var total_position = 0
    // 总金额
    var total_amount = 0
    // 总估算
    var total_yingkui = 0
    // 今估算
    var total_yingkui_today = 0

    // 今/昨收益
    var total_chiyou_today = 0
    // 持有合计
    var total_chiyou = 0

    var append_str = '';
    for(var i in storage_key){

        if(isNumeric(storage_key[i])){
            var content = $_GET['preview'] == 'true' ? JSON.stringify(storage[storage_key[i]]) : localStorage.getItem(storage_key[i]);

            if(content != ''){
                var json_str = JSON.parse( content );
                var json_str = processPrice(json_str)
                // 持有成本总金额
                total_position += json_str.buy*json_str.fene
                // 现在持有金额
                total_amount  += json_str.now*json_str.fene
            }
        }
    }
	for(var i in storage_key){

		if(isNumeric(storage_key[i])){
			var content = $_GET['preview'] == 'true' ? JSON.stringify(storage[storage_key[i]]) : localStorage.getItem(storage_key[i]);

			if(content != ''){
				var json_str = JSON.parse( content );
                var json_str = processPrice(json_str)
				var light = '';
                var light_now = '';
                var yingkui = 0
                var yingkui_today = 0
                var chiyou = 0
                var chiyou_today
                var chiyoushouyi_baifenbi = '-';
                var zuixin_baifenbi = '-';
                var amount = 0
                var position = 0

				//由于新版没有这个变量，需要手动判断是否为空
				var fene = isBlank(json_str.fene) ? '' : parseFloat(json_str.fene);
				var jingzhi = isBlank(json_str.jingzhi) ? '' : parseFloat(json_str.jingzhi);
				var jingzhi_time = isBlank(json_str.jingzhi_time) ? '' : '( '+json_str.jingzhi_time+' )';

                if(parseFloat(json_str.adding) >= parseFloat(json_str.now)){
                    light = 'am-success';
                }
                if (parseFloat(json_str.now) >= parseFloat(json_str.sell)) {
                    light = 'am-danger';
                }


				//盈亏估算 = 持有份额 * 最新价格 - 成本价 * 持有份额
				yingkui = fene == '' || isBlank(json_str.now) ? '-' : (fene * parseFloat(json_str.now) - json_str.buy * fene).toFixed(2) ;
                // yingkui_today = ((json_str.now-jingzhi) * fene).toFixed(2)
                yingkui_today = (json_str.nowzl / 100 * json_str.jingzhi * fene).toFixed(2)
                //持有收益 = 持有份额 * 单位净值 - 成本价 * 持有份额
				chiyou = fene == '' || jingzhi == '' ? '-' : (fene * parseFloat(jingzhi) - json_str.buy * fene).toFixed(2) ;
                chiyou_today = ((json_str.jingzhi-json_str.last_jingzhi) * fene).toFixed(2)


                chiyoushouyi_baifenbi = '持有: ' + (chiyou / (fene * json_str.buy) * 100 ).toFixed(2) + '%';
                zuixin_baifenbi = '实时: ' + (yingkui / (fene * json_str.buy) * 100 ).toFixed(2) + '%';

                var gztime1 = json_str.gztime.substring(0,10)
                var gztime = new Date(json_str.gztime).getTime()
                var nowTime = new Date().getTime()

                if ( (gztime1 == json_str.jingzhi_time) ) {
                     // zuixin_baifenbi = '实时: 0%'
                     zuixin_baifenbi = '今昨: ' + ((1-json_str.last_jingzhi/json_str.jingzhi)*100).toFixed(2) + '%';
                     yingkui = fene == '' || isBlank(json_str.now) ? '-' : (fene * parseFloat(jingzhi) - json_str.buy * fene).toFixed(2) ;
                     yingkui_today = 0
                }
                position = (json_str.buy*fene).toFixed(2) ;
                amount = (json_str.now*fene).toFixed(2) ;

                // 今估算
                total_yingkui += parseFloat(yingkui);
                total_yingkui_today += parseFloat(yingkui_today)

                total_chiyou += parseFloat(chiyou);
                total_chiyou_today += parseFloat(chiyou_today)                // total_chiyou += parseFloat(chiyou)

                var notice = isBlank(json_str.notice) ? '' : parseInt(json_str.notice);
                var notice_icon = '';
                switch(notice){
                    case 2:
                        notice_icon = 'am-icon-pause';
                        break;
                    case 4:
                        notice_icon = 'am-icon-line-chart';
                        break;
                    case 6:
                        notice_icon = 'am-icon-sort-amount-desc';
                        break;
                    default:
                        notice_icon = '';
                }
                if ( json_str.nowzl > 0 ){
                    light_now = 'am-danger';
                } else if ( json_str.nowzl < 0 ){
                    light_now = 'am-success';
                }

				append_str += '' +
					'<tr class="fund_list '+json_str.code+' '+light+' ">' +
					   '<td class="am-text-middle ">' +
                            '<span class="am-block">'+json_str.code+' <i class="view-fund am-icon-external-link" data="'+json_str.code+'"></i></span>'+
                            '<label class="am-checkbox-inline "><input name="notice[]" type="checkbox" value="'+json_str.code+'"> '+json_str.name+' <i class="'+notice_icon+'"></i> </label>' +
                        '</td>' +
						'<td class="am-text-middle"><input type="text" size="6" value="'+json_str.buy+'"  placeholder-text="购入价格"  name="buy" /></td>' +
						'<td class="am-text-middle">' +
                            ' - <input type="text" class="am-text-center" size="2" value="'+json_str.addingPercent+'"  placeholder-text="补仓价格" name="addingPercent" /> % ' +
                            // '<span class="am-block">'+json_str.adding+'</span>'+
                            // '<span class="am-block" style="border-bottom: 1px solid #c7c7c7">'+zuixin_baifenbi+'</span>'+
                            // '<span class="am-block">'+chiyoushouyi_baifenbi+'</span>'+
						'</td>' +
						'<td class="am-text-middle">' +
							'<input type="text" size="2" value="'+json_str.sellPercent+'"  placeholder-text="卖出价格" name="sellPercent" /> % ' +
                            // '<span class="am-block">'+json_str.sell+'</span>'+
						'</td>' +
                        // 份额
                        '<td class="am-text-middle">' +
                            '<input type="text" size="8" value="'+fene+'" placeholder-text="持有份额" name="fene" />' +
                        '</td>' +
                        // 最新估值
						'<td class="am-text-middle '+ light_now +'" title="最后更新时间: '+json_str.gztime+'">'+json_str.now+'<span class="am-block">'+json_str.nowzl+'%</span></td>' +
						// '<td class="am-text-middle">'+yingkui+'</td>' +
                        // 盈亏估算
                        '<td class="am-text-middle">' +
                            '<span class="am-block" style="border-bottom: 1px solid #c7c7c7">'+yingkui_today+'</span>'+
                            '<span class="am-block">'+yingkui+'</span>'+
                        '</td>' +
                        // 单位净值
						'<td class="am-text-middle am-show-lg-only">'+jingzhi+'<span class="am-text-xs am-block">'+jingzhi_time+'</span></td>' +
                        // 持有收益
						// '<td class="am-text-middle am-show-lg-only">'+yingkui_jingzhi+'</td>' +
                        '<td class="am-text-middle am-show-lg-only">' +
                            '<span class="am-block" style="border-bottom: 1px solid #c7c7c7">'+chiyou_today+'</span>'+
                            '<span class="am-block">'+chiyou+'</span>'+
                        '</td>' +
                        // 金额
                        '<td class="am-text-middle am-show-lg-only">' +
                            '<span class="am-block" style="border-bottom: 1px solid #c7c7c7">'+amount+'</span>'+
                            '<span class="am-block">'+position+'</span>'+
                        '</td>' +
                        '<td class="am-text-middle am-show-lg-only">'+parseFloat((position/total_position).toFixed(2)*100).toFixed(2)+'%</td>'+
                        // 收益比
						'<td class="am-text-middle am-show-lg-only">' +
                            '<span class="am-block" style="border-bottom: 1px solid #c7c7c7">'+zuixin_baifenbi+'</span>'+
                            '<span class="am-block">'+chiyoushouyi_baifenbi+'</span>'+
                        '</td>' +
						'<td class="am-text-middle">'+
                            '<div class="am-inline-block">' +
                                '<span class="am-btn am-btn-xs am-btn-primary" data="'+json_str.code+'">修改</span>' +
                                // '<span class="am-btn am-btn-xs am-btn-warning fund-analyze" data="'+json_str.code+'">分析</span>' +
                                '<span class="am-btn am-btn-xs am-btn-danger am-show-lg-only" data="'+json_str.code+'">删除</span>' +
                             '</div>'+
                        '</td>' +
                    '</tr>';
			}
		}
	}


    $('#add').after(append_str);
    $('.total_position').html(total_position.toFixed(2));
    $('.total_amount').html(total_amount.toFixed(2));
    $('.total_yingkui_today').html(total_yingkui_today.toFixed(2));
	$('.total_yingkui').html(total_yingkui.toFixed(2));
    $('.total_chiyou_today').html(total_chiyou_today.toFixed(2));
    $('.total_chiyou').html(total_chiyou.toFixed(2));

    $('.refresh_time').html("刷新时间:" + getCurrentTime());
    // $('.refreshTime').html(localStorage.getItem('refreshTime'));
    if($_GET['preview'] == 'true') {
        $('input').attr('disabled', 'disabled')
        $('.am-btn').remove();
        var table_str = $('table').clone();
        $('.am-padding').html(table_str);
        $('table').before('<p>备份ID: <strong>'+$_GET['restore']+'</strong></p>');
    }

}

var getRefreshTime = function(){
    // var input_content = $('#refreshTime input').serializeArray();
    // var value = input_content[0]['value'];
    return 5
    // return parseInt(value)
}

$(function() {
    refreshTime = getRefreshTime()

	//清空图表下方的数字提醒
    chrome.browserAction.setBadgeText({text: ""});

	//新增基金
	$('#add .am-btn-success').on('click', function(){
		var input_content = $('#add input').serializeArray();
		var item = {
			now : '',
            gztime : '',
            fene : '',
            name:''
		}
		for(var i in input_content){
			var value = input_content[i]['value'];

			var msg = $('input[name='+input_content[i]['name']+']').attr('placeholder-text');

			if(isBlank(value)){
				_alert('请输入'+msg);
				return false;
			}

			if(isNumeric(value) == false){
				_alert(msg+'仅限输入数字');
                return false;
			}
			item[input_content[i]['name']] = input_content[i]['value']
		}

        localStorage.setItem(input_content[0]['value'], JSON.stringify(item));
        $('#add input').val('');
        // refreshFund(true);
        // refreshJingzhi(true)
        _list();
        _alert('新增基金成功');
        cloudBackUp(false);

	});

    /**
     * 修改基金信息
     */
    $('body').on('click', '.am-btn-primary', function(){
        var code = $(this).attr('data');
        var inputDom = $(this).parent().parent().parent().find('input');
        var input_content = inputDom.serializeArray();

        var fund = JSON.parse(localStorage.getItem(code));

        for(var i in input_content){
            var value = input_content[i]['value'];
            var msg = $('input[name='+input_content[i]['name']+']').attr('placeholder-text');
            if(isBlank(value)){

            	_alert('请输入'+msg);
                return false;
            }

            if(isNumeric(value) == false){
                _alert(msg+'仅限输入数字');
                return false;
            }
            fund[input_content[i]['name']] = input_content[i]['value']
        }

        localStorage.setItem(code, JSON.stringify(fund));
        _alert('修改 '+code+' 基金成功');
        inputDom.addClass('am-text-primary')
        cloudBackUp(false);
		setTimeout(function () {
			_list();
        }, 2500)
    })

    /**
     * 更改通知设置
     */
    $('.update-notice').on('click', function(){
        var check_update = false;

        var notice_type = $('select[name=notice_type]').val();
        if(notice_type == ''){
            alert('请选择要更改通知的设置类型');
            return false;
        }
        $("input[name='notice[]']:checked").each(function (){
            var code = $(this).val();
            var fund = JSON.parse(localStorage.getItem(code));
            if(fund){
                fund['notice'] = notice_type
                localStorage.setItem(code, JSON.stringify(fund));
                check_update = true;
            }
        });

        if(check_update){
            var d = dialog({
                title : 'Tips',
                content : '更改设置完成!'
            })
            d.showModal();
            cloudBackUp(false);
            setTimeout(function () {
                d.close().remove();
                $('.checkbox-all').removeAttr("checked")
                _list();
            }, 1500)

        }

        //
    })



	//删除基金
	$('body').on('click', '.am-btn-danger', function(){
        var id = $(this).attr('data');
		if(confirm('您确定要删除 '+id+' 基金吗？')){
            localStorage.removeItem(id);
            _list();
            cloudBackUp(false);
		}

	})

    /**
     * 分析基金
     */
    $('body').on('click', '.fund-analyze', function () {
        var code =  $(this).attr('data');
        chrome.tabs.create({url: API_URL+'/fund/analyze/'+code+'.html'});
    })

    /**
     * 点击跳转对应的天天基金的详细页
     */
    $('body').on('click', '.view-fund', function(){
        var code =  $(this).attr('data');
        chrome.tabs.create({url: 'http://fund.eastmoney.com/'+code+'.html'});
    })

    //帮助文档
    $('.document').on('click', function(){
        chrome.tabs.create({url: 'https://www.pescms.com/d/v/32/84.html'});
    })

    /**
	 * 赞赏弹窗
     */
    $('.zan').on('click', function(){
        var d = dialog({
            title: '打赏给本扩展',
            content: $('.zan-img')[0],
            padding: 0
        })
        d.showModal();
    })

    /**
	 * 刷新列表和获取最新价格
     */
	$('.refresh').on('click', function(){
		var d = dialog({
			title:'刷新中...',
			id: 'refresh_fund'
		}).showModal()

        // refreshFund(true);
        // refreshJingzhi(true)
        setTimeout(function () {
            _list();
            d.close().remove();
        }, 2000)

	})

    /**
	 * 全屏按钮
     */
    $('.popup').on('click', function(){
        chrome.tabs.create({url: 'popup.html'});
	})

    /**
	 * 数据来源
     */
    $('.fund-source').on('click', function(){
        chrome.tabs.create({url: 'http://fund.eastmoney.com/'});
	})
    /**
	 * 备份
     */
    $('.bak').on('click', function(){
        chrome.tabs.create({url: 'bak.html'});
	})

    /**
     * 全选OR取消全选
     */
    $('.checkbox-all').on('click', function(){
        if($(this).prop('checked')){
            $("input[name='notice[]']").attr("checked", "checked")
        }else{
            $("input[name='notice[]']").removeAttr("checked")
        }
    })
    $('.refreshTime').on('click', function(){
        var input_content = $('#refreshTime input').serializeArray();
        var value = input_content[0]['value'];
        localStorage.setItem('refreshTime',value)
        autoRefreshList(parseInt(value))
    })

	_list();
    autoRefreshList(refreshTime)
    // setInterval('alert("欢迎来到CodePlayer");', 3000);
    // setInterval("_list()", 1000);

    //引导页
    if(!localStorage.getItem('help_dialog')){

        var help_dialog_2 = dialog({
            align: 'right',
            content: '列表可以看到详尽的内容',
            zIndex : 1
        })
        help_dialog_2.show($('.popup')[0])

        var help_dialog_zan = dialog({
            align: 'bottom',
            content: '若觉得本扩展有用，捐赠可以使它持续更新',
            zIndex : 1
        })

        setTimeout(function () {
            help_dialog_2.close().remove();
            help_dialog_zan.show($('.zan ')[0])
        }, 5010)

        var help_dialog = dialog({
            title: '欢迎使用基金定投助手',
            align: 'bottom left',
            width : '350px',
            content: $('.help_content'),
            padding:0,
            cancelDisplay: false,
            cancel: function () {
                localStorage.setItem('help_dialog', 1)
            }
        })
        setTimeout(function () {
            help_dialog_zan.close().remove();
            help_dialog.show($('.document')[0])
        }, 10010)
    }
});

// function AutoRefresh( t ) {
//     // setInterval("_list", 3000);
//     setInterval('alert("欢迎来到CodePlayer");', t);
// }

function startAutoRefreshList(time) {
    chrome.alarms.onAlarm.addListener(function(alarm) {
    _list()
    });
    chrome.alarms.create('refreshList',{periodInMinutes: time});
    // chrome.alarms.getAll(function(alarm) {
    //     console.log(alarm)
    // })
}


function stopAutoRefreshList() {
    //創造定時器.5 分钟刷新一次
    chrome.alarms.clear('refreshList');
}

function autoRefreshList(time){
    stopAutoRefreshList()
    startAutoRefreshList(time)
}
