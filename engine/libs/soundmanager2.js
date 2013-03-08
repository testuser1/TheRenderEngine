/*
 SoundManager 2: Javascript Sound for the Web
 --------------------------------------------
 http://schillmania.com/projects/soundmanager2/

 Copyright (c) 2010, Scott Schiller. All rights reserved.
 Code licensed under the BSD License:
 http://schillmania.com/projects/soundmanager2/license.txt

 V2.95a.20090717
 */
var soundManager = null;
function SoundManager(b, a) {
    this.flashVersion = 8;
    this.debugMode = true;
    this.useConsole = true;
    this.consoleOnly = false;
    this.waitForWindowLoad = false;
    this.nullURL = "null.mp3";
    this.allowPolling = true;
    this.useFastPolling = false;
    this.useMovieStar = false;
    this.bgColor = "#ffffff";
    this.useHighPerformance = false;
    this.flashLoadTimeout = 1000;
    this.wmode = null;
    this.allowFullScreen = true;
    this.defaultOptions = {autoLoad:false, stream:true, autoPlay:false, onid3:null, onload:null, whileloading:null, onplay:null, onpause:null, onresume:null, whileplaying:null, onstop:null, onfinish:null, onbeforefinish:null, onbeforefinishtime:5000, onbeforefinishcomplete:null, onjustbeforefinish:null, onjustbeforefinishtime:200, multiShot:true, multiShotEvents:false, position:null, pan:0, volume:100};
    this.flash9Options = {isMovieStar:null, usePeakData:false, useWaveformData:false, useEQData:false, onbufferchange:null, ondataerror:null};
    this.movieStarOptions = {onmetadata:null, useVideo:false, bufferTime:null};
    var f = null;
    var e = this;
    this.version = null;
    this.versionNumber = "V2.95a.20090717";
    this.movieURL = null;
    this.url = null;
    this.altURL = null;
    this.swfLoaded = false;
    this.enabled = false;
    this.o = null;
    this.id = (a || "sm2movie");
    this.oMC = null;
    this.sounds = {};
    this.soundIDs = [];
    this.muted = false;
    this.isFullScreen = false;
    this.isIE = (navigator.userAgent.match(/MSIE/i));
    this.isSafari = (navigator.userAgent.match(/safari/i));
    this.debugID = "soundmanager-debug";
    this.debugURLParam = /([#?&])debug=1/i;
    this.specialWmodeCase = false;
    this._onready = [];
    this._debugOpen = true;
    this._didAppend = false;
    this._appendSuccess = false;
    this._didInit = false;
    this._disabled = false;
    this._windowLoaded = false;
    this._hasConsole = (typeof console != "undefined" && typeof console.log != "undefined");
    this._debugLevels = ["log", "info", "warn", "error"];
    this._defaultFlashVersion = 8;
    this._oRemoved = null;
    this._oRemovedHTML = null;
    var g = function (h) {
        return document.getElementById(h)
    };
    this.filePatterns = {flash8:/\.mp3(\?.*)?$/i, flash9:/\.mp3(\?.*)?$/i};
    this.netStreamTypes = ["aac", "flv", "mov", "mp4", "m4v", "f4v", "m4a", "mp4v", "3gp", "3g2"];
    this.netStreamPattern = new RegExp("\\.(" + this.netStreamTypes.join("|") + ")(\\?.*)?$", "i");
    this.filePattern = null;
    this.features = {buffering:false, peakData:false, waveformData:false, eqData:false, movieStar:false};
    this.sandbox = {type:null, types:{remote:"remote (domain-based) rules", localWithFile:"local with file access (no internet access)", localWithNetwork:"local with network (internet access only, no local access)", localTrusted:"local, trusted (local + internet access)"}, description:null, noRemote:null, noLocal:null};
    this._setVersionInfo = function () {
        if (e.flashVersion != 8 && e.flashVersion != 9) {
            alert('soundManager.flashVersion must be 8 or 9. "' + e.flashVersion + '" is invalid. Reverting to ' + e._defaultFlashVersion + ".");
            e.flashVersion = e._defaultFlashVersion
        }
        e.version = e.versionNumber + (e.flashVersion == 9 ? " (AS3/Flash 9)" : " (AS2/Flash 8)");
        if (e.flashVersion > 8) {
            e.defaultOptions = e._mergeObjects(e.defaultOptions, e.flash9Options);
            e.features.buffering = true
        }
        if (e.flashVersion > 8 && e.useMovieStar) {
            e.defaultOptions = e._mergeObjects(e.defaultOptions, e.movieStarOptions);
            e.filePatterns.flash9 = new RegExp("\\.(mp3|" + e.netStreamTypes.join("|") + ")(\\?.*)?$", "i");
            e.features.movieStar = true
        } else {
            e.useMovieStar = false;
            e.features.movieStar = false
        }
        e.filePattern = e.filePatterns[(e.flashVersion != 8 ? "flash9" : "flash8")];
        e.movieURL = (e.flashVersion == 8 ? "soundmanager2.swf" : "soundmanager2_flash9.swf");
        e.features.peakData = e.features.waveformData = e.features.eqData = (e.flashVersion > 8)
    };
    this._overHTTP = (document.location ? document.location.protocol.match(/http/i) : null);
    this._waitingforEI = false;
    this._initPending = false;
    this._tryInitOnFocus = (this.isSafari && typeof document.hasFocus == "undefined");
    this._isFocused = (typeof document.hasFocus != "undefined" ? document.hasFocus() : null);
    this._okToDisable = !this._tryInitOnFocus;
    this.useAltURL = !this._overHTTP;
    var d = "http://www.macromedia.com/support/documentation/en/flashplayer/help/settings_manager04.html";
    this.strings = {notReady:"Not loaded yet - wait for soundManager.onload() before calling sound-related methods", appXHTML:"soundManager._createMovie(): appendChild/innerHTML set failed. May be app/xhtml+xml DOM-related.", localFail:'soundManager: Loading this page from local/network file system (not over HTTP?) Flash security likely restricting JS-Flash access. Consider adding current URL to "trusted locations" in the Flash player security settings manager at ' + d + ", or simply serve this content over HTTP.", waitFocus:"soundManager: Special case: Waiting for focus-related event..", waitImpatient:"soundManager: Getting impatient, still waiting for Flash.. ;)", waitForever:"soundManager: Waiting indefinitely for Flash...", needFunction:"soundManager.onready(): Function object expected"};
    this.supported = function () {
        return(e._didInit && !e._disabled)
    };
    this.getMovie = function (h) {
        return e.isIE ? window[h] : (e.isSafari ? g(h) || document[h] : g(h))
    };
    this.loadFromXML = function (h) {
        try {
            e.o._loadFromXML(h)
        } catch (i) {
            e._failSafely();
            return true
        }
    };
    this.createSound = function (i) {
        var l = "soundManager.createSound(): ";
        if (!e._didInit) {
            throw e._complain(l + e.strings.notReady, arguments.callee.caller)
        }
        if (arguments.length == 2) {
            i = {id:arguments[0], url:arguments[1]}
        }
        var j = e._mergeObjects(i);
        var h = j;
        if (h.id.toString().charAt(0).match(/^[0-9]$/)) {
            var k = l + 'Warning: Sound ID "' + h.id + '" should be a string, starting with a non-numeric character'
        }
        if (e._idCheck(h.id, true)) {
            return e.sounds[h.id]
        }
        if (e.flashVersion > 8 && e.useMovieStar) {
            if (h.isMovieStar === null) {
                h.isMovieStar = (h.url.match(e.netStreamPattern) ? true : false)
            }
            if (h.isMovieStar && (h.usePeakData || h.useWaveformData || h.useEQData)) {
                h.usePeakData = false;
                h.useWaveformData = false;
                h.useEQData = false
            }
        }
        e.sounds[h.id] = new f(h);
        e.soundIDs[e.soundIDs.length] = h.id;
        if (e.flashVersion == 8) {
            e.o._createSound(h.id, h.onjustbeforefinishtime)
        } else {
            e.o._createSound(h.id, h.url, h.onjustbeforefinishtime, h.usePeakData, h.useWaveformData, h.useEQData, h.isMovieStar, (h.isMovieStar ? h.useVideo : false), (h.isMovieStar ? h.bufferTime : false))
        }
        if (h.autoLoad || h.autoPlay) {
            if (e.sounds[h.id]) {
                e.sounds[h.id].load(h)
            }
        }
        if (h.autoPlay) {
            e.sounds[h.id].play()
        }
        return e.sounds[h.id]
    };
    this.createVideo = function (h) {
        if (arguments.length == 2) {
            h = {id:arguments[0], url:arguments[1]}
        }
        if (e.flashVersion >= 9) {
            h.isMovieStar = true;
            h.useVideo = true
        } else {
            return false
        }
        return e.createSound(h)
    };
    this.destroySound = function (j, h) {
        if (!e._idCheck(j)) {
            return false
        }
        for (var k = 0; k < e.soundIDs.length; k++) {
            if (e.soundIDs[k] == j) {
                e.soundIDs.splice(k, 1);
                continue
            }
        }
        e.sounds[j].unload();
        if (!h) {
            e.sounds[j].destruct()
        }
        delete e.sounds[j]
    };
    this.destroyVideo = this.destroySound;
    this.load = function (h, i) {
        if (!e._idCheck(h)) {
            return false
        }
        e.sounds[h].load(i)
    };
    this.unload = function (h) {
        if (!e._idCheck(h)) {
            return false
        }
        e.sounds[h].unload()
    };
    this.play = function (h, i) {
        if (!e._didInit) {
            throw e._complain("soundManager.play(): " + e.strings.notReady, arguments.callee.caller)
        }
        if (!e._idCheck(h)) {
            if (typeof i != "Object") {
                i = {url:i}
            }
            if (i && i.url) {
                i.id = h;
                e.createSound(i)
            } else {
                return false
            }
        }
        e.sounds[h].play(i)
    };
    this.start = this.play;
    this.setPosition = function (h, i) {
        if (!e._idCheck(h)) {
            return false
        }
        e.sounds[h].setPosition(i)
    };
    this.stop = function (h) {
        if (!e._idCheck(h)) {
            return false
        }
        e.sounds[h].stop()
    };
    this.stopAll = function () {
        for (var h in e.sounds) {
            if (e.sounds[h] instanceof f) {
                e.sounds[h].stop()
            }
        }
    };
    this.pause = function (h) {
        if (!e._idCheck(h)) {
            return false
        }
        e.sounds[h].pause()
    };
    this.pauseAll = function () {
        for (var h = e.soundIDs.length; h--;) {
            e.sounds[e.soundIDs[h]].pause()
        }
    };
    this.resume = function (h) {
        if (!e._idCheck(h)) {
            return false
        }
        e.sounds[h].resume()
    };
    this.resumeAll = function () {
        for (var h = e.soundIDs.length; h--;) {
            e.sounds[e.soundIDs[h]].resume()
        }
    };
    this.togglePause = function (h) {
        if (!e._idCheck(h)) {
            return false
        }
        e.sounds[h].togglePause()
    };
    this.setPan = function (h, i) {
        if (!e._idCheck(h)) {
            return false
        }
        e.sounds[h].setPan(i)
    };
    this.setVolume = function (i, h) {
        if (!e._idCheck(i)) {
            return false
        }
        e.sounds[i].setVolume(h)
    };
    this.mute = function (h) {
        if (typeof h != "string") {
            h = null
        }
        if (!h) {
            for (var j = e.soundIDs.length; j--;) {
                e.sounds[e.soundIDs[j]].mute()
            }
            e.muted = true
        } else {
            if (!e._idCheck(h)) {
                return false
            }
            e.sounds[h].mute()
        }
    };
    this.muteAll = function () {
        e.mute()
    };
    this.unmute = function (h) {
        if (typeof h != "string") {
            h = null
        }
        if (!h) {
            for (var j = e.soundIDs.length; j--;) {
                e.sounds[e.soundIDs[j]].unmute()
            }
            e.muted = false
        } else {
            if (!e._idCheck(h)) {
                return false
            }
            e.sounds[h].unmute()
        }
    };
    this.unmuteAll = function () {
        e.unmute()
    };
    this.toggleMute = function (h) {
        if (!e._idCheck(h)) {
            return false
        }
        e.sounds[h].toggleMute()
    };
    this.getMemoryUse = function () {
        if (e.flashVersion == 8) {
            return 0
        }
        if (e.o) {
            return parseInt(e.o._getMemoryUse(), 10)
        }
    };
    this.disable = function (j) {
        if (typeof j == "undefined") {
            j = false
        }
        if (e._disabled) {
            return false
        }
        e._disabled = true;
        for (var h = e.soundIDs.length; h--;) {
            e._disableObject(e.sounds[e.soundIDs[h]])
        }
        e.initComplete(j)
    };
    this.canPlayURL = function (h) {
        return(h ? (h.match(e.filePattern) ? true : false) : null)
    };
    this.getSoundById = function (i, j) {
        if (!i) {
            throw new Error("SoundManager.getSoundById(): sID is null/undefined")
        }
        var h = e.sounds[i];
        return h
    };
    this.onready = function (i, h) {
        if (i && i instanceof Function) {
            if (!h) {
                h = window
            }
            e._addOnReady(i, h);
            e._processOnReady();
            return true
        } else {
            throw e.strings.needFunction
        }
    };
    this.oninitmovie = function () {
    };
    this.onload = function () {
        soundManager._wD("soundManager.onload()", 1)
    };
    this.onerror = function () {
    };
    this._idCheck = this.getSoundById;
    this._complain = function (i, k) {
        var j = "Error: ";
        if (!k) {
            return new Error(j + i)
        }
        var m = new Error("");
        var n = null;
        if (m.stack) {
            try {
                var o = "@";
                var p = m.stack.split(o);
                n = p[4]
            } catch (l) {
                n = m.stack
            }
        }
        if (typeof console != "undefined" && typeof console.trace != "undefined") {
            console.trace()
        }
        var h = j + i + ". \nCaller: " + k.toString() + (m.stack ? " \nTop of stacktrace: " + n : (m.message ? " \nMessage: " + m.message : ""));
        return new Error(h)
    };
    var c = function () {
        return false
    };
    c._protected = true;
    this._disableObject = function (i) {
        for (var h in i) {
            if (typeof i[h] == "function" && typeof i[h]._protected == "undefined") {
                i[h] = c
            }
        }
        h = null
    };
    this._failSafely = function (h) {
        if (typeof h == "undefined") {
            h = false
        }
        if (!e._disabled || h) {
            e.disable(h)
        }
    };
    this._normalizeMovieURL = function (h) {
        var i = null;
        if (h) {
            if (h.match(/\.swf(\?.*)?$/i)) {
                i = h.substr(h.toLowerCase().lastIndexOf(".swf?") + 4);
                if (i) {
                    return h
                }
            } else {
                if (h.lastIndexOf("/") != h.length - 1) {
                    h = h + "/"
                }
            }
        }
        return(h && h.lastIndexOf("/") != -1 ? h.substr(0, h.lastIndexOf("/") + 1) : "./") + e.movieURL
    };
    this._getDocument = function () {
        return(document.body ? document.body : (document.documentElement ? document.documentElement : document.getElementsByTagName("div")[0]))
    };
    this._getDocument._protected = true;
    this._setPolling = function (h, i) {
        if (!e.o || !e.allowPolling) {
            return false
        }
        e.o._setPolling(h, i)
    };
    this._createMovie = function (w, m) {
        var r = null;
        var v = (m ? m : e.url);
        var q = (e.altURL ? e.altURL : v);
        if (e.debugURLParam.test(window.location.href.toString())) {
            e.debugMode = true
        }
        if (e._didAppend && e._appendSuccess) {
            return false
        }
        e._didAppend = true;
        e._setVersionInfo();
        e.url = e._normalizeMovieURL(e._overHTTP ? v : q);
        m = e.url;
        if (e.useHighPerformance && e.useMovieStar && e.defaultOptions.useVideo === true) {
            r = "soundManager note: disabling highPerformance, not applicable with movieStar mode + useVideo";
            e.useHighPerformance = false
        }
        e.wmode = (!e.wmode && e.useHighPerformance && !e.useMovieStar ? "transparent" : e.wmode);
        if (e.wmode !== null && e.flashLoadTimeout !== 0 && !e.useHighPerformance && !e.isIE && navigator.platform.match(/win32/i)) {
            e.specialWmodeCase = true;
            e.wmode = null
        }
        if (e.flashVersion == 8) {
            e.allowFullScreen = false
        }
        var A = {name:w, id:w, src:m, width:"100%", height:"100%", quality:"high", allowScriptAccess:"always", bgcolor:e.bgColor, pluginspage:"http://www.macromedia.com/go/getflashplayer", type:"application/x-shockwave-flash", wmode:e.wmode, allowfullscreen:(e.allowFullScreen ? "true" : "false")};
        if (!e.wmode) {
            delete A.wmode
        }
        var n = null;
        var z = null;
        if (e.isIE) {
            n = document.createElement("div");
            var t = '<object id="' + w + '" data="' + m + '" type="application/x-shockwave-flash" width="100%" height="100%"><param name="movie" value="' + m + '" /><param name="AllowScriptAccess" value="always" /><param name="quality" value="high" />' + (e.wmode ? '<param name="wmode" value="' + e.wmode + '" /> ' : "") + '<param name="bgcolor" value="' + e.bgColor + '" /><param name="allowFullScreen" value="' + (e.allowFullScreen ? "true" : "false") + '" /><!-- --></object>'
        } else {
            n = document.createElement("embed");
            for (z in A) {
                if (A.hasOwnProperty(z)) {
                    n.setAttribute(z, A[z])
                }
            }
        }
        var i = document.createElement("div");
        i.id = e.debugID + "-toggle";
        var j = {position:"fixed", bottom:"0px", right:"0px", width:"1.2em", height:"1.2em", lineHeight:"1.2em", margin:"2px", textAlign:"center", border:"1px solid #999", cursor:"pointer", background:"#fff", color:"#333", zIndex:10001};
        i.appendChild(document.createTextNode("-"));
        i.onclick = e._toggleDebug;
        i.title = "Toggle SM2 debug console";
        if (navigator.userAgent.match(/msie 6/i)) {
            i.style.position = "absolute";
            i.style.cursor = "hand"
        }
        for (z in j) {
            if (j.hasOwnProperty(z)) {
                i.style[z] = j[z]
            }
        }
        var u = e._getDocument();
        if (u) {
            e.oMC = g("sm2-container") ? g("sm2-container") : document.createElement("div");
            if (!e.oMC.id) {
                e.oMC.id = "sm2-container";
                e.oMC.className = "movieContainer";
                var o = null;
                var p = null;
                if (e.useHighPerformance) {
                    o = {position:"fixed", width:"8px", height:"8px", bottom:"0px", left:"0px", overflow:"hidden"}
                } else {
                    o = {position:"absolute", width:"8px", height:"8px", top:"-9999px", left:"-9999px"}
                }
                var k = null;
                for (k in o) {
                    if (o.hasOwnProperty(k)) {
                        e.oMC.style[k] = o[k]
                    }
                }
                try {
                    if (!e.isIE) {
                        e.oMC.appendChild(n)
                    }
                    u.appendChild(e.oMC);
                    if (e.isIE) {
                        p = e.oMC.appendChild(document.createElement("div"));
                        p.className = "sm2-object-box";
                        p.innerHTML = t
                    }
                    e._appendSuccess = true
                } catch (y) {
                    throw new Error(e.strings.appXHTML)
                }
            } else {
                e.oMC.appendChild(n);
                if (e.isIE) {
                    p = e.oMC.appendChild(document.createElement("div"));
                    p.className = "sm2-object-box";
                    p.innerHTML = t
                }
                e._appendSuccess = true
            }
            if (!g(e.debugID) && ((!e._hasConsole || !e.useConsole) || (e.useConsole && e._hasConsole && !e.consoleOnly))) {
                var l = document.createElement("div");
                l.id = e.debugID;
                l.style.display = (e.debugMode ? "block" : "none");
                if (e.debugMode && !g(i.id)) {
                    try {
                        u.appendChild(i)
                    } catch (h) {
                        throw new Error(e.strings.appXHTML)
                    }
                    u.appendChild(l)
                }
            }
            u = null
        }
    };
    this._writeDebug = function (i, p, k) {
        if (!e.debugMode) {
            return false
        }
        if (typeof k != "undefined" && k) {
            i = i + " | " + new Date().getTime()
        }
        if (e._hasConsole && e.useConsole) {
            var h = e._debugLevels[p];
            if (typeof console[h] != "undefined") {
                console[h](i)
            } else {
                console.log(i)
            }
            if (e.useConsoleOnly) {
                return true
            }
        }
        var n = "soundmanager-debug";
        try {
            var m = g(n);
            if (!m) {
                return false
            }
            var l = document.createElement("div");
            if (++e._wdCount % 2 === 0) {
                l.className = "sm2-alt"
            }
            if (typeof p == "undefined") {
                p = 0
            } else {
                p = parseInt(p, 10)
            }
            l.appendChild(document.createTextNode(i));
            if (p) {
                if (p >= 2) {
                    l.style.fontWeight = "bold"
                }
                if (p == 3) {
                    l.style.color = "#ff3333"
                }
            }
            m.insertBefore(l, m.firstChild)
        } catch (j) {
        }
        m = null
    };
    this._writeDebug._protected = true;
    this._wdCount = 0;
    this._wdCount._protected = true;
    this._wD = this._writeDebug;
    this._wDAlert = function (h) {
        alert(h)
    };
    if (window.location.href.indexOf("debug=alert") + 1 && e.debugMode) {
        e._wD = e._wDAlert
    }
    this._toggleDebug = function () {
        var i = g(e.debugID);
        var h = g(e.debugID + "-toggle");
        if (!i) {
            return false
        }
        if (e._debugOpen) {
            h.innerHTML = "+";
            i.style.display = "none"
        } else {
            h.innerHTML = "-";
            i.style.display = "block"
        }
        e._debugOpen = !e._debugOpen
    };
    this._toggleDebug._protected = true;
    this._debug = function () {
        for (var k = 0, h = e.soundIDs.length; k < h; k++) {
            e.sounds[e.soundIDs[k]]._debug()
        }
    };
    this._debugTS = function (k, h, i) {
        if (typeof sm2Debugger != "undefined") {
            try {
                sm2Debugger.handleEvent(k, h, i)
            } catch (j) {
            }
        }
    };
    this._debugTS._protected = true;
    this._mergeObjects = function (j, h) {
        var m = {};
        for (var k in j) {
            if (j.hasOwnProperty(k)) {
                m[k] = j[k]
            }
        }
        var l = (typeof h == "undefined" ? e.defaultOptions : h);
        for (var n in l) {
            if (l.hasOwnProperty(n) && typeof m[n] == "undefined") {
                m[n] = l[n]
            }
        }
        return m
    };
    this.createMovie = function (h) {
        if (h) {
            e.url = h
        }
        e._initMovie()
    };
    this.go = this.createMovie;
    this._initMovie = function () {
        if (e.o) {
            return false
        }
        e.o = e.getMovie(e.id);
        if (!e.o) {
            if (!e.oRemoved) {
                e._createMovie(e.id, e.url)
            } else {
                if (!e.isIE) {
                    e.oMC.appendChild(e.oRemoved)
                } else {
                    e.oMC.innerHTML = e.oRemovedHTML
                }
                e.oRemoved = null;
                e._didAppend = true
            }
            e.o = e.getMovie(e.id)
        }
        if (typeof e.oninitmovie == "function") {
            setTimeout(e.oninitmovie, 1)
        }
    };
    this.waitForExternalInterface = function () {
        if (e._waitingForEI) {
            return false
        }
        e._waitingForEI = true;
        if (e._tryInitOnFocus && !e._isFocused) {
            return false
        }
        if (e.flashLoadTimeout > 0) {
            if (!e._didInit) {
            }
            setTimeout(function () {
                if (!e._didInit && e._okToDisable) {
                    e._failSafely(true)
                }
            }, e.flashLoadTimeout)
        }
    };
    this.handleFocus = function () {
        if (e._isFocused || !e._tryInitOnFocus) {
            return true
        }
        e._okToDisable = true;
        e._isFocused = true;
        if (e._tryInitOnFocus) {
            window.removeEventListener("mousemove", e.handleFocus, false)
        }
        e._waitingForEI = false;
        setTimeout(e.waitForExternalInterface, 500);
        if (window.removeEventListener) {
            window.removeEventListener("focus", e.handleFocus, false)
        } else {
            if (window.detachEvent) {
                window.detachEvent("onfocus", e.handleFocus)
            }
        }
    };
    this.initComplete = function (h) {
        if (e._didInit) {
            return false
        }
        e._didInit = true;
        if (e._disabled || h) {
            e._processOnReady();
            e._debugTS("onload", false);
            e.onerror.apply(window);
            return false
        } else {
            e._debugTS("onload", true)
        }
        if (e.waitForWindowLoad && !e._windowLoaded) {
            if (window.addEventListener) {
                window.addEventListener("load", e._initUserOnload, false)
            } else {
                if (window.attachEvent) {
                    window.attachEvent("onload", e._initUserOnload)
                }
            }
            return false
        } else {
            e._initUserOnload()
        }
    };
    this._addOnReady = function (i, h) {
        e._onready.push({method:i, scope:(h || null), fired:false})
    };
    this._processOnReady = function () {
        if (!e._didInit) {
            return false
        }
        var k = {success:(!e._disabled)};
        var h = [];
        for (var m = 0, l = e._onready.length; m < l; m++) {
            if (e._onready[m].fired !== true) {
                h.push(e._onready[m])
            }
        }
        if (h.length) {
            for (m = 0, l = h.length; m < l; m++) {
                if (h[m].scope) {
                    h[m].method.apply(h[m].scope, [k])
                } else {
                    h[m].method(k)
                }
                h[m].fired = true
            }
        }
    };
    this._initUserOnload = function () {
        window.setTimeout(function () {
            e._processOnReady();
            e.onload.apply(window)
        })
    };
    this.init = function () {
        e._initMovie();
        if (e._didInit) {
            return false
        }
        if (window.removeEventListener) {
            window.removeEventListener("load", e.beginDelayedInit, false)
        } else {
            if (window.detachEvent) {
                window.detachEvent("onload", e.beginDelayedInit)
            }
        }
        try {
            e.o._externalInterfaceTest(false);
            e._setPolling(true, e.useFastPolling ? true : false);
            if (!e.debugMode) {
                e.o._disableDebug()
            }
            e.enabled = true;
            e._debugTS("jstoflash", true)
        } catch (h) {
            e._debugTS("jstoflash", false);
            e._failSafely(true);
            e.initComplete();
            return false
        }
        e.initComplete()
    };
    this.beginDelayedInit = function () {
        e._windowLoaded = true;
        setTimeout(e.waitForExternalInterface, 500);
        setTimeout(e.beginInit, 20)
    };
    this.beginInit = function () {
        if (e._initPending) {
            return false
        }
        e.createMovie();
        e._initMovie();
        e._initPending = true;
        return true
    };
    this.domContentLoaded = function () {
        if (document.removeEventListener) {
            document.removeEventListener("DOMContentLoaded", e.domContentLoaded, false)
        }
        e.go()
    };
    this._externalInterfaceOK = function () {
        if (e.swfLoaded) {
            return false
        }
        e._debugTS("swf", true);
        e._debugTS("flashtojs", true);
        e.swfLoaded = true;
        e._tryInitOnFocus = false;
        if (e.isIE) {
            setTimeout(e.init, 100)
        } else {
            e.init()
        }
    };
    this._setSandboxType = function (h) {
        var i = e.sandbox;
        i.type = h;
        i.description = i.types[(typeof i.types[h] != "undefined" ? h : "unknown")];
        if (i.type == "localWithFile") {
            i.noRemote = true;
            i.noLocal = false
        } else {
            if (i.type == "localWithNetwork") {
                i.noRemote = false;
                i.noLocal = true
            } else {
                if (i.type == "localTrusted") {
                    i.noRemote = false;
                    i.noLocal = false
                }
            }
        }
    };
    this.reboot = function () {
        for (var h = e.soundIDs.length; h--;) {
            e.sounds[e.soundIDs[h]].destruct()
        }
        try {
            if (e.isIE) {
                e.oRemovedHTML = e.o.innerHTML
            }
            e.oRemoved = e.o.parentNode.removeChild(e.o)
        } catch (j) {
        }
        e.enabled = false;
        e._didInit = false;
        e._waitingForEI = false;
        e._initPending = false;
        e._didAppend = false;
        e._appendSuccess = false;
        e._disabled = false;
        e._waitingforEI = true;
        e.swfLoaded = false;
        e.soundIDs = {};
        e.sounds = [];
        e.o = null;
        for (h = e._onready.length; h--;) {
            e._onready[h].fired = false
        }
        window.setTimeout(soundManager.beginDelayedInit, 20)
    };
    this.destruct = function () {
        e.disable(true)
    };
    f = function (h) {
        var i = this;
        this.sID = h.id;
        this.url = h.url;
        this.options = e._mergeObjects(h);
        this.instanceOptions = this.options;
        this._iO = this.instanceOptions;
        this.pan = this.options.pan;
        this.volume = this.options.volume;
        this._lastURL = null;
        this._debug = function () {
            if (e.debugMode) {
                var l = null;
                var n = [];
                var k = null;
                var m = null;
                var j = 64;
                for (l in i.options) {
                    if (i.options[l] !== null) {
                        if (i.options[l] instanceof Function) {
                            k = i.options[l].toString();
                            k = k.replace(/\s\s+/g, " ");
                            m = k.indexOf("{");
                            n[n.length] = " " + l + ": {" + k.substr(m + 1, (Math.min(Math.max(k.indexOf("\n") - 1, j), j))).replace(/\n/g, "") + "... }"
                        } else {
                            n[n.length] = " " + l + ": " + i.options[l]
                        }
                    }
                }
            }
        };
        this._debug();
        this.id3 = {};
        this.resetProperties = function (j) {
            i.bytesLoaded = null;
            i.bytesTotal = null;
            i.position = null;
            i.duration = null;
            i.durationEstimate = null;
            i.loaded = false;
            i.playState = 0;
            i.paused = false;
            i.readyState = 0;
            i.muted = false;
            i.didBeforeFinish = false;
            i.didJustBeforeFinish = false;
            i.isBuffering = false;
            i.instanceOptions = {};
            i.instanceCount = 0;
            i.peakData = {left:0, right:0};
            i.waveformData = {left:[], right:[]};
            i.eqData = []
        };
        i.resetProperties();
        this.load = function (j) {
            if (typeof j != "undefined") {
                i._iO = e._mergeObjects(j);
                i.instanceOptions = i._iO
            } else {
                j = i.options;
                i._iO = j;
                i.instanceOptions = i._iO;
                if (i._lastURL && i._lastURL != i.url) {
                    i._iO.url = i.url;
                    i.url = null
                }
            }
            if (typeof i._iO.url == "undefined") {
                i._iO.url = i.url
            }
            if (i._iO.url == i.url && i.readyState !== 0 && i.readyState != 2) {
                return false
            }
            i.url = i._iO.url;
            i._lastURL = i._iO.url;
            i.loaded = false;
            i.readyState = 1;
            i.playState = 0;
            try {
                if (e.flashVersion == 8) {
                    e.o._load(i.sID, i._iO.url, i._iO.stream, i._iO.autoPlay, (i._iO.whileloading ? 1 : 0))
                } else {
                    e.o._load(i.sID, i._iO.url, i._iO.stream ? true : false, i._iO.autoPlay ? true : false);
                    if (i._iO.isMovieStar && i._iO.autoLoad && !i._iO.autoPlay) {
                        i.pause()
                    }
                }
            } catch (k) {
                e._debugTS("onload", false);
                e.onerror();
                e.disable()
            }
        };
        this.unload = function () {
            if (i.readyState !== 0) {
                if (i.readyState != 2) {
                    i.setPosition(0, true)
                }
                e.o._unload(i.sID, e.nullURL);
                i.resetProperties()
            }
        };
        this.destruct = function () {
            e.o._destroySound(i.sID);
            e.destroySound(i.sID, true)
        };
        this.play = function (k) {
            if (!k) {
                k = {}
            }
            i._iO = e._mergeObjects(k, i._iO);
            i._iO = e._mergeObjects(i._iO, i.options);
            i.instanceOptions = i._iO;
            if (i.playState == 1) {
                var j = i._iO.multiShot;
                if (!j) {
                    return false
                }
            }
            if (!i.loaded) {
                if (i.readyState === 0) {
                    i._iO.stream = true;
                    i._iO.autoPlay = true;
                    i.load(i._iO)
                } else {
                    if (i.readyState == 2) {
                        return false
                    }
                }
            }
            if (i.paused) {
                i.resume()
            } else {
                i.playState = 1;
                if (!i.instanceCount || e.flashVersion > 8) {
                    i.instanceCount++
                }
                i.position = (typeof i._iO.position != "undefined" && !isNaN(i._iO.position) ? i._iO.position : 0);
                if (i._iO.onplay) {
                    i._iO.onplay.apply(i)
                }
                i.setVolume(i._iO.volume, true);
                i.setPan(i._iO.pan, true);
                e.o._start(i.sID, i._iO.loop || 1, (e.flashVersion == 9 ? i.position : i.position / 1000))
            }
        };
        this.start = this.play;
        this.stop = function (j) {
            if (i.playState == 1) {
                i.playState = 0;
                i.paused = false;
                if (i._iO.onstop) {
                    i._iO.onstop.apply(i)
                }
                e.o._stop(i.sID, j);
                i.instanceCount = 0;
                i._iO = {}
            }
        };
        this.setPosition = function (k, j) {
            if (typeof k == "undefined") {
                k = 0
            }
            var l = Math.min(i.duration, Math.max(k, 0));
            i._iO.position = l;
            e.o._setPosition(i.sID, (e.flashVersion == 9 ? i._iO.position : i._iO.position / 1000), (i.paused || !i.playState))
        };
        this.pause = function () {
            if (i.paused || i.playState === 0) {
                return false
            }
            i.paused = true;
            e.o._pause(i.sID);
            if (i._iO.onpause) {
                i._iO.onpause.apply(i)
            }
        };
        this.resume = function () {
            if (!i.paused || i.playState === 0) {
                return false
            }
            i.paused = false;
            e.o._pause(i.sID);
            if (i._iO.onresume) {
                i._iO.onresume.apply(i)
            }
        };
        this.togglePause = function () {
            if (i.playState === 0) {
                i.play({position:(e.flashVersion == 9 ? i.position : i.position / 1000)});
                return false
            }
            if (i.paused) {
                i.resume()
            } else {
                i.pause()
            }
        };
        this.setPan = function (k, j) {
            if (typeof k == "undefined") {
                k = 0
            }
            if (typeof j == "undefined") {
                j = false
            }
            e.o._setPan(i.sID, k);
            i._iO.pan = k;
            if (!j) {
                i.pan = k
            }
        };
        this.setVolume = function (j, k) {
            if (typeof j == "undefined") {
                j = 100
            }
            if (typeof k == "undefined") {
                k = false
            }
            e.o._setVolume(i.sID, (e.muted && !i.muted) || i.muted ? 0 : j);
            i._iO.volume = j;
            if (!k) {
                i.volume = j
            }
        };
        this.mute = function () {
            i.muted = true;
            e.o._setVolume(i.sID, 0)
        };
        this.unmute = function () {
            i.muted = false;
            var j = typeof i._iO.volume != "undefined";
            e.o._setVolume(i.sID, j ? i._iO.volume : i.options.volume)
        };
        this.toggleMute = function () {
            if (i.muted) {
                i.unmute()
            } else {
                i.mute()
            }
        };
        this._whileloading = function (j, k, l) {
            if (!i._iO.isMovieStar) {
                i.bytesLoaded = j;
                i.bytesTotal = k;
                i.duration = Math.floor(l);
                i.durationEstimate = parseInt((i.bytesTotal / i.bytesLoaded) * i.duration, 10);
                if (i.durationEstimate === undefined) {
                    i.durationEstimate = i.duration
                }
                if (i.readyState != 3 && i._iO.whileloading) {
                    i._iO.whileloading.apply(i)
                }
            } else {
                i.bytesLoaded = j;
                i.bytesTotal = k;
                i.duration = Math.floor(l);
                i.durationEstimate = i.duration;
                if (i.readyState != 3 && i._iO.whileloading) {
                    i._iO.whileloading.apply(i)
                }
            }
        };
        this._onid3 = function (n, k) {
            var o = [];
            for (var m = 0, l = n.length; m < l; m++) {
                o[n[m]] = k[m]
            }
            i.id3 = e._mergeObjects(i.id3, o);
            if (i._iO.onid3) {
                i._iO.onid3.apply(i)
            }
        };
        this._whileplaying = function (k, l, n, j, m) {
            if (isNaN(k) || k === null) {
                return false
            }
            if (i.playState === 0 && k > 0) {
                k = 0
            }
            i.position = k;
            if (i._iO.usePeakData && typeof l != "undefined" && l) {
                i.peakData = {left:l.leftPeak, right:l.rightPeak}
            }
            if (i._iO.useWaveformData && typeof n != "undefined" && n) {
                i.waveformData = {left:n.split(","), right:j.split(",")}
            }
            if (i._iO.useEQData && typeof m != "undefined" && m) {
                i.eqData = m
            }
            if (i.playState == 1) {
                if (i.isBuffering) {
                    i._onbufferchange(0)
                }
                if (i._iO.whileplaying) {
                    i._iO.whileplaying.apply(i)
                }
                if (i.loaded && i._iO.onbeforefinish && i._iO.onbeforefinishtime && !i.didBeforeFinish && i.duration - i.position <= i._iO.onbeforefinishtime) {
                    i._onbeforefinish()
                }
            }
        };
        this._onload = function (j) {
            j = (j == 1 ? true : false);
            i.loaded = j;
            i.readyState = j ? 3 : 2;
            if (i._iO.onload) {
                i._iO.onload.apply(i)
            }
        };
        this._onbeforefinish = function () {
            if (!i.didBeforeFinish) {
                i.didBeforeFinish = true;
                if (i._iO.onbeforefinish) {
                    i._iO.onbeforefinish.apply(i)
                }
            }
        };
        this._onjustbeforefinish = function (j) {
            if (!i.didJustBeforeFinish) {
                i.didJustBeforeFinish = true;
                if (i._iO.onjustbeforefinish) {
                    i._iO.onjustbeforefinish.apply(i)
                }
            }
        };
        this._onfinish = function () {
            if (i._iO.onbeforefinishcomplete) {
                i._iO.onbeforefinishcomplete.apply(i)
            }
            i.didBeforeFinish = false;
            i.didJustBeforeFinish = false;
            if (i.instanceCount) {
                i.instanceCount--;
                if (!i.instanceCount) {
                    i.playState = 0;
                    i.paused = false;
                    i.instanceCount = 0;
                    i.instanceOptions = {}
                }
                if (!i.instanceCount || i._iO.multiShotEvents) {
                    if (i._iO.onfinish) {
                        i._iO.onfinish.apply(i)
                    }
                }
            } else {
                if (i.useVideo) {
                }
            }
        };
        this._onmetadata = function (j) {
            if (!j.width && !j.height) {
                j.width = 320;
                j.height = 240
            }
            i.metadata = j;
            i.width = j.width;
            i.height = j.height;
            if (i._iO.onmetadata) {
                i._iO.onmetadata.apply(i)
            }
        };
        this._onbufferchange = function (j) {
            if (i.playState === 0) {
                return false
            }
            if (j == i.isBuffering) {
                return false
            }
            i.isBuffering = (j == 1 ? true : false);
            if (i._iO.onbufferchange) {
                i._iO.onbufferchange.apply(i)
            }
        };
        this._ondataerror = function (j) {
            if (i.playState > 0) {
                if (i._iO.ondataerror) {
                    i._iO.ondataerror.apply(i)
                }
            }
        }
    };
    this._onfullscreenchange = function (h) {
        e.isFullScreen = (h == 1 ? true : false);
        if (!e.isFullScreen) {
            try {
                window.focus()
            } catch (i) {
            }
        }
    };
    if (window.addEventListener) {
        window.addEventListener("focus", e.handleFocus, false);
        window.addEventListener("load", e.beginDelayedInit, false);
        window.addEventListener("unload", e.destruct, false);
        if (e._tryInitOnFocus) {
            window.addEventListener("mousemove", e.handleFocus, false)
        }
    } else {
        if (window.attachEvent) {
            window.attachEvent("onfocus", e.handleFocus);
            window.attachEvent("onload", e.beginDelayedInit);
            window.attachEvent("unload", e.destruct)
        } else {
            e._debugTS("onload", false);
            soundManager.onerror();
            soundManager.disable()
        }
    }
    if (document.addEventListener) {
        document.addEventListener("DOMContentLoaded", e.domContentLoaded, false)
    }
}
if (typeof SM2_DEFER == "undefined" || !SM2_DEFER) {
    soundManager = new SoundManager()
}
;