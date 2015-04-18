/**
 * Created by panweilong on 15/4/18.
 */

(function(window, $, undefined){
    window.toast = window.toast || (function(){
        var _init_toast = function () {
            var mask_html = '<div id="toast-mask" style="display:none;height:100%;width:100%;z-index:888;' +
                'background:#EEE;box-sizing:border-box;border-radius:4px;position:absolute;top:0;left:0;opacity:0;"></div>\n';
            var msg_html = '<div id="toast-msg" style="display:none;padding:20px;z-index:999;width:180px;background:#888;' +
                'box-sizing:border-box;border-radius:4px;margin:0 auto;position: absolute;top:150px;' +
                'left:50%;margin-left:-90px;opacity:0.9;color:#fff;"></div>';

            $(document.body).append(mask_html);
            $(document.body).append(msg_html);
        };
        var _show_msg = function (msg) {
            $('#toast-mask').show();
            $('#toast-msg').show();
            msg_list = msg.split('\n');
            $('#toast-msg').empty();
            msg_list.forEach(function (msg) {
                $('#toast-msg').append('<span style="display:block;text-align:center;box-sizing:border-box;' +
                    'word-break:break-all;">' + msg + '</span>\n');
            });
        };
        var _handle_time_out = function (time_out) {
            time_out = time_out || -1;
            if (time_out == -1) {
                return;
            }
            setTimeout(function () {
                close();
            }, time_out);
        };
        var _bind_evt = function(){
            $('#toast-confirm-btn').on('click',function(){
                close();
            });
        };

        var show_msg = function (msg, time_out) {
            _show_msg(msg);
            _handle_time_out(time_out);
        };
        var show_confirm_msg = function (msg, time_out) {
            _show_msg(msg);
            $('#toast-msg').append('<a id="toast-confirm-btn" href="javascript:void(0);" style="display:block;text-decoration:none;width:100%;' +
                'background-color: #000;height: 40px;box-sizing: border-box;border-radius: 4px;text-align: center;' +
                'line-height: 40px;color: #fff;margin-top:15px;opacity:0.9;">确认</a>\n');
            _bind_evt();
            _handle_time_out(time_out);
        };
        var close = function () {
            $('#toast-mask').hide();
            $('#toast-msg').hide();
        };

        _init_toast();
        return {
            'show_msg': show_msg,
            'show_confirm_msg': show_confirm_msg,
            'close': close
        };
    })();
})(window, $);