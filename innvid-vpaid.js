/**
*	Title: InnovidHTMLVPAIDCallback.js
*	Description: VPAID 2.0 [HTML5 VPAID] advertisement callback for testing player functionality and their compliance with the IAB VPAID 2.0 spec.
*	Author: William Neville
*	Company: Innovid Inc.
*
*	IAB VPAID 2.0 Spec: <http://www.iab.com/wp-content/uploads/2015/06/VPAID_2_0_Final_04-10-2012.pdf>
*/

/**
* Constructor for VpaidAd
* @constructor
*/
var VpaidAd = function() {
	this.slot_ = null;
	this.videoSlot_ = null;
	this.eventCallbacks_ = {}; //holds references for callbacks
	this.logCounter_ = 0; //for clearing out log when it gets full
	this.attributes_ = {
		'companions' : '',
		'desiredBitrate' : 256,
		'duration' : 15,
		'expanded' : false,
		'height' : 0,
		'icons' : '',
		'linear' : true,
		'remainingTime' : 5,
		'skippableState' : false,
		'viewMode' : 'normal',
		'width' : 0,
		'volume' : 50
	};
};

/**
* The HTML that will house the buttons to trigger events
*/
VpaidAd.HTML_TEMPLATE =
	'<style type="text/css">' +
		'html, body {height:100%; margin:0; font-family:Verdana, sans-serif;}' +
		'.ad-element {height:100%; margin:0;}' +
		'#callbackSlot {height:96%; width:98%; float:left; margin-left:1%; margin-top:1%; background:#002b36; overflow:hidden;}' +
		'#triggerEventSlot {height:49%; width:100%; display:inline-block; padding-left:2%; padding-right:2%; padding-top:1%;}' +
		'#logSlot {height:39%; width:100%; color:#839496; border-top:2px ridge #2aa198; border-bottom:2px ridge #2aa198; overflow-y:auto; font-size:12px; display:inline-block;}' +
		'#inputSlot {height:9%; width:100%; display:inline-block; background-color:#002b36; color:#839496; border-style:none;}' +
		'.eventButton {height:25%; width:19%; text-align:center; float:left; background-color:#073642; font-size:10px; color:#839496; border-radius:2px; border-color:6c71c4}' +
	'</style>' +
	'<div id="callbackSlot">' + //<!-- begin callbackSlot -->
		'<div id="triggerEventSlot">' + //<!-- begin triggerEventSlot -->
			'<button class="eventButton" type="button" id="AdImpression">AdImpression</button>' + //3.3.12
			'<button class="eventButton" type="button" id="AdVideoFirstQuartile">AdVideoFirstQuartile</button>' + //3.3.13 v25
			'<button class="eventButton" type="button" id="AdVideoMidpoint">AdVideoMidpoint</button>' + //3.3.13 v50
			'<button class="eventButton" type="button" id="AdVideoThirdQuartile">AdVideoThirdQuartile</button>' + //3.3.13 v75
			'<button class="eventButton" type="button" id="AdVideoComplete">AdVideoComplete</button>' + //3.3.13 v100
			'<button class="eventButton" type="button" id="AdStarted">AdStarted</button>' + //3.3.2
			'<button class="eventButton" type="button" id="AdVideoStart">AdVideoStart</button>' + //3.3.13 Start
			'<button class="eventButton" type="button" id="AdStopped">AdStopped</button>' + //3.3.3
			'<button class="eventButton" type="button" id="AdSkipped">AdSkipped</button>' + //3.3.4
			'<button class="eventButton" type="button" id="AdSizeChange">AdSizeChange</button>' + //3.3.6
			'<button class="eventButton" type="button" id="AdDurationChange">AdDurationChange</button>' + //3.3.8
			'<button class="eventButton" type="button" id="AdExpandedChange">AdExpandedChange</button>' + //3.3.9
			'<button class="eventButton" type="button" id="AdVolumeChange">AdVolumeChange</button>' + //3.3.11
			'<button class="eventButton" type="button" id="AdClickThru">AdClickThru</button>' + //3.3.14
			'<button class="eventButton" type="button" id="AdInteraction">AdInteraction</button>' + //3.3.15
			'<button class="eventButton" type="button" id="AdPaused">AdPaused</button>' + //3.3.17 Paused
			'<button class="eventButton" type="button" id="AdPlaying">AdPlaying</button>' + //3.3.17 Playing
			'<button class="eventButton" type="button" id="AdError">AdError</button>' + //3.3.19
		'</div>' + //<!-- end triggerEventSlot -->
		'<div id="logSlot">Boogie</div>' + //<!-- begin and end logSlot -->
		'<input type="text" placeholder="Text" id="inputSlot">' + //<!-- begin and end inputSlot -->
	'</div>'; //<!-- end callbackSlot -->



