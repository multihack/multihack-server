# Porting Guide

This is a brief guide on how to get started porting this application to other editors.  

You shouldn't need to deal with it, but it might be handy to see the underlying protocol [multihack-wire](https://github.com/RationalCoding/multihack-wire)

## Client/Server API

Start with [src/remote.js](https://github.com/RationalCoding/multihack-web/blob/master/src/network/remote.js). It handles all communication with the server and will be the same for all implementations.

You may need to change how dependencies are loaded if your host editor doesn't support Node-style requires.

Connecting to the server requires these arguments to be passed to the constructor.

```javascript
new RemoteManager(hostname, room, nickname)
// hostname for the multihack-server. Should get this from preferences
// room to join. Should get this when Multihack is started
// nickname, (optional nickname for user. defaults to "Guest")
```

You will need to listen to the following events:

```javascript
remote.on('changeFile', function (e) {
  e.filePath // The relative path of the file (MUST start with a '/')
  e.change // A CodeMirror change object - https://codemirror.net/doc/manual.html#event_change
  
  // Apply this change to the local document usually via replaceRange on a CodeMirror document
  // You will need to toggle a mutex on the 'change' event on your CodeMirror editor to prevent these remote changes from firing it
  // https://codemirror.net/doc/manual.html#replaceRange
  
  // If the file does not exist, you should create it, along with any directories that are missing on it's path
  // For example, if we have an empty project and receive a change event with filepath '/dira/dirb/myfile.txt'
  // 'dira', 'dira/dirb', and 'myfile.txt' will be created
  
  // If files are created asynchronously, you will need to queue subsequent changes and apply them when the file is created
})
```

```javascript
remote.on('deleteFile', function (e) {
  e.filePath // The relative path of the file
  
  // Delete this file locally
})
```

```javascript
remote.on('requestProject', function (e) {
  e.requester // ID of the requesting peer (need to pass this to .provideFile)

  // A peer is requesting the project
  // Get an array of all files and sort them by ascending path length (helps with tree rendering)
  // Filter out any directories. The requester will be responsible for creating them.
  // Call remote.provideFile on each file (see below)
})
```

```javascript
remote.on('provideFile', function (e) {
  // A peer has provided a file
  e.filePath // Relative path of file
  e.content // Content of file as a string
  
  // A new file should be created with the given path and content
})
```

`remote.js` also provides the following methods.

```javascript
remote.changeFile(filePath, change) // Call this when user makes a local change to a CodeMirror editor or equivalent
// change is a CodeMirror change object
```

```javascript
remote.deleteFile(filePath) // Call this whenever a file is deleted locally
```

```javascript
remote.requestProject() // Call when the user "fetches code"
// The peer sending will be the peer who joined earliest (unless that's you, in which case the second-earliest peer sends)
```

```javascript
remote.provideFile(filePath, content, requester) // streams a file
// filePath is the relative file path
// content is the string content of the file
// requester is the ID received from the 'requestProject' event (see above)
```

```javascript
remote.destroy() // Clean up all connections and memory. Call on "Stop Multihack"
```

## Voice API

The voice API is super simple, only thing to be done is rigging it to some kind of button.  

You should be able to reuse [voice.js](https://github.com/RationalCoding/multihack-web/blob/master/src/network/voice.js).  

`remote.js` calls the constructor for you.

```javascript
remote.voice.join() // Join the voice call
```

```javascript
remote.voice.leave() // Leave the voice call
```

```javascript
remote.voice.toggle() // Join/leave the voice call
```

## UI

The UI should be somewhat similar to the other implementations.  

- "Start Multihack" button
- "Enter a room ID" modal with input
- "Enter a nickname" modal with input
- "Join/Leave Voice Call" button
- "Fetch Code" button
- "Stop Multihack" button

## Notes:

Files are identified by their relative path from the project root and should ALWAYS start with a forward slash '/'.  

Paths should NEVER end with a forward slash '/'.  

The API assumes some kind of CodeMirror-like editor, but there's nothing stopping completely different editors from working as long as they can do programmatic line/column insertions and listen to changes.

Use standard style if at all possible.  
