/* Constructor */
function WebSpeechFramework(config, commandList) {
	this.commands = [];
	this.config = {};
	
	// Defaults
	if(typeof config.lang === "undefined" || config.lang === null) config.lang = "en_UK";
	if(typeof config.variance === "undefined" || config.variance === null || !is_int(config.variance)) config.variance = 5;
	if(typeof config.displayConsoleLog === "undefined" || config.displayConsoleLog === null || config.displayConsoleLog !== true) config.displayConsoleLog = false;
	if(typeof config.displayErrorMessages === "undefined" || config.displayErrorMessages === null || config.displayErrorMessages !== false) config.displayErrorMessages = true;
	if(typeof config.displayNoSupportMessage === "undefined" || config.displayNoSupportMessage === null || config.displayNoSupportMessage !== false) config.displayNoSupportMessage = true;
	if(typeof config.displayAllowMessage === "undefined" || config.displayAllowMessage === null || config.displayAllowMessage !== false) config.displayAllowMessage = true;
	if(typeof config.addDefaultErrorStyling === "undefined" || config.addDefaultErrorStyling === null || config.addDefaultErrorStyling !== false) config.addDefaultErrorStyling = true;
	if(typeof commandList === "object") {
		this.addCommands(commandList);
	}
	
	this.config = config;

	this.isRecording = false;
	this.errorMsgList = {
		'no-speech': 'Speech Recognition Error: No speech has been detected.',
		'audio-capture': 'Speech Recognition Error: Audio capture has failed. Maybe no microphone has been found?',
		'not-allowed': 'Speech Recognition Error: You need to have a connected microphone and grant the browser permission to use it.',
		'no-support': 'Speech Recognition Error: It seems like your browser has no support for Speech Recognition.',
		'network': 'Speech Recognition Error: There seems to be a problem with the network communication.',
		'aborted': 'Speech Recognition Error: It seems like speech input was aborted!',
		'language-not-supported': 'Speech Recognition Error: The specified language is not supported!'
	};

}

/*
 * Adds commands that should be executed
 */
WebSpeechFramework.prototype.addCommands = function(commandList) { 
	if(typeof commandList !== "object") { return false; }
	for (var key in commandList) {
		if(!window[commandList[key].call]) { 
			temp = {};
		}
		else {
			temp = {};
			temp.command = webSpeechSaveString(commandList[key].command);
			temp.call = window[commandList[key].call];
			this.commands[key] = temp;
		}
	}
	return true;
};

/*
 * Calls the function for a phrase
 */
WebSpeechFramework.prototype.callFunction = function(word) { 
	var commandList = this.commands;
	var commandKey = null;
	for (var key in commandList) {
		if(commandList[key].command === word)
			commandKey = key;
	}
	if(commandKey !== null) {
		this.commands[commandKey]["call"]();
		return true;
	} else
		return false;
};

/*
 * Checks a result 
 */
WebSpeechFramework.prototype.checkInput = function(word) { 
	var commandList = this.commands;
	var variance = getVarianceValue(word, this.config.variance);
	
	var commandKey = null;
	var bestDiff = 999999;
	
	for (var key in commandList) {
		var word1 = webSpeechSaveString(word);
		var word2 = webSpeechSaveString(commandList[key].command);
		
		
		var diff = levenshtein(word1, word2);
		//console.log(commandList[key] + ": diff " + diff);
		if(diff <= variance && (diff < bestDiff) ) {
			commandKey = key;
			bestDiff = diff;
		} 
	}
	if(commandKey !== null) return commandList[commandKey]; else return false;
};

/*
 * Start speech recognition
 */
