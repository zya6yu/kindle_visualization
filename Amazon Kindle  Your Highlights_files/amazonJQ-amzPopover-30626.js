//! Amazon Popover
//! Copyright Amazon.com 2008
if(typeof window.jQuery!='undefined'){(function($){var rootElement=function(){var container=$("#ap_container");return container.length&&container||$("body");};var viewport={width:function(){return Math.min($(window).width(),$(document).width());},height:function(){return $(window).height();}};var mouseTracker=function(){var regions=[];var cursor={x:0,y:0};var scroll=[0,0];var listening=false;var check=function(immediately){for(var i=0;i<regions.length;i++){var r=regions[i];var inside=$.grep(r.rects,function(n){return cursor.x>=n[0]&&cursor.y>=n[1]&&cursor.x<n[0]+n[2]&&cursor.y<n[1]+n[3];}).length>0;if(r.inside!==null&&inside&&!r.inside&&r.mouseEnter){r.inside=r.mouseEnter();}else if(r.inside!==null&&!inside&&r.inside&&r.mouseLeave){r.inside=!r.mouseLeave(immediately);}}}
var startListening=function(){scroll=[$(window).scrollLeft(),$(window).scrollTop()];$(document).mousemove(function(e){cursor={x:e.pageX,y:e.pageY};check();});$(document).scroll(function(e){cursor.x+=($(window).scrollLeft()-scroll[0]);cursor.y+=($(window).scrollTop()-scroll[1]);scroll=[$(window).scrollLeft(),$(window).scrollTop()];check();});listening=true;}
return{add:function(rectsArray,options){if(!listening){startListening();}
var r=$.extend({rects:rectsArray},options);regions.push(r);return r;},remove:function(region){for(var i=0;i<regions.length;i++){if(regions[i]===region){regions.splice(i,1);return;}}},checkNow:function(){check(true);}};}();var iframePool=function(){var ie6=$.browser.msie&&parseInt($.browser.version)<=6;var src=ie6?window.AmazonPopoverImages.pixel:"javascript:void(false)";var HTML='<iframe frameborder="0" tabindex="-1" src="'+src+'" style="display:none;position:absolute;z-index:0;filter:Alpha(Opacity=\'0\');opacity:0;" />';var pool=[];var addToLib=function(n){for(i=0;i<n;i++){pool.push($(HTML).prependTo(rootElement()));}};$(document).ready(function(){addToLib(3);});return{checkout:function(jqObj){if(!pool.length)addToLib(1);return pool.pop().css({display:'block',top:jqObj.offset().top,left:jqObj.offset().left,width:jqObj.outerWidth(),height:jqObj.outerHeight(),zIndex:Number(jqObj.css("z-index"))-1});},checkin:function(iframe){pool.push(iframe.css("display","none"));}};}();var elementHidingManager=function(){var hiddenElements=[];var win=/Win/.test(navigator.platform);var mac=/Mac/.test(navigator.platform);var linux=/Linux/.test(navigator.platform);var version=parseInt($.browser.version);var canOverlayWmodeWindow=false;var intersectingPopovers=function(obj){var bounds=[obj.offset().left,obj.offset().top,obj.outerWidth(),obj.outerHeight()];var intersecting=[];for(var i=0;i<popovers.length;i++){var r=popovers[i].bounds;var disparate=bounds[0]>r[0]+r[2]||r[0]>bounds[0]+bounds[2]||bounds[1]>r[1]+r[3]||r[1]>bounds[1]+bounds[3];if(!disparate)intersecting.push(popovers[i]);}
return intersecting;};var shouldBeVisible=function(obj){if(obj.hasClass("ap_never_hide"))return true;if(intersectingPopovers(obj).length){if(obj.is("object,embed")){var wmode=obj.attr("wmode")||obj.children("object,embed").attr("wmode")||obj.parent("object,embed").attr("wmode")||"window";if(wmode.toLowerCase()=="window"&&!canOverlayWmodeWindow){return false;}}
if(obj.is("iframe")){if($.browser.safari&&/Windows/.test(window.navigator.userAgent))return false;}}
return true;};return{update:function(){var stillHidden=[];for(var i=0;i<hiddenElements.length;i++){if(!shouldBeVisible(hiddenElements[i])){stillHidden.push(hiddenElements[i]);}else{hiddenElements[i].css("visibility","visible");}}
hiddenElements=stillHidden;$("object:visible,embed:visible,iframe:visible").each(function(){var obj=jQuery(this);if(!shouldBeVisible(obj)){hiddenElements.push(obj);obj.css("visibility","hidden");}});}};}();var applyBacking=function(popover,options){var region=null;var iframe=null;options=options||{};var destroy=function(){if(region){mouseTracker.remove(region);region=null;}
if(iframe){iframePool.checkin(iframe);iframe=null;}
elementHidingManager.update();};var refreshBounds=function(){var newBounds=[popover.offset().left,popover.offset().top,popover.outerWidth(),popover.outerHeight()];if(region){region.rects[0]=newBounds;}
if(iframe)iframe.css({left:newBounds[0],top:newBounds[1],width:newBounds[2],height:newBounds[3]});elementHidingManager.update();};var reposition=function(x,y){if(iframe){iframe.css({left:x,top:y});}
if(region){region.rects[0][0]=x;region.rects[0][1]=y;}};if(options.useIFrame!==false)iframe=iframePool.checkout(popover);var bounds=[[popover.offset().left,popover.offset().top,popover.outerWidth(),popover.outerHeight()]];if(options.additionalCursorRects){for(var i=0;i<options.additionalCursorRects.length;i++){bounds.push(options.additionalCursorRects[i]);}}
region=mouseTracker.add(bounds,options);elementHidingManager.update();popover.backing={destroy:destroy,refreshBounds:refreshBounds,reposition:reposition,iframe:iframe};};var defaultSettings={width:500,followScroll:false,locationMargin:4,alignMargin:0,windowMargin:4,locationFitInWindow:true,focusOnShow:true,modal:false,draggable:false,zIndex:200,showOnHover:false,hoverShowDelay:400,hoverHideDelay:200,skin:"default",useIFrame:true,clone:false,ajaxSlideDuration:400,ajaxErrorContent:null,paddingLeft:17,paddingRight:17,paddingBottom:8};var overlay=null;var popovers=[];var et={MOUSE_ENTER:0x01,MOUSE_LEAVE:0x02,CLICK_TRIGGER:0x04,CLICK_OUTSIDE:0x08,fromStrings:function(s){var flags=0;var self=this;if(s){$.each($.makeArray(s),function(){flags=flags|self[this];});}
return flags;}};var ajaxCache={};var preparedPopover=null;var skins={"default":'<div class="ap_popover ap_popover_sprited" surround="6,16,18,16" tabindex="0"> \
                <div class="ap_header"> \
                    <div class="ap_left"/> \
                    <div class="ap_middle"/> \
                    <div class="ap_right"/> \
                </div> \
                <div class="ap_body"> \
                    <div class="ap_left"/> \
                    <div class="ap_content"><img src="'+window.AmazonPopoverImages.snake+'"/></div> \
                    <div class="ap_right"/> \
                </div> \
                <div class="ap_footer"> \
                    <div class="ap_left"/> \
                    <div class="ap_middle"/> \
                    <div class="ap_right"/> \
                </div> \
                <div class="ap_titlebar"> \
                    <div class="ap_title"/> \
                </div> \
                <div class="ap_close"><a href="#"><span class="ap_closetext"/><span class="ap_closebutton"><span></span></span></a></div> \
            </div>',"default_non_sprited":'<div class="ap_popover ap_popover_unsprited" surround="6,16,18,16" tabindex="0"> \
                <div class="ap_header"> \
                    <div class="ap_left"/> \
                    <div class="ap_middle"/> \
                    <div class="ap_right"/> \
                </div> \
                <div class="ap_body"> \
                    <div class="ap_left"/> \
                    <div class="ap_content"><img src="'+window.AmazonPopoverImages.snake+'"/></div> \
                    <div class="ap_right"/> \
                </div> \
                <div class="ap_footer"> \
                    <div class="ap_left"/> \
                    <div class="ap_middle"/> \
                    <div class="ap_right"/> \
                </div> \
                <div class="ap_titlebar"> \
                    <div class="ap_title"/> \
                </div> \
                <div class="ap_close"><a href="#"><span class="ap_closetext"/><img border="0" src="'+window.AmazonPopoverImages.btnClose+'"/></a></div> \
            </div>',"classic":'<div class="ap_classic"> \
                <div class="ap_titlebar"> \
                    <div class="ap_close"> \
                        <img width="46" height="16" border="0" alt="close" onmouseup=\'this.src="'+window.AmazonPopoverImages.closeTan+'";\' onmouseout=\'this.src="'+window.AmazonPopoverImages.closeTan+'";\' onmousedown=\'this.src="'+window.AmazonPopoverImages.closeTanDown+'";\' src="'+window.AmazonPopoverImages.closeTan+'" /> \
                    </div> \
                    <span class="ap_title"></span> \
                </div> \
                <div class="ap_content"><img src="'+window.AmazonPopoverImages.loadingBar+'"/></div> \
            </div>'};var boundingRectangle=function(set){var b={left:Infinity,top:Infinity,right:-Infinity,bottom:-Infinity};set.each(function(){try{var t=$(this);var o=t.offset();var w=t.outerWidth();var h=t.outerHeight();if(t.is("area")){var ab=boundsOfAreaElement(t);o={left:ab[0],top:ab[1]};w=ab[2]-ab[0];h=ab[3]-ab[1];}
if(o.left<b.left)b.left=o.left;if(o.top<b.top)b.top=o.top;if(o.left+w>b.right)b.right=o.left+w;if(o.top+h>b.bottom)b.bottom=o.top+h;}
catch(e){}});return b;};var bringToFront=function(popover){if(popovers.length<=1){return;}
var maxZ=Math.max.apply(Math,$.map(popovers,function(p){return Number(p.css("z-index"));}));if(Number(popover.css("z-index"))==maxZ){return;}
popover.css("z-index",maxZ+2);popover.backing&&popover.backing.iframe.css("z-index",maxZ+1);};$.fn.removeAmazonPopoverTrigger=function(){this.unbind('click.amzPopover');this.unbind('mouseover.amzPopover');this.unbind('mouseout.amzPopover');return this;};$.fn.amazonPopoverTrigger=function(customSettings){var settings=$.extend({},defaultSettings,customSettings);var triggers=this;var popover=null;if(!settings.showOnHover&&settings.skin=='default')this.bind('mouseover.amzPopover',preparePopover);if(typeof settings.showOnHover=="string"){var hoverSet=triggers.filter(settings.showOnHover);}else{var hoverSet=settings.showOnHover?triggers:jQuery([]);}
var timerID=null;hoverSet.bind('mouseover.amzPopover',function(e){if(!popover&&!timerID){timerID=setTimeout(function(){if(!popover){popover=displayPopover(settings,triggers,function(){popover=null;});}
timerID=null;},settings.hoverShowDelay);}
return false;});hoverSet.bind('mouseout.amzPopover',function(e){if(!popover&&timerID){clearTimeout(timerID);timerID=null;}});triggers.bind('click.amzPopover',function(e){if(settings.followLink)return true;if(popover){popover.triggerClicked();}else{popover=displayPopover(settings,triggers,function(){popover=null;});}
return false;});return this;};var displayPopover=function(settings,triggers,destroyFunction){addAliases(settings);var parent=null;if(triggers){var parents=triggers.eq(0).parents().get();for(var t=0;t<parents.length&&!parent;t++){for(var i=0;i<popovers.length&&!parent;i++){if(popovers[i].get(0)==parents[t]){parent=popovers[i];}}}}
var children=[];children.remove=function(p){for(var i=0;i<this.length;i++){if(this[i]===p){this.splice(i,1);return;}}};var interactedWith=false;$.each(defaultSettings,function(k,v){if(typeof settings[k]=="undefined")settings[k]=v;});if(!settings.location){settings.location=settings.modal||!triggers?"centered":"auto";}
if(settings.showCloseButton===null)settings.showCloseButton=!settings.showOnHover;$.each(popovers,function(){settings.zIndex=Math.max(settings.zIndex,Number(this.css("z-index"))+2);});var closeEvent=(settings.showOnHover?et.MOUSE_LEAVE:et.CLICK_TRIGGER)|(settings.modal?et.CLICK_OUTSIDE:0);closeEvent=(closeEvent|et.fromStrings(settings.closeEventInclude))&~et.fromStrings(settings.closeEventExclude);var close=function(){if(original){if(ballMarker&&ballMarker.parents("body").length){original.hide().insertAfter(ballMarker);ballMarker.remove();ballMarker=null;}else{original.hide().appendTo(rootElement());}}
if(original!=popover){popover.remove();}
if(parent)parent.children.remove(popover);for(var i=0;i<popovers.length;i++){if(popovers[i]===popover){popovers.splice(i,1);break;}}
if(popover.backing){popover.backing.destroy();popover.backing=null;}
mouseTracker.checkNow();if(destroyFunction)destroyFunction();if(settings.onHide)settings.onHide.call(triggers,popover,settings);if(overlay){if(overlay.fitToScreen){$(window).unbind("resize",overlay.fitToScreen);}
overlay.remove();overlay=null;}
$(document).unbind('scroll.AmazonPopover');$(document).unbind('click',close);for(var i=0;i<children.length;i++){children[i].close();}
children=[];return false;};var fill=function(content){var container=popover.find('.ap_sub_content');if(container.length==0){container=popover.find('.ap_content');}
container.empty().append(content);if($.browser.msie){container.children().show().hide();}
container.children(":not(style)").show();container.find('.ap_custom_close').click(close);if(settings.onFilled){settings.onFilled.call(triggers,popover,settings);}};if(settings.modal&&!overlay){overlay=showOverlay(close,settings.zIndex);}
var popover=null;var original=null;var ballMarker=null;if(settings.skin=="default"){preparePopover();popover=preparedPopover;preparedPopover=null;}else{var skin=settings.skin||"<div><div class='ap_content' /></div>";var skinIsHtml=/^[^<]*(<(.|\s)+>)[^>]*$/.test(skin);var skinHtml=(skinIsHtml?skin:skins[skin]);popover=$(skinHtml);}
if($.browser.msie&&parseInt($.browser.version)==6){fixPngs(popover);}
if(settings.skin=="default"){popover.find(".ap_content").css({paddingLeft:settings.paddingLeft,paddingRight:settings.paddingRight,paddingBottom:settings.paddingBottom});}
if(settings.localContent){if(settings.clone){fill($(settings.localContent).clone(true));}else{original=$(settings.localContent);ballMarker=$("<span style='display:none' />").insertBefore(original);fill(original);}}else if(settings.literalContent){fill(settings.literalContent);}
if(settings.destination){var destinationUrl=(typeof settings.destination=="function")?settings.destination():settings.destination;if(settings.cacheable!==false&&ajaxCache[destinationUrl]){fill(ajaxCache[destinationUrl]);}else{$.ajax({url:destinationUrl,timeout:settings.ajaxTimeout,success:function(data){var contentCacheable=data.match(/^(\s|<!--[\s\S]*?-->)*<\w+[^>]*\s+cacheable="(.*?)"/i)||data.match(/^(\s|<!--[\s\S]*?-->)*<\w+[^>]*\s+cacheable='(.*?)'/i);if(settings.cacheable!==false&&(!contentCacheable||contentCacheable[2]!=="0")){ajaxCache[destinationUrl]=data;}
var title=data.match(/^(\s|<!--[\s\S]*?-->)*<\w+[^>]*\s+popoverTitle="(.*?)"/i)||data.match(/^(\s|<!--[\s\S]*?-->)*<\w+[^>]*\s+popoverTitle='(.*?)'/i);if(title){settings.title=title[2];popover.find('.ap_title').html(settings.title);}
if(settings.ajaxSlideDuration>0&&!($.browser.msie&&document.compatMode=="BackCompat")){popover.find(".ap_content").hide();fill(data);if(!settings.width){position(popover,settings,triggers);}
popover.find(".ap_content").slideDown(settings.ajaxSlideDuration,function(){position(popover,settings,triggers);});}else{fill(data);position(popover,settings,triggers);}},error:function(){var data=null;if(typeof settings.ajaxErrorContent=="function"){data=settings.ajaxErrorContent.apply(settings,arguments);}else{data=settings.ajaxErrorContent;}
if(data!==null){fill(data);position(popover,settings,triggers);}}});}}
if(!settings.localContent&&!settings.literalContent&&!settings.destination){throw("AmazonPopover wasn't provided a source of content.");}
if(parent){parent.children.push(popover);}
settings.surround=jQuery.map((popover.attr("surround")||"0,0,0,0").split(","),function(n){return Number(n);});popover.css({zIndex:settings.zIndex,position:"absolute",left:-2000,top:-2000});popover.click(function(e){e.stopPropagation();interactedWith=true;});if(closeEvent&et.CLICK_OUTSIDE){$(document).click(close);}
popover.mousedown(function(e){if(!children.length){bringToFront(popover);}});var width=settings.width&&(typeof settings.width=="function"?settings.width():settings.width);if(!width){width=getDynamicWidth(popover,settings)||popover.outerWidth();}
if(width)popover.css("width",width);if(settings.followScroll){$(document).bind('scroll.AmazonPopover',function(e){followScroll(e);});}
if(settings.title!==null&&settings.title!==undefined){var titleBar=popover.find('.ap_titlebar');if(settings.skin=="default"){titleBar.css({width:(width-36)});titleBar.find(".ap_title").css("width",width-70);popover.find('.ap_content').css({paddingTop:18});}
popover.find('.ap_title').html(settings.title);if(settings.draggable&&!settings.modal){enableDragAndDrop(titleBar,popover);}
titleBar.show();}else{popover.find('.ap_titlebar').hide();}
if(settings.showCloseButton!==false){popover.find('.ap_close').show().click(close)
.mousedown(function(e){e.preventDefault();e.stopPropagation();return false;})
.css("cursor","default");if(!settings.title){popover.find('.ap_content').css({paddingTop:10});}
popover.keydown(function(e){if(e.keyCode==27){close();}});}else{popover.find('.ap_close').css("display","none");}
if(settings.closeText){popover.find('.ap_closetext').text(settings.closeText).show();}else{popover.find('.ap_closebutton span').text("Close");}
popover.appendTo(rootElement());position(popover,settings,triggers);$('input[type=text]').blur();popover.show();if(settings.focusOnShow){popover.get(0).hideFocus=true;popover.focus();}
if(settings.onShow){settings.onShow.call(triggers,popover,settings);}
popover.bounds=[popover.offset().left,popover.offset().top,popover.outerWidth(),popover.outerHeight()];popovers.push(popover);if(closeEvent&et.MOUSE_LEAVE){var timerID=null;var triggerRects=[];$.each(triggers,function(){var n=$(this);if(n.is("area")){var b=boundsOfAreaElement(n);triggerRects.push([b[0],b[1],b[2]-b[0],b[3]-b[1]]);}else{triggerRects.push([n.offset().left,n.offset().top,n.outerWidth(),n.outerHeight()]);}});if(settings.additionalCursorRects){$(settings.additionalCursorRects).each(function(){var n=$(this);triggerRects.push([n.offset().left,n.offset().top,n.outerWidth(),n.outerHeight()]);});}
applyBacking(popover,{solidRectangle:settings.solidRectangle,useIFrame:settings.useIFrame,mouseEnter:function(){if(timerID){clearTimeout(timerID);timerID=null;}
return true;},mouseLeave:function(immediately){if(settings.semiStatic&&interactedWith){return!children.length;}
if(timerID){clearTimeout(timerID);timerID=null;}
if(children.length==0){if(immediately){close();}else{timerID=setTimeout(function(){close();timerID=null;},settings.hoverHideDelay);}
return true;}
return false;},additionalCursorRects:triggerRects,inside:true});}else{applyBacking(popover,{solidRectangle:settings.solidRectangle,useIFrame:settings.useIFrame});}
popover.close=close;popover.settings=settings;popover.triggerClicked=function(){if(closeEvent&et.CLICK_TRIGGER)close();};popover.children=children;return popover;};var getPageWidth=function(){return $.browser.msie?$(window).width():'100%';};var getPageHeight=function(){return $.browser.msie?$(document).height():'100%';};var showOverlay=function(closeFunction,z){var overlay=$('<div id="ap_overlay"/>');overlay.css({width:getPageWidth(),height:getPageHeight(),position:($.browser.mozilla||$.browser.safari)?'fixed':'',opacity:0.4,zIndex:z});if($.browser.msie){overlay.fitToScreen=function(e){overlay.css({width:getPageWidth(),height:getPageHeight()});};$(window).resize(overlay.fitToScreen);}
return overlay.appendTo(rootElement()).fadeIn(500);};var position=function(popover,settings,triggers){if(!settings.width){popover.css('width',getDynamicWidth(popover,settings));}
if(typeof settings.location=="function"){var location=settings.location.call(triggers,popover,settings);}else{var names=$.map($.makeArray(settings.location),function(n){return n=="auto"?["bottom","left","right","top"]:n;});var set=settings.locationElement&&$(settings.locationElement)||triggers;var b=set&&boundingRectangle(set);var location=locationFunction[names[0]](b,popover,settings);for(var i=1;i<names.length&&!location.fits;i++){var next=locationFunction[names[i]](b,popover,settings);if(next.fits)location=next;}}
var offset=settings.locationOffset||[0,0];popover.css({left:location.left+offset[0],top:location.top+offset[1],margin:location.margin,right:location.right});if(popover.backing){popover.backing.refreshBounds();}};var horizPosition=function(b,popover,settings){var align=settings.align||"left";var x={min:$(document).scrollLeft()+settings.windowMargin-settings.surround[3],max:viewport.width()+$(document).scrollLeft()-settings.windowMargin-popover.outerWidth(),left:b.left-settings.surround[3]-settings.alignMargin,right:b.right-popover.outerWidth()+settings.surround[1]+settings.alignMargin,center:(b.left+b.right-popover.outerWidth())/2};var pref=[align,"left","right"];for(var i=0;i<pref.length;i++){if(settings.forceAlignment||(x[pref[i]]&&x[pref[i]]>=x.min&&x[pref[i]]<=x.max))return x[pref[i]];}
if(viewport.width()<popover.outerWidth()+settings.windowMargin-settings.surround[3]){return x.min;}
return align=="left"?x.min:x.max;};var vertPosition=function(b,popover,settings){var y={min:Math.min(b.top-settings.alignMargin,$(document).scrollTop()+settings.windowMargin)-settings.surround[0],max:Math.max(b.bottom+settings.alignMargin,viewport.height()+$(document).scrollTop()-settings.windowMargin)-popover.outerHeight()+settings.surround[2],top:b.top-settings.surround[0]-settings.alignMargin,bottom:b.bottom-popover.outerHeight()+settings.alignMargin+settings.surround[2],middle:(b.top+b.bottom-popover.outerHeight())/2};var align=y[settings.align]&&settings.align||"top";return settings.forceAlignment?y[align]:Math.max(y.min,Math.min(y.max,y[align]));};var locationFunction={centered:function(b,popover,settings){var y=$(window).scrollTop()+100;return{left:-(popover.outerWidth()/2),right:0,top:y,margin:'0% 50%',fits:true};},top:function(b,popover,settings){var room=b.top-$(document).scrollTop()-settings.locationMargin*2;var triggerInView=(b.left>=$(document).scrollLeft())&&(b.right<viewport.width()+$(document).scrollLeft());return{left:horizPosition(b,popover,settings),top:b.top-popover.outerHeight()-settings.locationMargin+settings.surround[2],fits:triggerInView&&room>=popover.outerHeight()-settings.surround[0]-settings.surround[2]};},left:function(b,popover,settings){var room=b.left-$(document).scrollLeft()-settings.locationMargin*2;return{left:b.left-popover.outerWidth()-settings.locationMargin+settings.surround[1],top:vertPosition(b,popover,settings),fits:room>=popover.outerWidth()-settings.surround[1]-settings.surround[3]};},bottom:function(b,popover,settings){var room=(viewport.height()+$(document).scrollTop())-b.bottom-settings.locationMargin*2;var triggerInView=(b.left>=$(document).scrollLeft())&&(b.right<viewport.width()+$(document).scrollLeft());return{left:horizPosition(b,popover,settings),top:b.bottom+settings.locationMargin-settings.surround[0],fits:triggerInView&&room>=popover.outerHeight()-settings.surround[0]-settings.surround[2]};},right:function(b,popover,settings){var room=(viewport.width()+$(document).scrollLeft())-b.right-settings.locationMargin*2;return{left:b.right+settings.locationMargin-settings.surround[3],top:vertPosition(b,popover,settings),fits:room>=popover.outerWidth()-settings.surround[1]-settings.surround[3]};},over:function(b,popover,settings){var alignTo=popover.find(settings.align||".ap_content *").offset();var corner=popover.offset();var padding={left:alignTo.left-corner.left,top:alignTo.top-corner.top};var left=b.left-padding.left;var top=b.top-padding.top;var adjustedLeft=Math.min(left,viewport.width()+$(document).scrollLeft()-popover.outerWidth()-settings.windowMargin);adjustedLeft=Math.max(adjustedLeft,$(document).scrollLeft()-settings.surround[3]+settings.windowMargin);var adjustedTop=Math.min(top,viewport.height()+$(document).scrollTop()-popover.outerHeight()+settings.surround[2]-settings.windowMargin);adjustedTop=Math.max(adjustedTop,$(document).scrollTop()-settings.surround[0]+settings.windowMargin);return{left:settings.forceAlignment?left:adjustedLeft,top:settings.forceAlignment?top:adjustedTop,fits:left==adjustedLeft&&top==adjustedTop};}}
var addAliases=function(settings){settings.align=settings.align||settings.locationAlign;settings.literalContent=settings.literalContent||settings.loadingContent;}
var preparePopover=function(){if(!preparedPopover){var ie6=jQuery.browser.msie&&parseInt(jQuery.browser.version)<=6;preparedPopover=$(skins[ie6?"default_non_sprited":"default"]).css({left:-2000,top:-2000}).appendTo(rootElement());}};var fixPngs=function(obj){obj.find("*").each(function(){var match=(jQuery(this).css("background-image")||"").match(/url\("(.*\.png)"\)/);if(match){var png=match[1];jQuery(this).css("background-image","none");jQuery(this).get(0).runtimeStyle.filter="progid:DXImageTransform.Microsoft.AlphaImageLoader(src='"+png+"',sizingMethod='scale')";}});};var getDynamicWidth=function(popover,settings){var container=popover.find('.ap_content');if(settings.skin=='default'&&container.length>0){var tempNode=$('<div class="ap_temp">'+container.html()+'</div>');tempNode.css({display:'inline',position:'absolute',top:-9999,left:-9999});rootElement().append(tempNode);var marginLeft=parseInt(container.css("margin-left"))||0;var marginRight=parseInt(container.css("margin-right"))||0;var width=tempNode.width()+marginLeft+marginRight+settings.paddingLeft+settings.paddingRight+2;if(width%2!=0)width++;tempNode.remove();return Math.min(width,viewport.width());}
return null;};var enableDragAndDrop=function(titlebar,popover){titlebar.css('cursor','move');disableSelect(titlebar.get(0));titlebar.mousedown(function(e){e.preventDefault();disableSelect(document.body);var offset=[e.pageX-popover.offset().left,e.pageY-popover.offset().top];var mousemove=function(e){e.preventDefault();popover.css({left:e.pageX-offset[0],top:e.pageY-offset[1],margin:0});if(popover.backing){popover.backing.reposition(e.pageX-offset[0],e.pageY-offset[1]);}};var mouseup=function(e){popover.focus();enableSelect(document.body);$(document).unbind("mousemove",mousemove);$(document).unbind("mouseup",mouseup);};$(document).mousemove(mousemove).mouseup(mouseup);});}
var disableSelect=function(e){if(e){e.onselectstart=function(e){return false;};e.style.MozUserSelect='none';}};var enableSelect=function(e){if(e){e.onselectstart=function(e){return true;};e.style.MozUserSelect='';}};var boundsOfAreaElement=function(area){area=jQuery(area);var coords=jQuery.map(area.attr("coords").split(","),function(n){return Number(n);});if(area.attr("shape").match(/circle/i)){coords=[coords[0]-coords[2],coords[1]-coords[2],coords[0]+coords[2],coords[1]+coords[2]];}
var x=[],y=[];for(var i=0;i<coords.length;i++){(i%2==0?x:y).push(coords[i]);}
var min=[Math.min.apply(Math,x),Math.min.apply(Math,y)];var max=[Math.max.apply(Math,x),Math.max.apply(Math,y)];var mapName=area.parents("map").attr("name");var mapImg=jQuery("img[usemap=#"+mapName+"]");var map=mapImg.offset();map.left+=parseInt(mapImg.css("border-left-width"));map.top+=parseInt(mapImg.css("border-top-width"));return[map.left+min[0],map.top+min[1],map.left+max[0],map.top+max[1]];};$.AmazonPopover={displayPopover:displayPopover,mouseTracker:mouseTracker};if(typeof amznJQ!='undefined'){amznJQ.declareAvailable('popover');}})(jQuery);}