//VPAID Protocol Methods

/**
* Called immediately after loading ad unit; indicates latest VPAID version.
* IAB VPAID 2.0 Spec Section 3.1.1
* @param {string} version The player's latest supported version of VPAID.
*/
VpaidAd.prototype.handshakeVersion = function(version) {
	console.log('handshakeVersion(' + version + ')');
	return('2.0');
};

/**
* Called by player after handshakeVersion() to initialize the ad experience.
* IAB VPAID 2.0 Spec Section 3.1.2
* @param {number} width The width at which the ad should render.
* @param {number} height The height at which the ad should render.
* @param {string} viewMode View mode for player defined by publisher; can be 'normal' (defualt), 'thumbnail' or 'fullscreen'.
* @param {number} desiredBitrate Indicates desired bitrate in kbps.
* @param {string} creativeData (optional) Used for additional initialization data.
* @param {string} environmentVars (optional) Used for passing implementation specific runtime variables.
*/
VpaidAd.prototype.initAd = function(
	width,
	height,
	viewMode,
	desiredBitrate,
	creativeData,
	environmentVars){
		console.log('initAd()');
		this.slot_ = environmentVars.slot;
		this.videoSlot_ = environmentVars.videoSlot;
		this.attributes_['width'] = width;
		this.attributes_['height'] = height;
		this.attributes_['viewMode'] = viewMode;
		this.attributes_['desiredBitrate'] = desiredBitrate;
		this.renderSlot_();
		this.addButtonListeners_();
		this.testLog_('initAd ' + width + 'x' + height + ' ' + viewMode + ' ' + desiredBitrate);

		//Signifies ad unit has verified all files are ready to execute
		this.eventCallbacks_['AdLoaded']();
};

/**
* Called by player when the advertisement/page is resized.
* IAB VPAID 2.0 Spec Section 3.1.3
* @param {number} width The width to which the advertisement should be resized.
* @param {number} height The height to which the advertisement should be resized.
* @param {string} viewMode New view mode for advertisement; can be 'normal' (defualt), 'thumbnail' or 'fullscreen'.
*/
VpaidAd.prototype.resizeAd = function(width, height, viewMode) {
	console.log('resizeAd(' + width + ', ' + height + ', ' + viewMode + ')');
	this.testLog_('Resizing ad to: ' + width + ' x ' + height + ', viewMode: ' + viewMode + ' {AdSizeChange}');
	if (this.isEventSubscribed_('AdSizeChange')) {
		this.attributes_['width'] = width;
		this.attributes_['height'] = height;
		this.attributes_['viewMode'] = viewMode;
		this.eventCallbacks_['AdSizeChange']();
	}
	else {
		this.testLog_('Invalid callback - AdSizeChange not subscribed');
	}
};

/**
* Called by player to start the advertisement.
* IAB VPAID 2.0 Spec Section 3.1.4
*/
VpaidAd.prototype.startAd = function() {
	console.log('startAd()');
	this.testLog_('Starting ad');
	if (this.isEventSubscribed_('AdStarted')) {
		this.eventCallbacks_['AdStarted']();
	}
	else {
		this.testLog_('Invalid callback - AdStarted not subscribed.');
	}
};

