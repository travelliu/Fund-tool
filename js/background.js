
// 监听来自content-script的消息
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse)
{
    chrome.tabs.create({url: 'popup.html'});
    console.log(request, sender, sendResponse);
});

/**
 * 消息提醒
 */
var notifications = function(){
    var saveNotice = {}
    var date = moment().format('YYYY-MM-DD');
    var time = moment().format('H:mm').split(':');

    //非工作日不提醒 PS:法定假期无法判定呀。这个需要人工介入，就不管理了
    if(moment().format('d') == 0 || moment().format('d') == 6){
        return false;
    }

    if(parseInt(time[0]) != 14 || parseInt(time[1]) < 30 ){
        return false;
    }
    var getNoticeLocalStorage = JSON.parse(localStorage.getItem('saveNotice'));

    var BadgeNumber = 0;

    for(var i in localStorage) {
        if (isNumeric(i)) {
            var content = localStorage.getItem(i);
            if(content != '') {
                var json_str = JSON.parse(content);

                var msg = json_str.name + ' '+i;
                var icon = '';

                var notice = isBlank(json_str.notice) ? '' : parseInt(json_str.notice);


                if (parseFloat(json_str.now) >= parseFloat(json_str.sell) && notice != 2 && notice != 4 ) {
                    msg += ' 基金涨幅'+json_str.now+'已达到可卖出价格'+json_str.sell+'，请及时处理';
                    icon = 'sell.png';
                    saveNotice[i] = getNoticeLocalStorage == null || !getNoticeLocalStorage[date] || !getNoticeLocalStorage[date][i] ? 11 : getNoticeLocalStorage[date][i] + 1;

                } else if (parseFloat(json_str.adding) >= parseFloat(json_str.now) && notice != 2 && notice != 6 ) {
                    msg += ' 基金跌幅'+json_str.now+'已达到补仓价格'+json_str.adding+'，请及时处理.';
                    icon = 'adding.png';
                    saveNotice[i] = getNoticeLocalStorage == null || !getNoticeLocalStorage[date] || !getNoticeLocalStorage[date][i] ? 11 : getNoticeLocalStorage[date][i] + 1;
                }else{
                    continue;
                }

                if(getNoticeLocalStorage == null || !getNoticeLocalStorage[date] || getNoticeLocalStorage[date][i] % 10 == 0){
                    chrome.notifications.create(null, {
                        type: 'basic',
                        iconUrl: 'img/'+icon,
                        title: '基金定投提醒',
                        message: msg
                    });
                    BadgeNumber++;
                }
            }
        }
    }

    //添加通知图标数字提醒
    if(BadgeNumber > 0){
        chrome.browserAction.setBadgeText({text: String(BadgeNumber)});
    }
    localStorage.setItem("saveNotice", JSON.stringify({[date] : saveNotice}));
}



