/* Constructor */
function WebSpeechFramework(lang, variance, commandList) {
	this.commands = [];
	// Defaults
	if(typeof lang === "undefined" || lang === null) lang = "en_UK";
	if(typeof variance === "undefined" || variance === null) variance = 5;
	if(typeof commandList === "object") {
		this.addCommands(commandList);
	}
	
	this.lang = lang;
	this.variance = variance;
	this.isRecording = false;
	this.errorMsgList = {
		'no-speech': 'Speech Recognition Error: No speech has been detected.',
		'audio-capture': 'Speech Recognition Error: No microphone was found.',
		'not-allowed': 'Speech Recognition Error: You need to have a connected microphone and grant the browser permission to use it.',
		'no-support': 'Speech Recognition Error: It seems like your browser has no support for Speech Recognition.'
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
	if(commandKey != null) {
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
	var variance = getVarianceValue(word, this.variance);
	
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
	console.log("Speech Recognition initialised");
	var SpeechRecognition = window.SpeechRecognition || 
													window.webkitSpeechRecognition || 
													window.mozSpeechRecognition || 
													window.oSpeechRecognition || 
													window.msSpeechRecognition;
	
	// If Speech Recognition is not supported by the browser
	if(!SpeechRecognition) {
		this.displayMessage("Speech Recognition Error: It seems like your browser has no support for Speech Recognition.");
		return false;
	}
	
	var rec = new SpeechRecognition;
	rec.parent = this;
	rec.continuous = true; // We want to keep recording
	rec.interimResults = true; // We want to get all results
	
	// Display information regarding permission
	this.displayMessage("Please allow microphone access!");
	
	// After the user has given his permission
	rec.onstart = function() {
		this.isRecording = true;
	};
	rec.onresult = function(event) {
		console.log("Result received:");
		var transcript = "";
		for(var i=event.resultIndex; i<event.results.length; i++) {
			transcript += event.results[i][0].transcript;
		}
		transcript = transcript.trim().toLowerCase();
		var cmd = this.parent.checkInput(transcript);
		if(cmd) { 
			this.parent.callFunction(cmd.command);
		}
	};
	rec.onerror = function(event) {
		var error = event.error;
		var errorMsg = "Sorry, a problem with the speech recognition has occured. Error-Code: "+error;
		
		var errorMsgList = this.parent.errorMsgList;
		if(errorMsgList[error]) errorMsg = errorMsgList[error];
		console.error(errorMsg);
	this.	parent.displayMessage(errorMsg);
	};
	rec.onend = function() {
		console.log("Speech Recognition stopped")
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
 * If no support is detected
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
		div.setAttribute("style", "position: absolute; border: 2px dotted red; background: rgb(255,230,230); padding: 10px; left: 0; top: 0; right: 0; text-align: center; font-size: 25px; z-index: 9999; cursor: pointer;");
		div.setAttribute("onclick", "this.parentNode.removeChild(this);");
		
		document.body.appendChild(div);
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