/* Autogenerated at Mon Sep 26 11:12:08 PDT 2011 */
;
/* Source: amznJQ.js */
//! ################################################################
//! Copyright (c) 2008 Amazon.com, Inc., and its Affiliates.
//! All rights reserved.
//! Not to be reused without permission
//! $DateTime: 2011/09/26 18:07:39 $
//! ################################################################
// $Id: //brazil/src/shared/interface/AmazonJQScripts/jquery-migration/browser-scripts/source/amazonJQ/amznJQ.js#5 $
// $Change: 4564756 $
// $Revision: #5 $


(function(jQuery) {
    var $ = jQuery;

    // do nothing if jQuery failed to load.  Can happen during development
    // if the jQuery library fails to load and this one does.  Create the
    // same state as would exist if the combined "standard mode" file failed
    // to load.  I.e. do nothing if jQuery isn't defined.
    if (!jQuery)
        return;

    // Create the runtime version of amznJQ, replacing the scaffold one from the bootstrap
    // private data members
    var bootstrapAmznJQ = window.amznJQ;

    if (!window.goN2Debug){
	window.goN2Debug = new function() {
		this.info = function() { }
		return this; 
	};
    }

    window.amznJQ = new function() {
        goN2Debug.info('amazonJQ: defining "real" window.amznJQ');

        // Amazon standards:
        // 1: jQuery is run in noConflict mode, per RCX JSET team, mid 2008.
        // 2: On sites, such as Associates' sites, on which another version of
        //    jQuery is loaded before our version, we leave the already-loaded
        //    version in place.  Our current version is always available as
        //    amznJQ.jQuery.  Code which needs to run on such sites (e.g.
        //    popovers) needs to use amznJQ.jQuery instead of window.jQuery.
        //    Per RCX JSET team, mid 2009.
        //
        // jQuery itself supports both configurations through the noConflict
        // method.
        //
        // Amazon appications may desire the standard $ notation.  Simply
        // execute the following:
        //    window.$ = amznJQ.jQuery;
        // (or the equivalent, if another version wasn't loaded before ours):
        //    window.$ = window.jQuery;
        this.jQuery = jQuery;
        jQuery.noConflict(true);
        // If jQuery wasn't previously loaded, window.jQuery is now undefined.
        // Fix it.  Warn for the unusual (Associates) case of already-loaded.
        if (window.jQuery) {
            goN2Debug.warning("amznJQ: 2 copies of jQuery loaded");
        }
        else {
            window.jQuery = jQuery;
        }

        // maps functionality (name) => { functionality, urls (list of script urls) }
        var _logicalToPhysical = {
            JQuery: { functionality: 'JQuery', urls: null },
            popover: { functionality: 'popover', urls: null } // included in the core
            // amazonShoveler declared inline on DP
        };

        // functionalities & files which have loaded
        var _func_loaded = {};
        var _url_loaded = {};

        // set of functionalities being loaded or requested prior to addLogical being called.
        var _loading = {};

        // private function to load all scripts for functionality.
        // logical-to-physical mapping must already have been set
        function _loadFunctionality(functionality) {
            var urls = _logicalToPhysical[functionality].urls;
            if (urls) {
                goN2Debug.info('amznJQ-_loadFunctionality for "'+functionality+'": '+urls.length+' urls');
                $.each(urls, function() {
                    // "this" now points to a URL
                    if (!_url_loaded[this]) {
                        _loadURL(this, functionality);
                    }
                });
            }
            else {
                goN2Debug.info('amznJQ-_loadFunctionality: no urls for "'+functionality+'"');
            }
        }

        // private function to load a script URL.
        // Works like jQuery.cacheScript(), without cache-busting random argument
        function _loadURL(url, functionality) {
            goN2Debug.info('amznJQ-_loadURL for "'+functionality+'", url "'+url+'"');
            $.ajax({
                type: 'GET',
                url: url,
                success: _onUrlLoadedFcn(url, functionality),
                dataType: 'script',
                cache: true
            });
        }

        // factory for function invoked when the URL has been loaded
        function _onUrlLoadedFcn(url, functionality) {
            return function() {
                goN2Debug.info('amznJQ-_loadURL success callback for "'+functionality+'"');

                _url_loaded[url] = true;
                var all_loaded = true;
                $.each(_logicalToPhysical[functionality].urls, function() {
                    // "this" now points to a URL
                    all_loaded = all_loaded && !!_url_loaded[this];
                });
                if (all_loaded) {
                    // Nothing to do for Amazon packages, which are expected to call declareAvailable.
                    // For other packages, check some known state (e.g. a global, or a member of jQuery.fn
                    // defined).
                    //FIXME: Expand to handle 3rd-party packages (addLogical needs a test function or some such).
                    //FIXME: Handle case that this message is received before the .js file is run
//                      goN2Debug.info('amznJQ-_loadURL success callback for "'+functionality+'" triggering .loaded, url "'+url+'"');
//                      _func_loaded[functionality] = true;
//                      $(document).trigger(functionality + '.loaded');
                }
            };
        }

        // public functions
        this.addLogical = function(
            functionality, // functionality name
            urls // list of script URLs.  null (not []) if built-in or already loaded.
        ) {
	    goN2Debug.info('amznJQ.addLogical for "'+functionality+'", with '+urls.length+' url(s) called');
            _logicalToPhysical[functionality] = {
                functionality: functionality,
                urls: urls
            };

            // FIXME: in the future, a null urls array should not be supported
            if (!urls) {
                this.declareAvailable(functionality);
                return;
            }

            if (_loading[functionality]) {
                // has already been requested
                _loadFunctionality(functionality);
            }
        };

        this.declareAvailable = function(
            functionality
        ) {
            goN2Debug.info('amznJQ.declareAvailable for"'+functionality+'" called');
            if (typeof _logicalToPhysical[functionality] == 'undefined') {
                _logicalToPhysical[functionality] = {
                    functionality: functionality,
                    urls: null
                };
            }
            _func_loaded[functionality] = true;
            $(document).trigger(functionality + '.loaded');
        };

        // Note: cannot use JavaScript for css styles which might be
        // depended on for customers in compatible browsers but with
        // JavaScript disabled.
        // ASSUMPTION: page has at lease one <style> element.
        this.addStyle = function(
            css_url  // URL to a CSS stylesheet. Will be loaded "immediately"
        ) {
            var dcss = document.styleSheets[0];
            if (dcss && dcss.addImport) {
                // Internet Explorer.
                while (dcss.imports.length >= 31) {
                    // each stylesheet object can have at most 31 imports
                    // HACK - add the import to the first imported stylesheet
                    // instead.
                    dcss = dcss.imports[0];
                }
                dcss.addImport(css_url);
            } else {
                $("style[type='text/css']:first").append('@import url("' + css_url + '");');
            }
        };

        // Add multiple styles to a page, whether external or in text
        // fragments.  Does not require existing <style> elements.
        this.addStyles = function(
            args  // object with 'urls' and/or 'styles' properties
        ) {
            var urls   = args.urls   || [];
            var styles = args.styles || [];

            // We've got some MSIE code in here.  Basically we jump
            // through some hoops to see if we have to do a hack to
            // work around a dumb limit of the browser on the number of
            // stylesheets it can use.
            var dcss = document.styleSheets;
            if (dcss && !dcss.length && document.createStyleSheet) {
                // no style tags in doc.  better make one for IE6 to avoid crashes later
                document.createStyleSheet();
            }
            // select first stylesheet object.
            dcss = dcss[0];

            // First, deal with the stylesheet URLs...
            // If there are no stylesheets at this point, we take the
            // else branch, which will crash IE6.  That is why we had
            // to make sure we created one earlier.
            if (dcss && dcss.addImport) {
                // Internet Explorer.
                $.each(urls, function(){
                    while (dcss.imports.length >= 31) {
                        // each stylesheet object can have at most 31 imports
                        // HACK - add the import to the first imported stylesheet
                        // instead.
                        dcss = dcss.imports[0];
                    }
                    dcss.addImport(this);
                });
            } else {
                // Everyone else...just put some link elements in the head.
                // This code is lethal to IE6!
                $.each(urls, function(){
                    var attrs = { type:'text/css', rel:'stylesheet', href:this };
                    $('head').append($('<link/>').attr(attrs));
                });
            }

            // Now, the literal CSS passed in as text.
            var css = '';
            $.each(styles, function(){css+=this;});
            if (css) {
                if (document.createStyleSheet) {
                    // appending text to a style element doesn't seem
                    // to work in IE6.  so we'll try this instead.
                    // it's in a try block because if you do it on a
                    // page that already has too many stylesheets, it
                    // will throw an exception.
                    try {
                        var sheet = document.createStyleSheet();
                        sheet.cssText = css;
                    } catch(e) { /* Notify some other object here? */ }
                } else {
                    // much easier.
                    $('head').append($('<style/>').attr({type:'text/css'}).append(css));
                }
            }
        };

        /**
         * Calls the specified function when functionality is available.
         * Features that can wait for the full DOM to be loaded should be using
         * onReady instead.
         */
        this.available = function(
            functionality, // functionality name
            eventCallbackFunction // eventCallbackFunction(jQuery) called when all requested functionality is available
        ) {
            if (_func_loaded[functionality]) {
                goN2Debug.info('amznJQ.available for "'+functionality+'": triggering .loaded directly -- already loaded');
                $(document).one(functionality + '.loaded', eventCallbackFunction);
                $(document).trigger(functionality + '.loaded');
            } else if (_loading[functionality]) {
                goN2Debug.info('amznJQ.available for"'+functionality+'": loading in process; calling .one');
                // has already been requested, but not yet loaded
                $(document).one(functionality + '.loaded', eventCallbackFunction);
            } else if (_logicalToPhysical[functionality]) {
                goN2Debug.info('amznJQ.available for "'+functionality+'": initiating load');
                _loading[functionality] = true;
                $(document).one(functionality + '.loaded', eventCallbackFunction);
                _loadFunctionality(functionality);
            } else {
                goN2Debug.info('amznJQ.available for "'+functionality+'": unknown functionality, setting event for later');
                // Perhaps the corresponding addLogical() hasn't been called yet?
                _loading[functionality] = true;
                $(document).one(functionality + '.loaded', eventCallbackFunction);
            }
        };

        /**
         * Similar to available(), but will only be called after document.ready
         * Useful for features that don't NEED to be functional early in the
         * page-load process.
         */
        this.onReady = function(
            functionality, // functionality name or array of names
            eventCallbackFunction // eventCallbackFunction(jQuery) called when all requested functionality is available
        ) {
            var ajq = this;
            $(function() {
                ajq.available(functionality, eventCallbackFunction);
            });
        };

        // variables to hold state of stages
        var _stage_completed = {};
        // these are guaranteed stages, which will be marked as complete on page load
        var _fail_safe_stages = [
             'amznJQ.theFold',
             'amznJQ.criticalFeature'
        ];

        /**
         * funtion for consumers to wait for stage completion
         */
        this.onCompletion = function(
          stage, // name of stage
          callbackFn // function will be called after completing state
        ) {
            if (_stage_completed[stage]) {
                goN2Debug.info('amznJQ.onCompletion("'+stage+'"): triggering callback as stage has reached');
                $(document).one(stage, callbackFn);
                $(document).trigger(stage);
            } else {
                goN2Debug.info('amznJQ.onCompletion("'+stage+'"): waiting for state to complete');
                $(document).one(stage, callbackFn);
            }
        };

        /**
         * funtion for consumers to notify stage completion
         * once a stage is marked complete subsequent calls will do nothing
         */
        this.completedStage = function(
          stage // name of stage
        ) {
            if (! _stage_completed[stage] ) {
              goN2Debug.info('amznJQ.completedStage("'+stage+'"): triggering callbacks');
              _stage_completed[stage] = true;
              $(document).trigger(stage);
            }
        };

        /**
         * listening to window onload event
         * this will trigger any guaranteed stages which are not marked as completed
         */
        this.windowOnLoad = function () {
            goN2Debug.info('amznJQ.windowOnLoad is called');
            $.each(_fail_safe_stages, function() {
                if (!_stage_completed[this]) {
                  goN2Debug.info('amznJQ.windowOnLoad: triggering stage ' + this);
                  _stage_completed[this] = true;
                  $(document).trigger(this);
                }
            });
        };

        // amznJQ.addPL(urlList);
        // This file is a preloader. It's intended to allow the caching of assets (JS, CSS, images) that are
        // not needed on this page, but will likely be needed soon. It's intended to have minimal impact on 
        // the hosting page and on the customer's CX.
        // 
        // Author: Eric Schurman (ericsc@)
        // Integration into amznJQ: JC Fant (jcfant@)
        //
        //==USAGE==
        // This method is designed to be coupled with the bootstrap. You should load urls via the addPL bootstrap 
        // method. HOWEVER, if you are unable to use the bootstrap you can call this at any time using the 
        // amznJQ.addPL(urlList) method. The preloading of assets will not start until 1 second after page load.
        // 
        // Files are specified to be preloaded in one of two ways:
        //   * Bootstrap: the bootstrap will out put any files you have added via mason components. Once the 
        //     onload event has been fired the preloader will wait 1 second and start caching files.
        //   * At any time you can call amznJQ.addPL() with a list of urls to be preloaded. If the page load event has
        //     already been fired, the preloader will immediately start caching files.
        //
        //=DETAILED DEVELOPMENT NOTES=
        // Many preloading implementations described on the internet can cause a variety of CX problems. 
        // I'm including a detailed discussion in this file to make it easier to avoid problems if there's 
        // future work on this file.
        //
        //==TECHNIQUES TO AVOID==
        // REAL LOAD IN IFRAME
        // The first implementation at Amazon simply created an IFRAME in which SCRIPT, LINK, 
        // and IMG tags were added to download the appropriate file types. The problem with this
        // is that those scripts and CSS files were actually compiled and executed, leading to 
        // a significant network, CPU, and memory impact on the hosting page, right at onload. 
        // 
        // SIMULTANEOUS NON-EXECUTING DOWNLOADS
        // In the technique described here: http://www.phpied.com/preload-cssjavascript-without-execution/
        // IMG or OBJECT tags are added to the DOM, one per file needed. Although this has the advantage
        // that script and CSS are not compiled or executed, this approach means all the prefetched items 
        // are requested simultaneously, which has a major negative impact on the customer's network. 
        // We saw this have a negative impact on when the uedata gif request was made, when onload completed,
        // and on CPU. It also meant that some useragents with limited connections couldn't request ajax
        // content during the prefetching.
        //
        // LINK REL="PREFETCH"
        // FF advertises an approach using <link rel=prefetch> (https://developer.mozilla.org/en/link_prefetching_faq)
        // However, it doesn't seem to work if you add link dynamically. It also seems very unpredictable in all cases.
        // As of this writing, Chrome supports this approach too - but in a very buggy way. It pegs the CPU and the 
        // app becomes unresponsive while prefetching is happening.
        //
        // GENERAL ISSUES TO WATCH FOR DURING DEVELOPMENT
        // Chrome 
        //      * While a file is being downloaded before page load, the cursor flashes and turns to a spinner
        // FF 
        //      * Many techniques peg the CPU.
        //      * The loading indicator in the tab shows a spinning circle whenever a file is being downloaded 
        //        before page load. Downloads after page load don't trigger this, but do make the status bar 
        //        show the file name.
        //      
        // Safari
        //      * Shows a loading bar when loading items in page, but not in an iframe.
        //      * Doesn't show loading bar for assets post page load.
        //      * May download but not actually cache assets with some approaches. 
        //
        // IE
        //      * IE has weird behavior with recursion triggered in event handlers that can cause stack overflows.
        //
        //==TECHNIQUE USED HERE==
        //
        // To avoid overloading the network, we try to fetch the assets sequentially. To do this, we need to be 
        // able to tell when a particular asset is downloaded. In IE and chrome, we use IMG objects to download 
        // and use onload and onerror to tell when the asset is available or has failed. In gecko, we use OBJECT 
        // tags. FF doesn't support onerror when an asset fails, so we need to use a timeout. Safari will download 
        // but won't actually cache the files using either the IMG or OBJECT elements, so in that case we use a 
        // SCRIPT element with a TYPE attribute that is invalid (non-empty, or non-"text/javascript"). That approach
        // works reasonably well in some of the other browsers but seemed to hold more risk of unexpected execution
        // than other approaches and just seemed so $Aross_ that I avoided it.
        //
        //
        // UNRECOGNIZED BROWSERS
        // Given the differences between all the browsers, the code below only prefetches if we believe the 
        // the browser to be one of our likely supported browsers. If its not, we don't prefetch because 
        // we've seen such varied behavior between browsers, some of which is potentially very CX damaging,
        // and we don't want to pick a damaging one.


        // {Array} plUrls - list of urls to preload. Set using the bootstrap or via a normal call to amznJQ.addPL(); 
        var plUrls = [],
        // {Boolean} plIsRunning - is the preloader currently preloading items. Controls whether or not we call the preload function again.
            plIsRunning = true;
        /**
         * Add Preload URL
         * 
         * @param {Array} urls
         */		
        this.addPL = function(urlList){		
            /* Check for a single url being passed in. If it is, force it to a list */
            if (typeof(urlList) === "string")
                urlList = [ urlList ];
            else if (typeof(urlList) !== "object" || urlList=== null) // chrome thinks null is an object 
                return;
				
            for (var i = 0; i < urlList.length; i++){
                 if (urlList[i] && typeof(urlList[i]) !== "string"){
                    this.addPL(urlList[i]);
                }else if (urlList[i]) {
                    // Guard for empty url. In Chrome/FF, empty urls result in requesting of the hosting page.
                    plUrls.push(urlList[i]);
                }
            }
	
            if (!plIsRunning && plUrls.length > 0){
                plIsRunning = true;
                preload();
            }
        };

        /**
         * Preload Function
         * We are going to use Lazy Function Definition to detect which browser we are in,
         * Then overwrite this function with the proper way to PL items.
         */
        var preload = (function() {
            var ST       = setTimeout,
                CT       = clearTimeout,
                doc      = document,
                docElem  = doc.documentElement,
                isIE     = /*@cc_on!@*/0, 
                styleObj = docElem.style,
                isWebkit = ('webkitAppearance' in styleObj),
                isGecko  = ('MozAppearance' in styleObj),
                isSafari = (isWebkit && navigator.vendor.indexOf("Apple")===0);

	        $(window).load(function() { ST(preload, 1000); } );

            // Loading items into image tags works well in IE and Chrome/Safari (webkit), but not other browsers.
            // In order to reduce network load we don't want to load them all at once, so use
            // load and error handlers to do sequential work.
            if (isIE || isWebkit){
                return function() {
                    // NOTE: IE will stack overflow with a stack only 13 levels deep if it involves recursion and the window object.
                    //       (see http://cappuccino.org/discuss/2010/03/01/internet-explorer-global-variables-and-stack-overflows/)
                    //       This also triggers with event handlers on DOM elements - the onload of one img triggers the next one to load, 
                    //       and if it's cached, it can trigger the next, etc. - resulting in a potentially deep stack.
                    //       setTimeout lets us avoid the recursion. It would be nice to find a way to do this without the timeout 
                    //       because it slows things down and is inelegant.
                    function nextWrapper() { ST(next, 0); }

                    function next() {
                        if (plUrls.length === 0){
                            /* 
                             * There is a very small chance that an image could still be loading. If this is the case
                             * and plIsRunning is set to false, and more items to preload are added at the same time we could
                             * end up in a state where we are spawning 3 current downloaded items rather than just 2.
                             * the chance of this is very small, but should be noted here.
                             */
                            plIsRunning = false;
                            return;
                        }
						
                        var url = plUrls.shift(),
                            loadElem;

                        if (isSafari){
                            loadElem = doc.createElement("script");
                            // We don't want the browser to treat the downloaded content as script - no matter what
                            // type of content it is. If we set the type to something non-sensical, then browsers are
                            // supposed to ignore the script and just move on. 
                            loadElem.type = "f";
                        } else {
                            loadElem = new Image();
                        }

                        // Set the right handler. 
                        //   onload fires for files that are images (png, jpg, gif, etc) that successfully load.
                        //   IE fires onerror for other file types or requests that fail.
                        if (plUrls.length > 0){
                            loadElem.onload = loadElem.onerror = isIE ? nextWrapper : next;
                        }

                        loadElem.src = url;

                        // Webkit doesn't download unless the img is in the DOM. IE fetches the img as soon as you set SRC, 
                        // even if the img isn't inserted in the DOM. So, avoid the DOM manipulation in IE, where it isn't needed 
                        // and is slow. 
                        if (!isIE){
                            loadElem.width = loadElem.height = 0;
                            docElem.appendChild(loadElem);
                        }
                    }

                    // We can issue multiple fetch commands in a row to make more use of the network at an increased cost to CPU 
                    // and increased chance of saturated network. The best balance seems to be about 2. 
                    // TODO: We may want to fine tune this by useragent given differences between available connections.
                    //       IE8+ work well with 2. Chrome desktop works great with many more. However, webkit is also used a 
                    //       lot on mobile devices which support fewer connections (only 4 total across all hosts on Android!)
                    //       and we don't want to flood all available connections, so until detect that, probably shouldn't go above 2.

                    next();
                    next();
                };
            }
            // FF can't use IMG, so use OBJECT. However, it doesn't support onerror so requires special handling 
            // for unavailable files.
            // Webkit could use the OBJECT method if you remove and append the OBJECT from the DOM, but it is much 
            // slower and frequently results in flashing of an hourglass. Therefore, we use the IE model for webkit.
            else if (isGecko) {
                return function() {
                    // Create one OBJECT that gets reused.
                    var fetchTimeout,
                        o   = doc.createElement("object");

                    o.width = o.height = 0;
                    docElem.appendChild(o);

                    function fetch() {
                        if (fetchTimeout) CT(fetchTimeout);

                        if (plUrls.length === 0){
                            cleanup();
                            return;
			}

                        // FF retriggers onload and downloads after just changing data attribute - we don't need a 
                        // new object for each. 
                        o.data = plUrls.shift();

                        // The last item in the list should clean up. Others fetch.
                        var handler = plUrls.length > 0 ? fetch : cleanup;
                        o.onload = handler;

                        // NOTE: FF doesn't support onerror on OBJECT.
                        //       Thus if an item 404's or is malformed, it kills the rest of the lookups
                        //       So, add a timeout in case the request errorred
                        fetchTimeout = ST(handler, 2000);
                    }

                    function cleanup(){
                        if (fetchTimeout) CT(fetchTimeout);

                        // Cleanup the objects.
                        // In FF, if you simply destroy the object during it's onload event, the spinner may
                        // continue to spin. So destroy it in a setTimeout because that gives the browser a 
                        // chance to act before you destroy the object.
                        ST(function(){ if (o){docElem.removeChild(o); o=null;} },0);

                        plIsRunning = false;
                    }

                    // NOTE: only doing a single fetch at a time - multiple simultaneous fetches didn't seem to 
                    //       improve FF and this code is simpler.
                    fetch();
                };
            }
        })();


        this.strings = {}; // public worldServerId => string lookup

        this.chars = {
            // public, needed because of Shift-JIS in JP.  Copied from JSF.s list
            // defined in /jquery/bootstrap.mi so available from HEAD
        };
        if (bootstrapAmznJQ) {
            $.extend(this.strings, bootstrapAmznJQ.strings);
            $.extend(this.chars, bootstrapAmznJQ.chars);
        }
    }();

    // add window onload event hookup
    $(window).load(function() {amznJQ.windowOnLoad();});

    // report availablity of jQuery to uedata
    // We're checking ues & uex here due to old uedata scripts in SPC, which
    // caused sev-2 prod TT 0010191376.  This protects against similar errors
    // in other applications.
    if (window.ue && bootstrapAmznJQ && window.ues && window.uex) {
        ues('wb', 'jQueryActive', 1); // jQueryActive time is relative to first byte of this page render.
        uex('ld', 'jQueryActive');    // record the jQueryActive timestamp now.
    }

    // amznJQ & jQuery are open for business
    amznJQ.declareAvailable('JQuery');
    amznJQ.declareAvailable('jQuery');

    // import any values from the bootstrap
    // called event handlers may make use of window.amznJQ, so it must be fully set up at this time

    // WARNING WARNING WARNING WARNING WARNING WARNING WARNING WARNING
    //
    // When changing this, MUST UPDATE copies in AmazonJQ (Gurupa bootstrap)
    // and ManausAmazonJQ (Santana bootstrap), as well as adding
    // implementation above.
    //
    // WARNING WARNING WARNING WARNING WARNING WARNING WARNING WARNING

    if (bootstrapAmznJQ) {

        goN2Debug.info('amazonJQ.js importing calls from bootstrap amznJQ');
        $.each(bootstrapAmznJQ._l, function() {
            // this now refers to the arguments array of a pre-bootstrap invocation of
            // addLogical(functionality_name, url_array)
            amznJQ.addLogical(this[0], this[1]);
        });
        $.each(bootstrapAmznJQ._s, function() {
            // this now refers to the arguments array of a pre-bootstrap invocation of
            // addStyle(css_url)
            amznJQ.addStyle(this[0]);
        });
        $.each(bootstrapAmznJQ._d, function() {
            // this now refers to the arguments array of a pre-bootstrap invocation of
            // declareAvailable(functionality_name, url_array)
            amznJQ.declareAvailable(this[0], this[1]);
        });
        $.each(bootstrapAmznJQ._a, function() {
            // this now refers to the arguments array of a pre-bootstrap invocation of
            // available(functionality_name, callback)
            amznJQ.available(this[0], this[1]);
        });
        $.each(bootstrapAmznJQ._o, function() {
            // this now refers to the arguments array of a pre-bootstrap invocation of
            // onReady(functionality_name, callback)
            amznJQ.onReady(this[0], this[1]);
        });
        $.each(bootstrapAmznJQ._c, function() {
            // this now refers to the arguments array of a pre-bootstrap invocation of
            // onCompletion(stage_name, callback)
            amznJQ.onCompletion(this[0], this[1]);
        });
        $.each(bootstrapAmznJQ._cs, function() {
            // this now refers to the arguments array of a pre-bootstrap invocation of
            // completedStage(stage_name)
            amznJQ.completedStage(this[0], this[1]);
        });
	amznJQ.addPL(bootstrapAmznJQ._pl);
    }   
}(jQuery));