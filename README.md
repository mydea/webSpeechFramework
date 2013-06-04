webSpeechFramework
==================

A small framework to help developers to work with the Web Speech API.

What it does
==================
I have developed the webSpeechFramework because I have explored the new and cutting edge Web Speech API for my bachelor thesis.

This framework gives developers an easy way to add commands that should be parsed by the speech recognition. This means, that you can tie functions to voice commands.

For more information on the Web Speech API, please visit: http://updates.html5rocks.com/2013/01/Voice-Driven-Web-Apps-Introduction-to-the-Web-Speech-API

Usage
==================
Download the file webSpeechFramework.js and included it in your document.

Create a list of commands that should be parsed:<pre>var testCommands = [
	{
		'command':'stop',
		'call': 'test1'
	},
	{
		'command':'play now',
		'call': 'test2'
	},
	{
		'command':'welcome',
		'call': 'test3'
	},
	{
		'command':'skip this one',
		'call': 'test4'
	}
];</pre>

Create functions for the commands. For the example above, you would have to create the following functions:
<pre>
    function test1() {...}
    function test2() {...}
    function test3() {...}
    function test4() {...}
</pre>

Initialise the webSpeechFramework:  ```var speech = new WebSpeechFramework("en_UK", 5, testCommands);```

Start speech recognition: ```speech.start()```

Stop speech recognition: ```speech.stop()```

Add new commands after initialisation: ```speech.addCommands(commandList)```

Customisation
==================
<pre>
var lang = en_UK; // or any similar language-code like de_DE
var variance = 5; // integer from 0 to 10 - in doubt, set to 5
var commands = {}; // Object with the commands and the functions to call

var speech = new WebSpeechFramework(lang, variance, commands);
</pre>
At the moment, there are only the most basic options to customise the webSpeechFramework. 
When initialising a new WebSpeechFramework-object, you have to set the **language** that should be used and the **variance**. 
The variance should be an integer between 0 and 10. 
The lower this value is, the stricter it will be when checking for results. 
For example, with a variance of 0, it will only take 100% correct results: If the command you set way "House", it would not fire on "Houses". 
If you set a medium variance of around 5 (which is recommended) it would fire on Houses. 
If you set a very high variance like 10, it would fire on similar terms like Houston.

This is realised with the so-called Levenshtein function. This function returns the difference between two strings as a number. 
In addition, the length of the term is taken into account: For longer terms, a bigger difference will be accepted.

Keep in mind
==================
A basic parsing of "human-written" phrases will be done. For example, speech recognition will (in the current implementation by Google) never return numbers or punctuation marks.
Therefore, do not use them in your commands. Punctuation marks will be stripped out, and numbers will simply not work! Also, try not to use long sentences.
<pre>
"How are you?" => "how are you"
"I don't know, what do you think?" => "what do you think"
"Start now!" => "start now"
</pre>

Demo
==================
A very basic implementation of the webSpeechFramework can be found here: http://www.fnovy.com/projects/webspeechframework

Credits
==================
This small framework has been developed by Francesco Novy: contact@fnovy.com // www.fnovy.com


Licence
==================
Licensed under the MIT License:
Copyright 2013 Francesco Novy

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.