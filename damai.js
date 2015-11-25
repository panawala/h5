
var doc = document, win = window;
$(function () {
    bindData($('#canvasDiv').attr('ref'), 'onlineSeat', 'canvasDiv');
    var $seatinfo = $('.m-seatinfo');
    var $hd = $seatinfo;
    $('.m-seatinfo .hd').on('touchend', function (e) {
        var ev = e || window.event;
        var target = e.target || e.srcElement;
        if (!$seatinfo.find('.lst .itm').size())return;
        if (!$(target).hasClass('u-btn-buy'))$seatinfo.toggleClass('z-show')
    })
});
var execDraw = function (jsonData, canvas, imgDB, key, $wrap, isCache) {
    var c = [];
    for (var j = 0, lj = jsonData.data.color.length; j < lj; j++) {
        var cl = jsonData.data.color[j];
        c[cl.i] = cl.c
    }
    var data = [];
    var db = jsonData.data.db;
    var baseID = db.basesid | 0;
    var basegid = db.basegid | 0;
    var mw = $wrap.width(), mh = $wrap.height();
    var st = [];
    $.ajax({
        type: 'get',
        dataType: 'json',
        url: '/ajax.aspx?_action=GetSeatState&' + key,
        cache: false,
        success: function (jsonState) {
            if (jsonState.status == 200) {
                var stat = jsonState.data.split('|');
                for (var n = 0, ln = stat.length; n < ln; n++) {
                    var stae = stat[n].split(',');
                    st[(stae[0] | 0) - baseID] = stae[1]
                }
                var rr = {maxRow: 0, maxCol: 0, minRow: 0, minCol: 0};
                var seats = jsonData.data.db.seats;
                if (seats) {
                    for (var i = 0, lj = seats.length; i < lj; i++) {
                        var _sd = seats[i].split(',');
                        var smid = (_sd[0] | 0);
                        var id = smid + baseID;
                        var cid = (_sd[1] | 0) + basegid;
                        if (i == 0) {
                            rr.maxRow = (_sd[3] | 0);
                            rr.maxCol = (_sd[4] | 0);
                            rr.minRow = (_sd[3] | 0);
                            rr.minCol = (_sd[4] | 0)
                        } else {
                            rr.maxRow = (_sd[3] | 0) > rr.maxRow ? (_sd[3] | 0) : rr.maxRow;
                            rr.maxCol = (_sd[4] | 0) > rr.maxCol ? (_sd[4] | 0) : rr.maxCol;
                            rr.minRow = (_sd[3] | 0) < rr.minRow ? (_sd[3] | 0) : rr.minRow;
                            rr.minCol = (_sd[4] | 0) < rr.minCol ? (_sd[4] | 0) : rr.minCol
                        }
                        data.push({
                            i: id,
                            pid: cid,
                            p: _sd[7],
                            r: _sd[3],
                            c: _sd[4],
                            rn: _sd[5],
                            sn: _sd[6],
                            t: _sd[8],
                            tid: _sd[9],
                            pv: _sd[11],
                            color: c[cid] != undefined ? c[cid] : "000",
                            st: st[smid] == null ? 8 : st[smid]
                        })
                    }
                }
                var iw = 20, ih = 20;
                var stageHeight = imgDB[0].height + 100;
                var stageLeft = 0;
                var sepLen = 3;
                w = (rr.maxCol - rr.minCol + 1) * (iw + sepLen);
                h = (rr.maxRow - rr.minRow + 1) * (ih + sepLen);
                var offCanvas = document.createElement('canvas');
                var offContext = offCanvas.getContext('2d');
                if (w > 10000 || h > 10000) {
                    iw = 10;
                    ih = 10;
                    sepLen = 1;
                    w = (rr.maxCol - rr.minCol + 1) * (iw + sepLen);
                    h = (rr.maxRow - rr.minRow + 1) * (ih + sepLen)
                }
                if (w < imgDB[0].width) {
                    stageLeft = (imgDB[0].width - w) / 2;
                    w = imgDB[0].width
                }
                offCanvas.width = w;
                offCanvas.height = h + stageHeight;
                offContext.drawImage(imgDB[0], (w - imgDB[0].width) / 2, 50);
                var poly = [];
                for (var p = 0, ld = data.length; p < ld; p++) {
                    var d = data[p];
                    var x = (d.c - rr.minCol) * (iw + sepLen) + stageLeft;
                    var y = (d.r - rr.minRow) * (ih + sepLen) + stageHeight;
                    offContext.beginPath();
                    if (d.st == 2 || (d.t == 1 && d.tid > 0 && d.st == 2)) {
                        offContext.fillStyle = "#" + d.color;
                        offContext.fillRect(x, y, iw, ih);
                        offContext.fill()
                    }
                    switch (d.st | 0) {
                        case 2:
                            if (d.tid > 0) {
                                offContext.drawImage(imgDB[3], x, y, iw, ih)
                            } else {
                                offContext.drawImage(imgDB[2], x, y, iw, ih)
                            }
                            poly.push({
                                i: d.i,
                                pid: d.pid,
                                p: d.p,
                                r: d.r,
                                c: d.c,
                                rn: d.rn,
                                sn: d.sn,
                                t: d.t,
                                tid: d.tid,
                                pv: d.pv,
                                color: d.color,
                                pos: {x: x, y: y}
                            });
                            break;
                        case 4:
                            offContext.drawImage(imgDB[5], x, y, iw, ih);
                            break;
                        case 8:
                            offContext.drawImage(imgDB[4], x, y, iw, ih);
                            break;
                        default:
                            offContext.drawImage(imgDB[4], x, y, iw, ih);
                            break
                    }
                    offContext.closePath()
                }
                var touchCanvas = new TouchCanvas({
                    canvas: canvas,
                    width: mw,
                    height: mh,
                    jsonData: poly,
                    offImage: offCanvas,
                    offContext: offContext,
                    limit: jsonData.data.limit,
                    ssImage: imgDB[1],
                    wImage: imgDB[2],
                    tpImage: imgDB[3],
                    iw: iw,
                    ih: ih,
                    name: jsonData.data.db.fnames,
                    pid: jsonData.data.pid,
                    cid: jsonData.data.cid
                });
                var $seatinfo = $('.m-seatinfo');
                $(doc).on('touchend', 'a.u-btn-del', function () {
                    var $p = $(this).parents('.itm');
                    var id = $p.attr('rel');
                    var tid = ($p.attr('tid') | 0);
                    $p.remove();
                    var rmitem = [];
                    var tmp = touchCanvas.selectSeat;
                    var newSs = [];
                    for (var i = 0, j = tmp.length; i < j; i++) {
                        if (tid > 0) {
                            if (tmp[i].tid == tid) {
                                rmitem.push(tmp[i])
                            } else {
                                newSs.push(tmp[i])
                            }
                        } else {
                            if (tmp[i].i == id) {
                                rmitem.push(tmp[i])
                            } else {
                                newSs.push(tmp[i])
                            }
                        }
                    }
                    touchCanvas.selectSeat = newSs;
                    touchCanvas.cancelSeat(rmitem);
                    if (!$seatinfo.find('.lst .itm').size()) {
                        $seatinfo.removeClass('z-show')
                    }
                });
                $('a.u-btn-buy').on('touchend', function () {
                    var sseat = [];
                    if (touchCanvas.selectSeat.length > 0) {
                        for (var i = 0, j = touchCanvas.selectSeat.length; i < j; i++) {
                            sseat.push(touchCanvas.selectSeat[i].i)
                        }
                        if (sseat.length > 0) {
                            $.ajax({
                                type: 'get',
                                dataType: 'text',
                                url: "/ajax.aspx?_action=verifyBuy&t=1&t1=" + sseat.join(',') + "&t2=" + touchCanvas.cid + "&pid=" + touchCanvas.pid + "&x=" + encodeURIComponent(window.location.search),
                                timeout: 60 * 1000,
                                cache: false,
                                success: function (data) {
                                    var t = data.split("|");
                                    if (t.length > 1) {
                                        if (t[0] == "error") {
                                            alert(t[1])
                                        } else {
                                            win.location.href = "/pay/confirm.aspx?" + data
                                        }
                                    } else {
                                        win.location.href = "/pay/confirm.aspx?" + data
                                    }
                                },
                                complete: function () {
                                },
                                error: function () {
                                }
                            })
                        }
                    } else {
                        alert('您尚未选择任何座位！')
                    }
                })
            } else {
                alert(json.error)
            }
        },
        complete: function () {
            $('#load').removeClass('z-show').addClass('z-hide').css('visibility', 'hidden')
        }
    });
    if (isCache) {
        sessionStorage.setItem(key, JSON.stringify(jsonData))
    }
};
var bindData = function (u, canvasObj, wrapDiv) {
    var canvas = document.getElementById(canvasObj);
    var context = canvas.getContext('2d');
    var $wrap = $('#' + wrapDiv);
    var w = canvas.width = $wrap.width();
    var h = canvas.height = $wrap.height();
    var imgarr = [];
    var imgDB = [];
    var imgs = ['bg_stage', 'selected', 'bg', 'double', 'sold', 'seat_lock@3x'];
    var isExec = false;

    function loadImages(sources, callback) {
        var ls = sources.shift();
        if (ls) {
            var img = new Image();
            img.src = "/images/seat/" + ls + ".png";
            if (img.complete) {
                imgarr.push(img);
                loadImages(sources, callback);
                return
            }
            ;
            img.onload = function () {
                imgarr.push(img);
                loadImages(sources, callback)
            };
            img.onerror = function () {
                alert('资源加载失败！')
            }
        } else {
            imgDB = imgarr;
            isExec = true;
            callback()
        }
    }

    loadImages(imgs, function () {
        if (!isExec) {
            return
        }
        var loadCache = function (b) {
            var cache = sessionStorage.getItem(u);
            if (!cache || b) {
                $.ajax({
                    type: 'get',
                    dataType: 'json',
                    url: '/ajax.aspx?_action=GetSeatList&' + u,
                    cache: false,
                    success: function (jsonData) {
                        if (jsonData.status == 200) {
                            execDraw(jsonData, canvas, imgDB, u, $wrap, true)
                        } else {
                            alert(json.error)
                        }
                    },
                    complete: function () {
                    }
                })
            } else {
                var jsonDB = JSON.parse(cache);
                if (jsonDB && jsonDB.t) {
                    var nowtime = (new Date).getTime();
                    var secondNum = (nowtime - jsonDB.t) / 1000;
                    if (secondNum >= 5 * 60) {
                        loadCache(true)
                    } else {
                        execDraw(jsonDB, canvas, imgDB, u, $wrap, false)
                    }
                } else {
                    loadCache(true)
                }
            }
        };
        loadCache(false)
    })
};
(function () {
    var root = this;
    var TouchCanvas = function (options) {
        if (!options || !options.canvas || !options.offImage) {
            throw'参数不正确或参数错误';
        }
        this.canvas = options.canvas;
        this.canvas.width = !options.width ? this.canvas.clientWidth : options.width;
        this.canvas.height = !options.height ? this.canvas.clientHeight : options.height;
        this.context = this.canvas.getContext('2d');
        this.offContext = options.offContext;
        this.position = {x: 0, y: 0};
        this.scale = {x: 0.5, y: 0.5};
        this.offImage = options.offImage;
        this.lastZoomScale = null;
        this.lastX = null;
        this.lastY = null;
        this.init = false;
        this.isAnimate = false;
        this.isClick = false;
        this.iw = options.iw;
        this.ih = options.ih;
        this.name = options.name;
        this.jsonData = !options.jsonData ? {} : options.jsonData;
        this.limit = !options.limit ? 6 : options.limit;
        this.ssImage = options.ssImage;
        this.wImage = options.wImage;
        this.tpImage = options.tpImage;
        this.pid = options.pid;
        this.cid = options.cid;
        this.selectSeat = [];
        this.checkRequestAnimationFrame();
        requestAnimationFrame(this.animate.bind(this));
        this.setEventListeners()
    };
    TouchCanvas.prototype = {
        animate: function () {
            if (!this.init) {
                if (this.offImage.width) {
                    var scaleRatio = null;
                    if (this.canvas.clientWidth > this.canvas.clientHeight) {
                        scaleRatio = this.canvas.clientWidth / this.offImage.width
                    } else {
                        scaleRatio = this.canvas.clientHeight / this.offImage.height
                    }
                    this.scale.x = scaleRatio;
                    this.position.x = (this.canvas.clientWidth - this.offImage.width * this.scale.x) / 2;
                    this.scale.y = scaleRatio;
                    this.init = true
                }
            }
            if (!this.isClick) {
                this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
                this.context.drawImage(this.offImage, this.position.x, this.position.y, this.scale.x * this.offImage.width, this.scale.y * this.offImage.height)
            }
            requestAnimationFrame(this.animate.bind(this))
        }, gesturePinchZoom: function (event) {
            var zoom = false;
            if (event.targetTouches.length >= 2) {
                var p1 = event.targetTouches[0];
                var p2 = event.targetTouches[1];
                var zoomScale = Math.sqrt(Math.pow(p2.pageX - p1.pageX, 2) + Math.pow(p2.pageY - p1.pageY, 2));
                if (this.lastZoomScale) {
                    zoom = zoomScale - this.lastZoomScale
                }
                this.lastZoomScale = zoomScale
            }
            return zoom
        }, doZoom: function (zoom) {
            if (!zoom)return;
            var currentScale = this.scale.x;
            var newScale = this.scale.x + zoom / 75;
            var deltaScale = newScale - currentScale;
            var currentWidth = (this.offImage.width * this.scale.x);
            var currentHeight = (this.offImage.height * this.scale.y);
            var deltaWidth = this.offImage.width * deltaScale;
            var deltaHeight = this.offImage.height * deltaScale;
            var canvasmiddleX = this.canvas.clientWidth / 2;
            var canvasmiddleY = this.canvas.clientHeight / 2;
            var xonmap = (-this.position.x) + canvasmiddleX;
            var yonmap = (-this.position.y) + canvasmiddleY;
            var coefX = -xonmap / (currentWidth);
            var coefY = -yonmap / (currentHeight);
            var newPosX = this.position.x + deltaWidth * coefX;
            var newPosY = this.position.y + deltaHeight * coefY;
            var newWidth = currentWidth + deltaWidth;
            var newHeight = currentHeight + deltaHeight;
            if (newWidth < this.canvas.clientWidth)return;
            if (newPosX > 0) {
                newPosX = 0
            }
            if (newPosX + newWidth < this.canvas.clientWidth) {
                newPosX = this.canvas.clientWidth - newWidth
            }
            if (newHeight < this.canvas.clientHeight)return;
            if (newPosY > 0) {
                newPosY = 0
            }
            if (newPosY + newHeight < this.canvas.clientHeight) {
                newPosY = this.canvas.clientHeight - newHeight
            }
            this.scale.x = newScale;
            this.scale.y = newScale;
            this.position.x = newPosX;
            this.position.y = newPosY
        }, doMove: function (relativeX, relativeY) {
            if (this.lastX && this.lastY) {
                var maxX = this.canvas.clientWidth / 3, maxY = this.canvas.clientHeight / 3;
                var deltaX = relativeX - this.lastX;
                var deltaY = relativeY - this.lastY;
                var currentWidth = (this.offImage.width * this.scale.x);
                var currentHeight = (this.offImage.height * this.scale.y);
                this.position.x += deltaX;
                this.position.y += deltaY;
                if (this.position.x > maxX) {
                    this.position.x = maxX
                } else if (this.position.x + currentWidth + maxX < this.canvas.clientWidth) {
                    this.position.x = this.canvas.clientWidth - currentWidth - maxX
                }
                if (this.position.y > maxY) {
                    this.position.y = maxY
                } else if (this.position.y + currentHeight + maxY < this.canvas.clientHeight) {
                    this.position.y = this.canvas.clientHeight - currentHeight - maxY
                }
            }
            this.lastX = relativeX;
            this.lastY = relativeY
        }, setEventListeners: function () {
            this.canvas.addEventListener('touchstart', function (e) {
                e.preventDefault();
                this.lastX = null;
                this.lastY = null;
                this.lastZoomScale = null;
                cancelAnimationFrame(this.animate.bind(this))
            }.bind(this));
            this.canvas.addEventListener('touchmove', function (e) {
                e.preventDefault();
                if (e.targetTouches.length == 2) {
                    this.isAnimate = true;
                    this.doZoom(this.gesturePinchZoom(e))
                } else if (e.targetTouches.length == 1) {
                    this.isAnimate = true;
                    var relativeX = e.targetTouches[0].pageX - this.canvas.getBoundingClientRect().left;
                    var relativeY = e.targetTouches[0].pageY - this.canvas.getBoundingClientRect().top;
                    this.doMove(relativeX, relativeY)
                }
            }.bind(this));
            this.canvas.addEventListener('touchend', function (e) {
                e.preventDefault();
                if (e.changedTouches.length == 1 && !this.isAnimate) {
                    var ln = this.jsonData.length;
                    if (ln == 0) {
                        return
                    }
                    var touch = event.changedTouches[0];
                    var relativeX = touch.pageX - this.canvas.getBoundingClientRect().left;
                    var relativeY = touch.pageY - this.canvas.getBoundingClientRect().top;
                    var pt = {x: relativeX - this.position.x, y: relativeY - this.position.y};
                    var item = null;
                    for (var n = 0; n < ln; n++) {
                        var jsonDB = this.jsonData[n];
                        var poly = jsonDB.pos;
                        if (poly == null || poly.length == 0) {
                            break
                        }
                        var c = this.rayCasting(pt, poly, this.scale);
                        if (c) {
                            item = jsonDB;
                            break
                        }
                    }
                    if (item != null) {
                        var tp = [];
                        var ss = this.selectSeat.length;
                        var authAdd = true, isNeedDraw = false;
                        tp.push(item);
                        if (item.tid > 0) {
                            for (var n = 0; n < ln; n++) {
                                var jsonDB = this.jsonData[n];
                                if (jsonDB.tid == item.tid && jsonDB.i != item.i) {
                                    tp.push(jsonDB)
                                }
                            }
                        }
                        for (var t = 0, tpl = tp.length; t < tpl; t++) {
                            for (var x = 0, sl = this.selectSeat.length; x < sl; x++) {
                                if (this.selectSeat[x].i == tp[t].i) {
                                    this.selectSeat.splice(x, 1);
                                    authAdd = false;
                                    break
                                }
                            }
                        }
                        ss = this.selectSeat.length;
                        if (authAdd) {
                            if ((ss + tp.length) > this.limit) {
                                alert('对不起，您最多只能选择' + this.limit + '个座位！');
                                return
                            }
                            this.addSeat(tp);
                            isNeedDraw = true
                        } else {
                            this.cancelSeat(tp);
                            isNeedDraw = true
                        }
                        if (isNeedDraw) {
                            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
                            this.context.drawImage(this.offImage, this.position.x, this.position.y, this.scale.x * this.offImage.width, this.scale.y * this.offImage.height)
                        }
                        this.isClick = true
                    }
                }
                if (e.targetTouches.length == 0) {
                    this.isAnimate = false;
                    this.isClick = false
                }
            }.bind(this))
        }, addSeat: function (tp) {
            for (var t = 0, tpl = tp.length; t < tpl; t++) {
                this.offContext.beginPath();
                var tpi = tp[t];
                this.offContext.drawImage(this.ssImage, tpi.pos.x, tpi.pos.y, this.iw, this.ih);
                this.offContext.closePath();
                this.selectSeat.push(tpi)
            }
            this.outputHtml()
        }, cancelSeat: function (tp) {
            for (var t = 0, tpl = tp.length; t < tpl; t++) {
                this.offContext.beginPath();
                var tpi = tp[t];
                this.offContext.clearRect(tpi.pos.x, tpi.pos.y, this.iw, this.ih);
                this.offContext.fillStyle = "#" + tpi.color;
                this.offContext.fillRect(tpi.pos.x, tpi.pos.y, this.iw, this.ih);
                this.offContext.fill();
                if (tpi.tid > 0) {
                    this.offContext.drawImage(this.tpImage, tpi.pos.x, tpi.pos.y, this.iw, this.ih)
                } else {
                    this.offContext.drawImage(this.wImage, tpi.pos.x, tpi.pos.y, this.iw, this.ih)
                }
                this.offContext.closePath()
            }
            this.outputHtml()
        }, outputHtml: function () {
            var ss = this.selectSeat.length;
            var nSeat = {};
            for (var i = 0; i < ss; i++) {
                var it = this.selectSeat[i];
                if (nSeat[it.tid] == undefined) {
                    var list = [];
                    list.push(it);
                    nSeat[it.tid] = list
                } else {
                    nSeat[it.tid].push(it)
                }
            }
            var $list = $('#list');
            var $info = $('#info');
            $list.empty();
            $info.html('<span class="price">￥0.00</span>(0张)');
            var total = 0, totalPrice = 0;
            for (var i in nSeat) {
                var it = nSeat[i];
                if (i > 0) {
                    totalPrice += it[0].p * 100;
                    total += it.length;
                    $('<li class="itm" rel="' + it[0].i + '" tid="' + it[0].tid + '"><i class="seat" style="background-color: #' + it[0].color + ';"></i><span class="info"><em class="poi">' + this.name + it[0].pv + '</em><em class="price">' + it[0].p + '元</em></span><a class="u-btn u-btn-del" href="javascript:;">删除</a></li>').appendTo($list)
                } else {
                    for (var j = 0, jl = it.length; j < jl; j++) {
                        totalPrice += it[j].p * 100;
                        total += 1;
                        $('<li class="itm" rel="' + it[j].i + '" tid="' + it[j].tid + '"><i class="seat" style="background-color: #' + it[j].color + ';"></i><span class="info"><em class="poi">' + this.name + it[j].rn + '排' + it[j].sn + '号</em><em class="price">' + it[j].p + '元</em></span><a class="u-btn u-btn-del" href="javascript:;">删除</a></li>').appendTo($list)
                    }
                }
            }
            $info.html('<span class="price">￥' + (totalPrice / 100).toFixed(2) + '</span>(' + total + '张)')
        }, checkRequestAnimationFrame: function () {
            var lastTime = 0;
            var vendors = ['ms', 'moz', 'webkit', 'o'];
            for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
                window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
                window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame']
            }
            if (!window.requestAnimationFrame) {
                window.requestAnimationFrame = function (callback, element) {
                    var currTime = new Date().getTime();
                    var timeToCall = Math.max(0, 16 - (currTime - lastTime));
                    var id = window.setTimeout(function () {
                        callback(currTime + timeToCall)
                    }, timeToCall);
                    lastTime = currTime + timeToCall;
                    return id
                }
            }
            if (!window.cancelAnimationFrame) {
                window.cancelAnimationFrame = function (id) {
                    clearTimeout(id)
                }
            }
        }, rayCasting: function (p, poly, scale) {
            var px = p.x, py = p.y;
            var x = scale.x * poly.x, y = scale.y * poly.y;
            if (px >= x && px <= (x + this.iw * scale.x) && py >= y && py <= (y + this.ih * scale.y)) {
                return true
            }
            return false
        }
    };
    root.TouchCanvas = TouchCanvas
}).call(this);

