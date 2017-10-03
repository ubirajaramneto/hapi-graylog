# hapi-graylog

### A simple hapi.js logger for graylog

#### How to install?

<code>npm install hapi-graylog</code>

If you want to save it to your package.json file:

<code>npm install -save hapi-graylog</code>

#### What this plugin does?

This plugin was developed in order to send GELF messages from a hapi.js server to a graylog instance through Hapi.js request interface.

The messages are sent in the GELF Format, which you can find more information [here](http://docs.graylog.org/en/2.3/pages/gelf.html).

To send a log message to the Graylog node, just do a request.log() call, and a GELF message will be fired.

#### Does this module sends GELF messages through TCP or HTTP?

No, this plugin can only send messages through UDP, although coding a TCP interface would be very easy to do. Just open an issue if you need it or contribute to the project by coding the TCP interface. Any help is appreciated.

#### Why this plugin was created?

I wanted a Graylog library that was well maintained in order to use it to create a Hapi.js plugin.

Unfortunately I could not find a well suited library that would give me ease of mind for using it in a production environment. So I coded the GELF message factory and UDP interface from scratch, and wrapped it in a small and simple hapi.js plugin.

The GELF factory and UDP sending interface are separated, which will make it easily maintainable if you need to get your hands dirty with it.

The whole core code for this plugin wont pass the 300 lines of code mark, and I plan to keep it small and not add too much stuff to it.

---

## How do I use this plugin?

#### For local development:

1 - First, register it as a hapi plugin:

```javascript
    server.register(require('hapi-graylog'), (err) => {
      if(err) console.log(err)
      ...
    })
```

***Note:*** If you are developing locally and want to send logs to a local graylog instance, the above code will work out of the box. It will send logs to `localhost` on port `12202`, with a max buffer size of `1350`.

2 - To send logs:

<code>

    request.log('emergency', {some_field: 'some data', short_message: 'foobar'})

</code>

#### For sending messages to a production/staging graylog server:

1 - First register it as a hapi plugin, and describe your configuration options:

```javascript
    server.register({
      register: require('hapi-graylog'),
      options: {
        host: 'your.graylog.server.url',        // <-- defaults to 'localhost'
        port: 12203,                            // <-- defaults to 12202
        config: {
          MAX_BUFFER_SIZE: 700                  // <-- defaults to 1350
        }
      }
    }, (err) => {
      if(err) console.log(err)
      ...
    })
```

***Note:*** The max buffer size is just a constant to tell if the GELF message should be chunked into several messages or send it in a single message.

2 - To send logs:

```javascript
    request.log('emergency', {some_field: 'some data', short_message: 'foobar'})
```

### Important Note:

If you send an array of tags as the first argument of the request.log() method, only the first tag will be sent to the graylog server.

Also, the second argument accepts an object, you can send anything you want, the plugin will never thrown an error and will force the correct format if you put any invalid fields, such as `id` which graylog drops automatically. If any problems occur, the plugin will fail silently and only output a message to the console, this is by design.

#### Plugin register options:

* host - String
* port - Integer
* config - Object
    * MAX_BUFFER_SIZE - Integer

#### Standards for log levels:

http://www.kiwisyslog.com/help/syslog/index.html?protocol_levels.htm

0 - Emergency: system is unusable

1 - Alert: action must be taken immediately

2 - Critical: critical conditions

3 - Error: error conditions

4 - Warning: warning conditions

5 - Notice: normal but significant condition <-- this is the default that will be sent to graylog

6 - Informational: informational messages

7 - Debug: debug-level messages

#### How to contribute?

For now I'm not expecting to have any help on this, but what I have done in the latest development cyle in order to have a decent feedback loop, is to have a local vagrant instance with graylog on it and sending GELF logs to it, it's the only way to be certain that graylog is receiving and getting all the logs in the correct format.

If you want to contribute just make a pull request here an I'll take a look.

The test scripts are:

`test` - Tests both the GELF factory and UDP interface

`test-gelf` - Tests only the GELF factory

`test-udp` - Tests only the UDP interface, by sending a GELF message to the local graylog instance with default configurations

`test-integration` - Runs a local hapi.js server instance, if you fire a GET request at the '/log' endpoint, it will fire a GELF message to the graylog local server

All tests generate a coverage report.

#### Roadmap:

1 - Probably will change the testing framework from tape.js to Ava.js, not sure yet.

2 - Allow for triggering a log event by calling server.log()

3 - Enhancing the docs, if you have suggestions on how to improve the docs please open a issue. And if possible a pull request :)