/**
* Called by player to stop the advertisement.
* IAB VPAID 2.0 Spec Section 3.1.5
*/
VpaidAd.prototype.stopAd = function() {
	console.log('stopAd()');
	this.testLog_('Stopping ad');
	if (this.isEventSubscribed_('AdStopped')) {
		this.eventCallbacks_['AdStopped']();
	}
	else {
		this.testLog_('Invalid callback - AdStopped not subscribed.');
	}
};

/**
* Called by player to pause the advertisement.
* IAB VPAID 2.0 Spec Section 3.1.6
*/
VpaidAd.prototype.pauseAd = function() {
	console.log('pauseAd()');
	this.testLog_('Pausing ad {AdPaused}');
	if (this.isEventSubscribed_('AdPaused')) {
		this.eventCallbacks_['AdPaused']();
	}
	else {
		this.testLog_('Invalid callback - AdPaused not subscribed');
	}
};

/**
* Called by player to resume the advertisement.
* IAB VPAID 2.0 Spec Section 3.1.7
*/
VpaidAd.prototype.resumeAd = function() {
	console.log('resumeAd()');
	this.testLog_('Resuming ad {AdPlaying}');
	if (this.isEventSubscribed_('AdPlaying')) {
		this.eventCallbacks_['AdPlaying']();
	}
	else {
		this.testLog_('Invalid callback - AdPlaying not subscribed');
	}
};

/**
* Called by player to expand the advertisement.
* IAB VPAID 2.0 Spec Section 3.1.8
*/
VpaidAd.prototype.expandAd = function() {
	console.log('expandAd()');
	this.testLog_('Expanding ad {AdExpanded}');
	if (this.isEventSubscribed_('AdExpanded')) {
		this.attributes_['expanded'] = true;
		this.eventCallbacks_['AdExpanded']();
	}
	else {
		this.testLog_('Invalid callback - AdExpanded not subscribed');
	}
};

/**
* Called by player to collapse the advertisement.
* IAB VPAID 2.0 Spec Section 3.1.9
*/
VpaidAd.prototype.collapseAd = function() {
	console.log('collapseAd()');
	this.testLog_('Collapsing ad');
	this.attributes_['expanded'] = false;
};

/**
* Called by player to skip the advertisement.
* IAB VPAID 2.0 Spec Section 3.1.10
*/
VpaidAd.prototype.skipAd = function() {
	console.log('skipAd()');
	this.testLog_('Skipping ad {AdSkipped}');
	if (this.attributes_['skippableState'] === true) {
		if (this.isEventSubscribed_('AdSkipped')) {
			this.eventCallbacks_['AdSkipped']();
		}
		else {
			this.testLog_('Error: Invalid ad skip request.');
		}
	}
};

/**
* Called by video player to register listener to event.
* IAB VPAID 2.0 Spec Section 8.1.1
* @param {Function} aCallback The callback function.
* @param {string} eventName The type of callback.
* @param {Object} aContext The context for the callback.
*/
VpaidAd.prototype.subscribe = function(aCallback, eventName, aContext) {
	console.log('subscribe(' + eventName + ')');
	var callBack = aCallback.bind(aContext);
	this.eventCallbacks_[eventName] = callBack;
};

/**
* Remove a callback/listener for an event.
* IAB VPAID 2.0 Spec Section 8.1.1
* @param {string} eventName The name of callback to be removed.
*/
VpaidAd.prototype.unsubscribe = function(eventName) {
	console.log('unsubscribe(' + eventName + ')');
	this.testLog_('Unsubscribing ' + eventName);
	this.eventCallbacks_[eventName] = null;
};



//Getters and Setters for VPAID Protocol Properties

/**
* Getter for advertisement linear state.
* IAB VPAID 2.0 Spec Section 3.2.1
* @return {Boolean} this.attributes_['linear'] True if advertisement unit is linear, False if non-linear mode of operation.
*/
VpaidAd.prototype.getAdLinear = function() {
	console.log('getAdLinear()');
	this.testLog_('Getting ad linear state: ' + this.attributes_['linear']);
	return this.attributes_['linear'];
};

