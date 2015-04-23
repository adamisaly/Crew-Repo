'use strict';
angular.module('crewapp.services', [])

.factory('Auth', function($http, $cordovaOauth, $localStorage, $location) {
  var login = function(user) {
    return $http({
      method: 'POST',
      url: 'http://trycrewapp.com/api/auth/signin',
      data: user
    })
    .then(function(resp){
      return resp.data;
    });
  };

  var fbLogin = function() {
    ionic.Platform.ready(function(){
      $cordovaOauth
        .facebook('440534219447526', ['email'])
        .then(function(result) {
          $localStorage.accessToken = result.access_token;
          $localStorage.expiresIn = Math.floor(Date.now()/1000)+result.expires_in;
          profile();
        }, function(error) {
          alert('something went wrong: ' + error);
        });
    });
  };

  var sendProfile = function (user) {
    return $http({
      method: 'POST',
      url: 'http://trycrewapp.com/api/auth/update',
      data: user
    })
    .then(function(resp){
      $localStorage.groupname = resp.data.group;
      $localStorage.question = resp.data.question;

      if(resp.question){
        $location.path('/chat');
      }else{
        $location.path('/question');
      }
      return resp.data;
    });
  };

  var validate = function() {
    if($localStorage.hasOwnProperty('accessToken') === true &&
        $localStorage.hasOwnProperty('expiresIn') === true &&
        $localStorage.hasOwnProperty('question') === true &&
        $localStorage.hasOwnProperty('groupname') === true &&
        $localStorage.expiresIn > Math.floor(Date.now()/1000)) {
      return true;
    }else{
      alert('You are not signed in');
      $location.path('/');
    }
  };


  var profile = function() {
    if($localStorage.hasOwnProperty('accessToken') === true &&
        $localStorage.hasOwnProperty('expiresIn') === true &&
        $localStorage.expiresIn > Math.floor(Date.now()/1000)) {
      return $http.get('https://graph.facebook.com/v2.2/me', {
        params: {
          access_token: $localStorage.accessToken,
          fields: 'id,name,gender,location,picture.width(168).height(168)',
          format: 'json'
        }
      }).then(function(result) {
        $localStorage.name = result.data.name;
        $localStorage.gender = result.data.gender;
        $localStorage.id = result.data.id;
        $localStorage.picture = result.data.picture.data.url;


        return sendProfile({
          id: result.data.id,
          name: result.data.name,
          gender: result.data.gender,
          picture: result.data.picture.data.url,
          token: $localStorage.accessToken
        }).then(function(result){
          return result;
        });

      }).catch(function(error){
        alert('Error: ' + error);
        $location.path('/');
      });
    }else {
      alert('Not signed in!');
      $location.path('/');
    }
  };

  var logout = function() {
    $localStorage.$reset();
    $location.path('/');
  };

  return {
    login: login,
    logout: logout,
    validate: validate,
    profile: profile,
    fbLogin: fbLogin
  };
})
.factory('Question', function($http, $localStorage){

  var getRandom = function(){
    return $http({
      method: 'GET',
      url: 'http://trycrewapp.com/api/question/random'
    })
    .then(function(resp){
      return resp.data;
    });
  };

  var setQuestion = function(answers){

    if($localStorage.hasOwnProperty('accessToken') === true &&
        $localStorage.hasOwnProperty('expiresIn') === true &&
        $localStorage.hasOwnProperty('question') === true &&
        $localStorage.question === false &&
        $localStorage.expiresIn > Math.floor(Date.now()/1000)) {

      return $http({
        method: 'POST',
        url: 'http://trycrewapp.com/api/question/set',
        data: {
          qres: answers,
          token: $localStorage.accessToken
        }
      })
      .then(function(resp){
        return resp;
      });
    }else{
      alert('Something went wrong');
    }
  };

  return {
    getRandom: getRandom,
    setQuestion: setQuestion
  };

})
.factory('Sockets', function(socketFactory, $http){
  var myIoSocket = io.connect('chat.trycrewapp.com');

  var mySocket = socketFactory({
      ioSocket: myIoSocket
    });

  var rooms = function() {
    return $http({
      method: 'GET',
      url: 'http://trycrewapp.com/api/rooms'
    })
    .then(function(resp){
      console.log(resp.data);
    });
  };

  return {
    rooms: rooms,
    mySocket: mySocket
  }

})
.factory('Groups', function($http){
  var get = function(user) {
    return $http({
      method: 'POST',
      url: 'http://trycrewapp.com/api/groups/',
      data: user
    })
    .then(function(resp){
      return resp.data;
    });
  };

  var leave = function(user) {
    return $http({
      method: 'POST',
      url: 'http://trycrewapp.com/api/groups/leave',
      data: user
    })
    .then(function(resp){
      return resp.data;
    });
  };

  var join = function(user) {
    return $http({
      method: 'POST',
      url: 'http://trycrewapp.com/api/groups/join',
      data: user
    })
    .then(function(resp){
      return resp.data;
    });
  };

  var messages = function(user) {
    return $http({
      method: 'POST',
      url: 'http://trycrewapp.com/api/groups/messages',
      data: user
    })
    .then(function(resp){
      return resp.data;
    });
  };

  var list = function() {
    return 'supposed to return list of others in room';
  };

  return {
    get: get,
    leave: leave,
    join: join,
    messages: messages,
    list: list
  };
})
.factory('plansFactory', function() {
  var services = {};
  return services;
});