WebSpeechFramework.prototype.start = function() { 
	if(this.config.displayConsoleLog) console.log("Speech Recognition initialised");
	var SpeechRecognition = window.SpeechRecognition || 
													window.webkitSpeechRecognition || 
													window.mozSpeechRecognition || 
													window.oSpeechRecognition || 
													window.msSpeechRecognition;
	
	// If Speech Recognition is not supported by the browser
	if(!SpeechRecognition) {
		if(this.config.displayNoSupportMessage) this.displayMessage("Speech Recognition Error: It seems like your browser has no support for Speech Recognition.");
		return false;
	}
	
	var rec = new SpeechRecognition;
	rec.parent = this;
	rec.lang = this.config.lang;
	rec.continuous = true; // We want to keep recording
	rec.interimResults = true; // We want to get all results
	
	// Display information regarding permission
	if(this.config.displayAllowMessage)  this.displayMessage("Please allow microphone access!");
	
	// After the user has given his permission
	rec.onstart = function() {
		// Call specified function
		if(typeof this.parent.config.onstart !== "undefined" || this.parent.config.onstart !== null) {
			if(window[this.parent.config.onstart]) {
				this.parent.config[onstart](event);
			}
		}
		this.parent.isRecording = true;
		this.parent.hideMessage();
	};
	rec.onresult = function(event) {
		// Call specified function
		if(typeof this.parent.config.onresult !== "undefined" || this.parent.config.onresult !== null) {
			if(window[this.parent.config.onresult]) {
				this.parent.config[onresult](event);
			}
		}
		var transcript = "";
		for(var i=event.resultIndex; i<event.results.length; i++) {
			transcript += event.results[i][0].transcript;
		}
		transcript = transcript.trim().toLowerCase();
		if(this.parent.config.displayConsoleLog) console.log("Result received: '" + transcript + "'");
		var cmd = this.parent.checkInput(transcript);
		if(cmd) { 
			this.parent.callFunction(cmd.command);
		}
	};
	rec.onerror = function(event) {
		// Call specified function
		if(typeof this.parent.config.onerror !== "undefined" || this.parent.config.onerror !== null) {
			if(window[this.parent.config.onerror]) {
				this.parent.config[onerror](event);
			}
		}
		var error = event.error;
		var errorMsg = "Sorry, a problem with the speech recognition has occured. Error-Code: "+error;
		
		var errorMsgList = this.parent.errorMsgList;
		if(errorMsgList[error]) errorMsg = errorMsgList[error];
		
		if(this.parent.config.displayConsoleLog) console.error(errorMsg);
		if(this.parent.config.displayErrorMessages) this.	parent.displayMessage(errorMsg);
	};
	rec.onend = function() {
		// Call specified function
		if(typeof this.parent.config.onend !== "undefined" || this.parent.config.onend !== null) {
			if(window[this.parent.config.onend]) {
				this.parent.config[onend](event);
			}
		}
		if(this.parent.config.displayConsoleLog) console.log("Speech Recognition stopped")
		this.isRecording = false;
	};
	
	rec.start();
	this.rec = rec;
	return true;
};

/*
 * Stop speech recognition
 */
WebSpeechFramework.prototype.stop = function() { 
	this.rec.stop();
	return true;
};

/*
 * Display a message
 */
WebSpeechFramework.prototype.displayMessage = function(message) { 
	var div;
	if(div = document.getElementById("webspeech_message")) {
		div.innerHTML = message;
	} else {
		div = document.createElement("div");
		div.setAttribute("id", "webspeech_message_container");
		
		innerDiv = document.createElement("div");
		innerDiv.setAttribute("id", "webspeech_message");
		txt = document.createTextNode(message);
		innerDiv.appendChild(txt);
		
		closebtn = document.createElement("div");
		closebtn.setAttribute("id", "webspeech_message_closebutton");
		closebtn.setAttribute("style", "position: absolute; right: 10px; top: 0;");
		txt2 = document.createTextNode("");
		closebtn.appendChild(txt2);
		
		div.appendChild(innerDiv);
		div.appendChild(closebtn);
		if(this.config.addDefaultErrorStyling) div.setAttribute("style", "position: fixed; border: 2px dotted red; background: rgba(255,230,230,0.90); padding: 10px; left: 0; top: 0; right: 0; text-align: center; font-size: 25px; z-index: 9999; cursor: pointer;");
		div.setAttribute("onclick", "this.parentNode.removeChild(this);");
		if(this.config.addDefaultErrorStyling) div.setAttribute("onmouseover", "this.style.background = 'rgb(255,180,180)'");
		if(this.config.addDefaultErrorStyling) div.setAttribute("onmouseout", "this.style.background = 'rgba(255,230,230,0.90)'");
		
		document.body.appendChild(div);
	}
}
/*
 * Hide a message (if one is displayed)
 */
WebSpeechFramework.prototype.hideMessage = function() { 
	if(div = document.getElementById("webspeech_message_container")) {
		div.parentNode.removeChild(div);
	}
}

