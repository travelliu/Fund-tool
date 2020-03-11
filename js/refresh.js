/*
* @Author: travel.liu
* @Date:   2020-03-10 10:24:51
* @Last Modified by:   travel.liu
* @Last Modified time: 2020-03-10 10:46:20
*/

// 刷新界面
function myrefresh()
{
   window.location.reload();
}
// function AutoRefresh( t ) {
//     setTimeout("location.reload(true);", t);
// }

function AutoRefresh( t ) {
    setInterval("window.location.reload()", t);
}
