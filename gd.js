var GoogleTokenProvider = require("refresh-token").GoogleTokenProvider,
    async = require('async'),
    request = require('request'),
    _accessToken;

const CLIENT_ID = '828119196842-34csj50bnadigacaginr6hao9joaedhu.apps.googleusercontent.com';
const CLIENT_SECRET = 'A1Z8XgOtJmTTcE64xfigguAq';
const REFRESH_TOKEN = '1/FHu9jo-z5S-R9sJLmkua8ZbPNgqIVgN4hcHL6OSx5IU';
const ENDPOINT_OF_GDRIVE = 'https://www.googleapis.com/drive/v2';
const FOLDER_ID = '0B5vDRXj752PWQm13alQxbDd1NTg';

async.waterfall([
  //-----------------------------
  // Obtain a new access token
  //-----------------------------
  function(callback) {
    console.log('starting...');
    var tokenProvider = new GoogleTokenProvider({
      'refresh_token': REFRESH_TOKEN,
      'client_id': CLIENT_ID,
      'client_secret': CLIENT_SECRET
    });
    tokenProvider.getToken(callback);
  },

  //--------------------------------------------
  // Retrieve the children in a specified folder
  // 
  // ref: https://developers.google.com/drive/v2/reference/files/children/list
  //-------------------------------------------
  function(accessToken, callback) {
    console.log('in a get request all children');
    _accessToken = accessToken;
    console.log('accesstoke: %s', _accessToken);
    request.get({
      'url': ENDPOINT_OF_GDRIVE + '/files/' + FOLDER_ID + '/children',
      'qs': {
        'access_token': accessToken
      }
    }, callback);
  },

  //----------------------------
  // Parse the response
  //----------------------------
  function(response, body, callback) {
    console.log('parse the response');
    var list = JSON.parse(body);
    if (list.error) {
      console('error while paaarsing the response');
      return callback(list.error);
    }
    callback(null, list.items);
  },

  //-------------------------------------------
  // Get the file information of the children.
  //
  // ref: https://developers.google.com/drive/v2/reference/files/get
  //-------------------------------------------
  function(children, callback) {
    console.log('itterating over child files');
    async.map(children, function(child, cback) {
      //console.log('now processing: %j', child);
      request.get({
        'url': ENDPOINT_OF_GDRIVE + '/files/' + child.id,
        'qs': {
          'access_token': _accessToken
        }
      }, 
      function(err, response, body) {
        console.log('im get response for child: %s', child.id);
        body = JSON.parse(body);
        if(body.mimeType == 'application/vnd.google-apps.folder') {
          console.log('file is a folder:', body.title);
          cback(body);
        }
        console.log('got response: %j', body);
        cback(null, {
          'title': body.title,
          'md5Checksum': body.md5Checksum
        });
      });
    }, callback);
  }
], function(err, results) {
  if (!err) {
    console.log(results);
  }
  else {
    console.log(err);

  }
});