/**
* Getter for the advertisement's width.
* IAB VPAID 2.0 Spec Section 3.2.2
* @return {number} this.attributes_['width'] The advertisement's width.
*/
VpaidAd.prototype.getAdWidth = function() {
	console.log('getAdWidth()');
	this.testLog_('Getting ad width: ' + this.attributes_['width']);
	return this.attributes_['width'];
};

/**
* Getter for the advertisement's height.
* IAB VPAID 2.0 Spec Section 3.2.3
* @return {number} this.attributes_['height'] The advertisement's height.
*/
VpaidAd.prototype.getAdHeight = function() {
	console.log('getAdHeight()');
	this.testLog_('Getting ad height: ' + this.attributes_['height']);
	return this.attributes_['height'];
};

/**
* Getter for the advertisement's expanded state.
* IAB VPAID 2.0 Spec Section 3.2.4
* @return {Boolean} this.attributes_['expanded'] True if advertisement is expanded.
*/
VpaidAd.prototype.getAdExpanded = function() {
	console.log('getAdExpanded()');
	this.testLog_('Getting ad expanded state: ' + this.attributes_['expanded']);
	return this.attributes_['expanded'];
};

/**
* Getter for the advertisement's skippable state.
* IAB VPAID 2.0 Spec Section 3.2.5
* @return {Boolean} this.attributes_['skippableState'] True if advertisement is skippable.
*/
VpaidAd.prototype.getAdSkippableState = function() {
	console.log('getAdSkippableState()');
	this.testLog_('Getting ad skippable state: ' + this.attributes_['skippableState']);
	return this.attributes_['skippableState'];
};

/**
* Getter for the advertisement's remaining time.
* IAB VPAID 2.0 Spec Section 3.2.6
* @return {number} this.attributes_['remainingTime'] The advertisement's remaining time.
*/
VpaidAd.prototype.getAdRemainingTime = function() {
	console.log('getAdRemainingTime()');
	this.testLog_('Getting ad remaining time: ' + this.attributes_['remainingTime']);
	return this.attributes_['remainingTime'];
};

/**
* Getter for the advertisement's duration.
* IAB VPAID 2.0 Spec Section 3.2.7
* @return {number} this.attributes_['duration'] The advertisement's duration relative to current state of ad unit.
*/
VpaidAd.prototype.getAdDuration = function() {
	console.log('getAdDuration()');
	this.testLog_('Getting ad duration: ' + this.attributes_['duration']);
	return this.attributes_['duration'];
};

/**
* Getter for advertisement's volume.
* IAB VPAID 2.0 Spec Section 3.2.8
* @return {number} this.attributes_['volume'] The advertisement's volume.
*/
VpaidAd.prototype.getAdVolume = function() {
	console.log('getAdVolume()');
	this.testLog_('Getting ad volume: ' + this.attributes_['volume']);
	return this.attributes_['volume'];
};

/**
* Setter for the advertisement's volume.
* IAB VPAID 2.0 Spec Section 3.2.8
* @param {number} The number to which the advertisement's volume should be set.
*/
VpaidAd.prototype.setAdVolume = function(value) {
	console.log('setAdVolume(' + value + ')');
	this.testLog_('Setting ad volume to: ' + value + ' {AdVolumeChanged}');
	this.attributes_['volume'] = value;
	if ('AdVolumeChanged' in this.eventCallbacks_) {
		this.eventCallbacks_['AdVolumeChanged']();
	}
};

/**
* Getter for the advertisement's companion advertisements.
* IAB VPAID 2.0 Spec Section 3.2.9
* @return {string} this.attributes_['companions'] The advertisement's companion banners/advertisements.
*/
VpaidAd.prototype.getAdCompanions = function() {
	console.log('getAdCompanions()');
	this.testLog_('Getting ad companions: ' + this.attributes_['companions']);
	return this.attributes_['companions'];
};

/**
* Getter for whether there are advertising icons present within the advertisement.
* IAB VPAID 2.0 Spec Section 3.2.10
* @return {Boolean} this.attributes_['icons'] True if advertisement has icons present within the unit.
*/
VpaidAd.prototype.getAdIcons = function() {
	console.log('getAdIcons()');
	this.testLog_('Getting ad icons: ' + this.attributes_['icons']);
	return this.attributes_['icons'];
};



