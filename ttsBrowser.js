/**
Copyright (c) Microsoft Corporation
All rights reserved. 
MIT License
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the ""Software""), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
**/

var access_token;
var fs = require('fs');
var fPF = require('fetch-ponyfill')();
var Tutorials = require('./tutorials');

function Synthesize(text) {

  // Note: The way to get api key:
  // Free: https://www.microsoft.com/cognitive-services/en-us/subscriptions?productId=/products/Bing.Speech.Preview
  // Paid: https://portal.azure.com/#create/Microsoft.CognitiveServices/apitype/Bing.Speech/pricingtier/S0
  var post_speaker_data = `<?xml version="1.0"?><speak version="1.0" xml:lang="en-us"><voice xml:lang="en-us" xml:gender="Female" name="Microsoft Server Speech Text to Speech Voice (en-US, ZiraRUS)">${text}</voice></speak>`;
  return getAccessToken().then((access_token) => {
    const req = {
      method: "POST",
      body: post_speaker_data,
      credentials: "include",
      headers: {
        'content-type': 'application/ssml+xml',
        'x-microsoft-outputFormat': 'riff-16khz-16bit-mono-pcm',
        'Authorization': 'Bearer ' + access_token,
        'X-Search-AppId': '07D3234E49CE426DAA29772419F436CA',
        'X-Search-ClientID': '1ECFAE91408841A480F00935DC390960',
      }
    };
    return fPF.fetch('https://speech.platform.bing.com/synthesize', req);
  }).then((res) => {
    return res.arrayBuffer();
    // }).then((buf) => {
    //   window.AudioContext = window.AudioContext || window.webkitAudioContext;
    //   context = new AudioContext();
    //   source = context.createBufferSource();
    //   return context.decodeAudioData(buf);
    // }).then((buffer) => {
    //   source.buffer = buffer;
    //   source.connect(context.destination);
    //   source.start(context.currentTime);
  }).catch((err) => {
    console.dir(err, { depth: null });
  });
}

function getAccessToken() {
  var apiKey = "0bdca40a997b4e8299e26c4068943921";
  var reqOptions = {
    method: "POST",
    headers: {
      'Ocp-Apim-Subscription-Key': apiKey
    }
  };
  if (!access_token) {
    return fPF.fetch('https://api.cognitive.microsoft.com/sts/v1.0/issueToken', reqOptions).then((res) => {
      return res.text();
    }).then((token) => {
      access_token = token;
    });
  } else {
    return Promise.resolve(access_token);
  }
}

function ab2str(buf) {
  return String.fromCharCode.apply(null, new Uint16Array(buf));
}

function str2ab(str) {
  var buf = new ArrayBuffer(str.length * 2); // 2 bytes for each char
  var bufView = new Uint16Array(buf);
  for (var i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}

var tuts = Tutorials.initializeTutorials();

//console.dir(tuts, { depth: null, colors: true });
var tut = tuts[0];
//tuts.forEach((tut) => {
Synthesize(tut.name).then((buf) => {
  fs.writeFileSync('foo.txt', buf);
});
//});



