/**
 * Created by panweilong on 16/9/3.
 */


/*
 * Faster Scroll Effect
 * Version: 0.1
 * Copyright 2012
 * MIT Licence
 */

(function () {

// Detect css transform
    var cssTransform = (function () {
        var prefixes = 'transform webkitTransform mozTransform oTransform msTransform'.split(' ')
            , el = document.createElement('div')
            , cssTransform
            , i = 0
        while (cssTransform === undefined) {
            cssTransform = document.createElement('div').style[prefixes[i]] != undefined ? prefixes[i] : undefined
            i++
        }
        return cssTransform
    })()

// Detect request animation frame
    var scroll = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame || window.oRequestAnimationFrame || function (callback) {
            window.setTimeout(callback, 1000 / 60)
        }
    // Vars
        , has3d = document.body.style.transform
        , lastPosition = -1
        , wHeight = window.innerHeight
        , wrapper = document.getElementById("wrapper")
        , elements = document.getElementsByTagName("section")
        , size = elements.length
        , matrix = []

// Pre calculate sizes to get better perfs
    function sizes() {
        lastPosition = -1 // Force a recalculation
        wHeight = window.innerHeight
        var i = 0
        for (i = 0; i < size; i++) {
            matrix[i] = matrix[i] || {el: elements[i]}

            // Reinit
            matrix[i].el.style.display = "block"

            matrix[i].height = matrix[i].el.offsetHeight
            matrix[i].start = matrix[i - 1] ? matrix[i - 1].stop : 0
            matrix[i].stop = matrix[i - 1] ? matrix[i - 1].stop + matrix[i].height : matrix[i].height
            matrix[i].isScroll = matrix[i].el.className.indexOf("stick") < 0

            // If it's sticked but higher than the screen...
            if (matrix[i].height - wHeight > 0) matrix[i].gap = matrix[i].height - wHeight

            // Let's find a index
            matrix[i].el.style.zIndex = !matrix[i].isScroll ? 10 - i : 100 - i
        }
        wrapper.style.height = matrix[i - 1].stop + "px"
    }

    // window.onresize = sizes

    function setTop(m, t) {
        if (cssTransform)
            m.el.style[cssTransform] = "translate3d(0, " + t + "px,0)"
        else
            m.el.style["top"] = t
    }

    function loop() {
        // Avoid calculations if not needed
        if (lastPosition == window.pageYOffset) {
            scroll(loop)
            return false
        } else {
            lastPosition = window.pageYOffset

            var scrollHeight = $(document).height();
            var scrollPosition = $(window).height() + $(window).scrollTop();
            var bottomDistance = scrollHeight - scrollPosition

            console.log('$(document).height():' + $(document).height()
                + ' $(window).height():' + $(window).height()
                + ' $(window).scrollTop():' + $(window).scrollTop())
            console.log('bottomDistance ' + bottomDistance)
            if(bottomDistance < 200){
                console.log('near bottom....')
            }

            // var i = 0
            // for (i = 0; i < size; i++) {
            //     Is it visible right now?
                // if (lastPosition >= matrix[i].start - wHeight && lastPosition <= matrix[i].stop) {
                //     matrix[i].el.style.display = "block"
                //     if (
                //         Is it scrolling?
                    // (matrix[i].isScroll) ||
                    // Or is it stick, but higher than window?
                    // (!matrix[i].isScroll && matrix[i].gap && lastPosition >= matrix[i].start)
                    // )
                    //     setTop(matrix[i], matrix[i].start - lastPosition)
                // } else {
                //     matrix[i].el.style.display = "none"
                // }
            // }
            scroll(loop)
        }
    }

    // Let's go
    // sizes()
    loop()

})();