//Helper functions

/**
* Handler callback for the AdClickThru button.
* @private
*/
VpaidAd.prototype.adClickThruHandler_ = function() {
	console.log('adClickThruHandler_()');
	this.testLog_('AdClickThru Handler');
	if (this.isEventSubscribed_('AdClickThru')) {
		var adClickThruUrl = document.getElementById('inputSlot').value;
		this.testLog_('adClickThru(' + adClickThruUrl + ', null, true)');
		//Url, null is the clickThruID, and true refers to player handling the clickthru rather than ad unit
		this.eventCallbacks_['AdClickThru'](adClickThruUrl, null, false);
	}
	else {
		this.testLog_('Error: AdClickThru function callback not subscribed');
	}
};

/**
* Handler callback for the AdError button.
* @private
*/
VpaidAd.prototype.adErrorHandler_ = function() {
	console.log('adErrorHandler_()');
	this.testLog_('AdError Handler');
	if (this.isEventSubscribed_('AdError')) {
		var adErrorMessage = document.getElementById('inputSlot').value;
		this.testLog_('adError(' + adErrorMessage + ')');
		this.eventCallbacks_['AdError'](adErrorMessage);
	}
	else {
		this.testLog_('Error: AdError function callback not subscribed');
	}
};

/**
* Handler callback for the AdInteraction button.
* @private
*/
VpaidAd.prototype.adInteractionHandler_ = function() {
	console.log('adInteractionHandler_()');
	this.testLog_('AdInteraction Handler');
	if (this.isEventSubscribed_('AdInteraction')) {
		var adInteractionMessage = document.getElementById('inputSlot').value;
		this.testLog_('adInteraction(' + adInteractionMessage + ')');
		this.eventCallbacks_['AdInteraction'](adInteractionMessage);
	}
	else {
		this.testLog_('Error: AdInteraction function callback not subscribed');
	}
};

/**
* See if a callback is subscribed in this.eventCallbacks_.
* @param {string} eventName The name of the callback to be verified.
* @return {Boolean} True if this.eventCallbacks_ contains the callback.
* @private
*/
VpaidAd.prototype.isEventSubscribed_ = function(eventName) {
	console.log('isEventSubscribed(' + eventName + '): ' + (typeof(this.eventCallbacks_[eventName]) === 'function'));
	return typeof(this.eventCallbacks_[eventName]) === 'function';
};

/**
* Renders the HTML slot to house buttons in order to interact with player and test events.
* @private
*/
VpaidAd.prototype.renderSlot_ = function() {
	console.log('renderSlot_()');
	var slotExists = (this.slot_ && this.slot_.tagName === 'DIV');
	if (!slotExists) {
		this.slot_ = document.createElement('div');
		if (!document.body) {
			document.body = document.createElement('body');
		}
		document.body.appendChild(this.slot_);
	}
	this.slot_.innerHTML = VpaidAd.HTML_TEMPLATE;
};

