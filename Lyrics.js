/**
 * This sample demonstrates a simple skill built with the Amazon Alexa Skills
 * nodejs skill development kit.
 * This sample supports multiple lauguages. (en-US, en-GB, de-DE).
 * The Intent Schema, Custom Slots and Sample Utterances for this skill, as well
 * as testing instructions are located at https://github.com/alexa/skill-sample-nodejs-fact
 **/

'use strict';

const Alexa = require('alexa-sdk');
const http = require('http');
var url = 'http://api.chartlyrics.com/';
var args = {SearchLyric: 'value'};
const APP_ID = undefined;  // TODO replace with your app ID (OPTIONAL).

const handlers = {
  'GetLyrics': function () {
    var song = this.event.request.intent.slots.Song.value;
    getLyricsPage(song, null, this, function (lyrics, artist, emitter) {
      emitter.emit(':tell', "Lyrics of " + song + " by " + artist + ":, " + lyrics);
    });
  },
  'GetLyricsWithArtist' : function () {
    var song = this.event.request.intent.slots.Song.value;
    var artist = this.event.request.intent.slots.artist.value;
    console.log("Song: " + song + " Artist: " + artist);
    getLyricsPage(song, artist, this, function (lyrics, artist, emitter) {
      emitter.emit(':tell', "Lyrics of " + song + " by " + artist + ":, " + lyrics);
    });
  },
  'LaunchRequest' : function () {
    this.emit(':tell', "This is a skill to find the lyrics of a song");
  },
  'AMAZON.HelpIntent': function () {
    this.emit(':tell', "Ask me to find a lyric, for example say: Alexa ask lyric finder for Wonderwall by oasis");
  },
  'AMAZON.CancelIntent': function () {
    this.emit(':tell', this.t('STOP_MESSAGE'));
  },
  'AMAZON.StopIntent': function () {
    this.emit(':tell', this.t('STOP_MESSAGE'));
  }
};

exports.handler = function (event, context) {
  const alexa = Alexa.handler(event, context);
  alexa.APP_ID = APP_ID;
  // To enable string internationalization (i18n) features, set a resources object.
  alexa.registerHandlers(handlers);
  alexa.execute();
};

function getLyricsPage(title, artist, emitter, callback) {
  title = "song%3A" + title.replace(/ /g, "+");
  var query;
  if (artist !== null) {
    artist = "artist%3A" + artist.replace(/ /g, "+");
    query = title + '+' + artist;
  } else {
    query = title;
  }

  console.log(query);
  var url = {host: 'www.songtexte.com', path: '/search?q=' + query + '&c=all', connection:'keep-alive'};
  //console.log("URL: " + url.host + url.path);
  var request = http.get(url, function(response) {
    var body = '';
    response.on('data', function (d) {
      body += d;
    });
    response.on('end', function () {
      //console.log(body);
      var songresult = body.split('class="song"><a href=\"')[1].split('\"')[0];
      var lyricurl = {host: 'www.songtexte.com', path: '/' + songresult, connection:'keep-alive'};
      console.log("Lyric Url: " + lyricurl.host + lyricurl.path);
      getLyrics(lyricurl, emitter, callback);
    });
  });
}

function getLyrics(lyricurl, emitter, callback) {
  var request = http.get(lyricurl, function (res) {
    var lyricsbody = '';
    //console.log("TEST");
    res.on('data', function (d) {
      lyricsbody += d;
    });
    res.on('end', function () {
      //console.log("Starting getting lyric");
      var artist = lyricurl.path.split("/")[2];
      var body = lyricsbody.split('div id=\"lyrics\">')[1].split('</div>\n\n')[0].replace(/<[^>]*>/g, "");
      body = body.replace(/&#039;/g, '\'').replace(/(\n)+/g, ",\n");
      console.log(body);
      callback(body, artist, emitter);
    });
  });
}

//getLyricsPage('Love Song', 'sara', null, function () {});