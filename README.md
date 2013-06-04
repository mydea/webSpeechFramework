webSpeechFramework
==================

A small framework to help developers to work with the Web Speech API.

What it does
==================
I have developed the webSpeechFramework because I have explored the new and cutting edge Web Speech API for my bachelor thesis.

For more information on the Web Speech API, please visit: http://updates.html5rocks.com/2013/01/Voice-Driven-Web-Apps-Introduction-to-the-Web-Speech-API

This framework gives developers an easy way to add commands that should be parsed by the speech recognition.

Usage
==================
* Download the file webSpeechFramework.js and included it in your document.
* Create a list of commands that should be parsed:
```var testCommands = [
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
			];```
* Create functions for the commands. For the example above, you would have to create the following functions:
```function test1() {...}
function test2() {...}
function test3() {...}
function test4() {...}```
* Initialise the webSpeechFramework: ```var speech = new WebSpeechFramework("en_UK", 5, testCommands);```
* Start the speech recognition: ```speech.start()```

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