/**
* Logs events to the logSlot div for testing purposes.
* @private
*/
VpaidAd.prototype.testLog_ = function(message) {
	var logBox = document.getElementById('logSlot');
	if (logBox.innerHTML === 'Boogie') {
		logBox.innerHTML = message;
	}
	else {
		//Clear up the log if it's gotten too full
		if(this.logCounter_ > 10) {
			logBox.innerHTML = " ";
			this.logCounter_ = 0;
		}
		logBox.innerHTML += ("<br>" + message);
		this.logCounter_++;
	}
};
/**
* Triggers different VPAID events to test player compliance - bound to buttons.
* @private
*/
VpaidAd.prototype.triggerEvent_ = function(value) {
	console.log('triggerEvent_(' + value + ')');
	switch (value) {
		case 'AdClickThru':
			this.adClickThruHandler_();
			break;
		case 'AdError':
			this.adErrorHandler_();
			break;
		case 'AdInteraction':
			this.adInteractionHandler_();
			break;
		case 'AdImpression':
			this.testLog_(value);
      console.log("ad impression clicked - custom");
			this.fireTestingPixel_(value);
			this.eventCallbacks_[value]();
			break;
		case 'AdVideoStart':
      console.log("ad impression clicked - custom");
			this.testLog_(value+"dharmik");
			this.fireTestingPixel_(value);
			this.eventCallbacks_[value]();
			break;
		case 'AdVideoFirstQuartile':
			this.testLog_(value);
			this.fireTestingPixel_(value+"dharmik");
      console.log("ad impression clicked - custom");
			this.eventCallbacks_[value]();
			break;
		case 'AdVideoMidpoint':
			this.testLog_(value);
			this.fireTestingPixel_(value);
			this.eventCallbacks_[value]();
			break;
		case 'AdVideoThirdQuartile':
			this.testLog_(value);
			this.fireTestingPixel_(value);
			this.eventCallbacks_[value]();
			break;
		case 'AdVideoComplete':
			this.testLog_(value);
			this.fireTestingPixel_(value);
			this.eventCallbacks_[value]();
			break;
		default:
			this.testLog_(value);
			this.eventCallbacks_[value]();
	}
};

/**
* Binds the relevant event trigger to each button in the HTML.
* @private
*/
VpaidAd.prototype.addButtonListeners_ = function() {
	//For VPAID Dispatched Events
	var ignoredEvents = ['AdLoaded', 'AdSkippableStateChange', 'AdLinearChange', 'AdRemainingTimeChange', 'AdUserAcceptInvitation', 'AdUserMinimize', 'AdUserClose', 'AdLog'];
	var validVpaidEvents = ['AdStarted', 'AdStopped', 'AdSkipped', 'AdSizeChange', 'AdDurationChange', 'AdExpandedChange', 'AdVolumeChange', 'AdImpression', 'AdVideoStart', 'AdVideoFirstQuartile', 'AdVideoMidpoint', 'AdVideoThirdQuartile', 'AdVideoComplete', 'AdClickThru', 'AdInteraction', 'AdPaused', 'AdPlaying', 'AdError'];
	for (var eventName in this.eventCallbacks_) {
		if (ignoredEvents.indexOf(eventName) > -1) {
			console.log('Ignoring ' + eventName);
		}
		else if (validVpaidEvents.indexOf(eventName) > -1) {
			var triggerEvent = document.getElementById(eventName);
			if (triggerEvent !== null) {
				triggerEvent.addEventListener('click', function(tempEventName) {
					this.triggerEvent_(tempEventName);
				}.bind(this, eventName));
			}
			else {
				console.log("triggerEvent is null for event " + eventName + "!");
			}
			console.log(eventName + ' bound to ' + triggerEvent.innerHTML + ' button.');
		}
		//Some players add custom callbacks - don't want to bind those to any buttons
		else {
			console.log('Ignoring custom event ' + eventName);
		}
	}
};

/**
* Fires a bogus pixel asynchronously at each quartile event for testing purposes
* @param {string} quartileName The name of the quartile we're checking.
*/
// http://s.innovid.com/1x1.gif?project_hash=1hi0a7&client_id=231&video_id=63295&channel_id=315821&publisher_id=1942&placement_tag_id=0&project_state=2&r=[timestamp]&placement_hash=1im0i9&action=vpoint&event_id=percent&event_value=25
VpaidAd.prototype.fireTestingPixel_ = function(quartileName) {
	console.log('fireTestingPixel_() - ' + quartileName);
	var tmpImg = new Image();
	tmpImg.src = "http://s.innovid.com/1x1.gif?project_hash=1hi0a7&client_id=231&video_id=63295&channel_id=315821&" +
		"publisher_id=1942&placement_tag_id=0&project_state=2&r=" + (new Date().getTime()) +
		"&placement_hash=1im0i9&action=" + quartileName + " ";
};

/**
* Main function called by player in order to get the VPAID advertisement.
* IAB VPAID 2.0 Spec Section 8.1.4
* @return {Object} The VPAID advertisement.
*/
var getVPAIDAd = function() {
	return new VpaidAd();
};
