# Webphone SDK

### Known issues
- The SDK cannot take consecutive calls. The agent needs to logout and login again in order to take the next call.

### Build
Change to the directory containing `src/` and run:
```
npm install
npm run build
```
The built files (`bundle.js` and `bundle.js.map`) will be in `dist/`.

### Using the built files
Import the `bundle.js` file in your html or JS file.

### Interacting with the SDK
You can interact with the SDK from your JS using the following:
##### Login using username/password:
```
actions.commandToWebPhone('initialize', {url: URL, username: USERNAME, password: PASSWORD});
```

##### Login using auth token:
```
actions.commandToWebPhone('initialize', {url: URL, authToken: TOKEN});
```

##### Change state to ready:
```
actions.commandToWebPhone('changeStateToReady')
```

##### Change state to after-call-work:
```
actions.commandToWebPhone('changeStateToAfterCallWork')
```

##### Change state to not-ready:
```
actions.commandToWebPhone('changeStateToNotReady', AUX_CODE)
```

##### To get available aux codes, use:
```
actions.state.auxCodes.available
```

##### Change state to offline:
```
actions.commandToWebPhone('changeStateToOffline')
```

##### End call:
```
actions.commandToWebPhone('endCall')
```

##### Mute call:
```
actions.commandToWebPhone('muteCall')
```

##### Hold call:
```
actions.commandToWebPhone('holdCall')
```

##### Make outbound call:
```
actions.commandToWebPhone('outboundCall')
```

##### Make consult call:
```
actions.commandToWebPhone('consultCall')
```

##### Merge consult call:
```
actions.commandToWebPhone('mergeCall')
```

##### End consult call:
```
actions.commandToWebPhone('endConsultationCall')
```

##### Hold consult call:
```
actions.commandToWebPhone('holdConsultationCall')
```

##### Warm transfer:
```
actions.commandToWebPhone('warmTransfer')
```

##### Cold transfer:
```
actions.commandToWebPhone('transferCall')
```

##### Toggle masking:
```
actions.commandToWebPhone('maskCallRecording')
```
