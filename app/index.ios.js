// 'use strict';

var styles = require('./styles.js');
var React = require('react-native');
var t = require('tcomb-form-native');

var name = name || 'anonymous';

var {
  AppRegistry,
  Text,
  View,
  TouchableHighlight,
  NavigatorIOS,
  InitialView
} = React;

var io = require('react-native-sockets-io');

var Form = t.form.Form;

var Message = t.struct({
  name: t.Str,
  message: t.Str
});

var options = {
  fields: {
    name: {
      placeholder: 'Your name',
      error: 'You have to enter a name!'
    },
    message: {
      placeholder: 'Enter a message',
      error: 'You have to enter a message!',
      multiline: true
    }
  }
};

// App container (top of the tree)
var app = React.createClass({
  render: function(){
    return (
      <NavigatorIOS
        style={styles.container}
        tintColor='#FF6600'
        initialRoute={{
          title: 'Chat Room',
          component: ChatRoom
        }} />
    )
  }
})

var ChatRoom = React.createClass({
  getInitialState: function() {
    return {io: io('http://localhost:5000', {jsonp: false})};
  },

  componentDidMount: function() {
    this.state.io.emit('chat message', {name: name, chat: 'hello'});
  },

  render: function() {
    return (
      <View style={styles.container}>
        <View style={styles.chatBox}>
          <ChatList socket={this.state.io} />
        </View>
        <View style={styles.formBox}>
          <MessageForm socket={this.state.io} />
        </View>
      </View>
    );
  }
});

// List of messages
var ChatList = React.createClass({
  getInitialState: function(){
    return {messages: []};
  },
  propTypes: {
    socket: React.PropTypes.any
  },
  componentDidMount: function(){
  //Must specifiy 'jsonp: false' since react native doesn't provide the dom
  //and thus wouldn't support creating an iframe/script tag
    this.props.socket.on('chat message', (msg) =>{
      this.state.messages.push(msg);
      this.forceUpdate();
    });
  },
  render: function(){
    return (
      <View>
        {
          this.state.messages.map(m => {
            return <Text>{m.name}: {m.chat}</Text>;
          })
        }
      </View>
    );
  }
});

// Unified Input Field

var MessageForm = React.createClass({
  onPress: function() {
    // call getValue to get values of the form

    var value = this.refs.form.getValue();
    if (value) {
      this.send(value);
    }
  },
  propTypes: {
    socket: React.PropTypes.any
  },
  send: function(message) {
    this.props.socket.emit('chat message', {name: name, chat: message});
  },

  render: function() {
    return (
      <View style={styles.container}>
        <Form
          ref="form"
          type={Message}
          option={options}
        />
        <TouchableHighlight style={styles.button} onPress={this.onPress} underlayColor="#99d9f4">
          <Text style={styles.buttonText}>Send</Text>
        </TouchableHighlight>
      </View>
    );
  }
});

AppRegistry.registerComponent('app', () => app);