// Levenshtein function for string difference
function levenshtein (s1, s2) {
  // http://kevin.vanzonneveld.net
  // +            original by: Carlos R. L. Rodrigues (http://www.jsfromhell.com)
  // +            bugfixed by: Onno Marsman
  // +             revised by: Andrea Giammarchi (http://webreflection.blogspot.com)
  // + reimplemented by: Brett Zamir (http://brett-zamir.me)
  // + reimplemented by: Alexander M Beedie
  // *                example 1: levenshtein('Kevin van Zonneveld', 'Kevin van Sommeveld');
  // *                returns 1: 3
  if (s1 == s2) {
    return 0;
  }

  var s1_len = s1.length;
  var s2_len = s2.length;
  if (s1_len === 0) {
    return s2_len;
  }
  if (s2_len === 0) {
    return s1_len;
  }

  // BEGIN STATIC
  var split = false;
  try {
    split = !('0')[0];
  } catch (e) {
    split = true; // Earlier IE may not support access by string index
  }
  // END STATIC
  if (split) {
    s1 = s1.split('');
    s2 = s2.split('');
  }

  var v0 = new Array(s1_len + 1);
  var v1 = new Array(s1_len + 1);

  var s1_idx = 0,
    s2_idx = 0,
    cost = 0;
  for (s1_idx = 0; s1_idx < s1_len + 1; s1_idx++) {
    v0[s1_idx] = s1_idx;
  }
  var char_s1 = '',
    char_s2 = '';
  for (s2_idx = 1; s2_idx <= s2_len; s2_idx++) {
    v1[0] = s2_idx;
    char_s2 = s2[s2_idx - 1];

    for (s1_idx = 0; s1_idx < s1_len; s1_idx++) {
      char_s1 = s1[s1_idx];
      cost = (char_s1 == char_s2) ? 0 : 1;
      var m_min = v0[s1_idx + 1] + 1;
      var b = v1[s1_idx] + 1;
      var c = v0[s1_idx] + cost;
      if (b < m_min) {
        m_min = b;
      }
      if (c < m_min) {
        m_min = c;
      }
      v1[s1_idx + 1] = m_min;
    }
    var v_tmp = v0;
    v0 = v1;
    v1 = v_tmp;
  }
  return v0[s1_len];
}

function getVarianceValue(str, variance) {
	var len = str.length;
	var value = 0;
	if(variance === 0) return 0;
	
	value = variance*0.3 * Math.log(len);
	return Math.floor(value);
}

function webSpeechSaveString(str) {
	str = str.trim().toLowerCase();
	//str = numbersToWords(str);
	str = str.replaceAll(". ", " ").replaceAll(".", " ");
	str = str.replaceAll("! ", " ").replaceAll("!", " ");
	str = str.replaceAll("? ", " ").replaceAll("?", " ");
	str = str.replaceAll(", ", " ").replaceAll(",", " ");
	str = str.replaceAll("; ", " ").replaceAll(";", " ");
	str = str.replaceAll("ß", "ss");
	str = str.replace(/ +(?= )/g,'');
	
	return str.trim();
}

String.prototype.replaceAll = function(search, replace)
{
    //if replace is null, return original string otherwise it will
    //replace search string with 'undefined'.
    if(!replace) 
        return this;

    return this.replace(new RegExp('[' + search + ']', 'g'), replace);
};

// Convert numbers to words
// copyright 25th July 2006, by Stephen Chapman http://javascript.about.com
// permission to use this Javascript on your web page is granted
// provided that all of the code (including this copyright notice) is
// used exactly as shown (you can change the numbering system if you wish)

// American Numbering System
var th = ['','thousand','million', 'billion','trillion'];
// uncomment this line for English Number System
// var th = ['','thousand','million', 'milliard','billion'];

var dg = ['zero','one','two','three','four', 'five','six','seven','eight','nine']; var tn = ['ten','eleven','twelve','thirteen', 'fourteen','fifteen','sixteen', 'seventeen','eighteen','nineteen']; var tw = ['twenty','thirty','forty','fifty', 'sixty','seventy','eighty','ninety']; function numbersToWords(s){s = s.toString(); s = s.replace(/[\, ]/g,''); if (s != parseFloat(s)) return 'not a number'; var x = s.indexOf('.'); if (x == -1) x = s.length; if (x > 15) return 'too big'; var n = s.split(''); var str = ''; var sk = 0; for (var i=0; i < x; i++) {if ((x-i)%3==2) {if (n[i] == '1') {str += tn[Number(n[i+1])] + ' '; i++; sk=1;} else if (n[i]!=0) {str += tw[n[i]-2] + ' ';sk=1;}} else if (n[i]!=0) {str += dg[n[i]] +' '; if ((x-i)%3==0) str += 'hundred ';sk=1;} if ((x-i)%3==1) {if (sk) str += th[(x-i-1)/3] + ' ';sk=0;}} if (x != s.length) {var y = s.length; str += 'point '; for (var i=x+1; i<y; i++) str += dg[n[i]] +' ';} return str.replace(/\s+/g,' ');}

function is_int (mixed_var) {
  // http://kevin.vanzonneveld.net
  // +   original by: Alex
  // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // +    revised by: Matt Bradley
  // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // +   improved by: WebDevHobo (http://webdevhobo.blogspot.com/)
  // +   improved by: Rafał Kukawski (http://blog.kukawski.pl)
  // %        note 1: 1.0 is simplified to 1 before it can be accessed by the function, this makes
  // %        note 1: it different from the PHP implementation. We can't fix this unfortunately.
  // *     example 1: is_int(23)
  // *     returns 1: true
  // *     example 2: is_int('23')
  // *     returns 2: false
  // *     example 3: is_int(23.5)
  // *     returns 3: false
  // *     example 4: is_int(true)
  // *     returns 4: false

  return mixed_var === +mixed_var && isFinite(mixed_var) && !(mixed_var % 1);
}