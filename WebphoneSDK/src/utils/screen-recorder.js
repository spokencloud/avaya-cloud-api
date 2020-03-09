/* global chrome */
// import InlineInstall from 'inline-install'
import popupExtensionInstallation from './extension-install'

function cmpVersions (a, b) {
  var i, diff
  var regExStrip0 = /(\.0+)+$/
  var segmentsA = a.replace(regExStrip0, '').split('.')
  var segmentsB = b.replace(regExStrip0, '').split('.')
  var l = Math.min(segmentsA.length, segmentsB.length)

  for (i = 0; i < l; i++) {
    diff = parseInt(segmentsA[i], 10) - parseInt(segmentsB[i], 10)
    if (diff) {
      return diff
    }
  }
  return segmentsA.length - segmentsB.length
}

class ScreenCaptureExtension {
  constructor () {
    this.port = null
    this.connectTime = 0
    this.state = ScreenCaptureExtension.STATE.INIT
    this.callbacks = {
      'checkInstalled': this.checkVersion.bind(this)
    }
    this.connectTimer = -1
    this.disconnectCallback = null
  }
  clearTimer () {
    if (this.connectTimer !== -1) {
      clearTimeout(this.connectTimer)
      this.connectTimer = -1
    }
  }
  connect (disconnectCallback) {
    try {
      if (this.port == null) {
        this.disconnectCallback = disconnectCallback
        this.state = ScreenCaptureExtension.STATE.CONNECTING
        this.port = chrome.runtime.connect(ScreenCaptureExtension.extensionId)
        this.port.onDisconnect.addListener(this.onDisconnect.bind(this))
        this.port.onMessage.addListener(this.onMessage.bind(this))
        if (this.connectTimer !== -1) { this.clearTimer() }
        this.connectTimer = setTimeout(this.onConnected.bind(this), ScreenCaptureExtension.connectionTimeout)
        console.log('Connection to extension is established', this.port)
      }
    } catch (err) { console.log(err) }
  }
  onDisconnect () {
    console.log('extensionPort is closed', this.port)
    this.clearTimer()
    this.state = ScreenCaptureExtension.STATE.DISCONNECTED
    this.port = null
    if (this.disconnectCallback) { this.disconnectCallback() }
  }
  onConnected () {
    this.clearTimer()
    this.disconnectCallback = null
    this.state = ScreenCaptureExtension.STATE.CONNECTED
  }
  onMessage (message) {
    console.log('Response from the extension', message)
    if (!this.isConnected()) { this.onConnected() }
    if (this.callbacks[message.messageType]) { this.callbacks[message.messageType](message) }
  }
  isConnected () {
    return this.state === ScreenCaptureExtension.STATE.CONNECTED
  }
  send (message, callback) {
    if (!this.isConnected()) {
      this.connect()
    }
    try {
      this.port.postMessage(message)
    } catch (err) { console.log(err) }
  }
  checkInstalled () {
    if (!this.isConnected()) {
      this.connect(function () {
        popupExtensionInstallation(ScreenCaptureExtension.extensionId)
      })
      this.send({messageType: 'checkInstalled'})
    }
  }
  checkVersion (message) {
    let installedVersion = message.response
    if (installedVersion) {
      if (cmpVersions(installedVersion, ScreenCaptureExtension.minimumVersion) < 0) {
        popupExtensionInstallation(ScreenCaptureExtension.extensionId, ScreenCaptureExtension.minimumVersion)
      }
    }
  }
};
ScreenCaptureExtension.extensionId = 'bmkepfidkmelkckcbbphhemaepdlilld'
ScreenCaptureExtension.minimumVersion = '1.2.15'
ScreenCaptureExtension.connectionTimeout = 100
ScreenCaptureExtension.STATE = {
  INIT: 0,
  CONNECTING: 1,
  CONNECTED: 2,
  DISCONNECTED: 3
}

var extConn = new ScreenCaptureExtension()
extConn.checkInstalled()

function sendMessage (message, responseCallback) {
  if (typeof (chrome) !== 'undefined') {
    console.log('Send message => ', message)
    if (message.messageType !== 'checkInstalled' &&
       (!callContext.config || callContext.config.disabled || !callContext.uploadEndpoint)) {
      console.log('CallContext for screen capture is invalid. message is not sent', message)
      return
    }
    extConn.send(message)
  } else {
    console.log('Screencapture not supported for non-Chrome browsers!')
  }
}

var callContext = {
  agentId: '',
  authToken: '',
  connectionUid: '',
  stationId: '',
  sessionUid: '',
  name: '',
  hostName: '',
  uploadEndpoint: ''
}

function newMessage (msgType, extraParams) {
  let message =
    {
      messageType: msgType,
      context: callContext
    }
  if (extraParams) { message = Object.assign({}, message, extraParams) }
  return message
}

const screenRecorder = {
  setContext: function (bootStrapData) {
    callContext.uploadEndpoint = bootStrapData.uploadServiceUrl
    callContext.authToken = bootStrapData.authToken
    callContext.agentId = bootStrapData.agentId
    callContext.stationId = bootStrapData.stationId
    callContext.config = bootStrapData.config
  },

  updateAuthToken: function (authToken) {
    callContext.authToken = authToken
  },

  startCapturing: function () {
    sendMessage(newMessage('startCapturing'))
  },

  stopCapturing: function () {
    sendMessage(newMessage('stopCapturing'))
  },

  pauseCapturing: function () {
    sendMessage(newMessage('pauseCapturing'))
  },

  resumeCapturing: function () {
    sendMessage(newMessage('resumeCapturing'))
  },

  startRecording: function (config, connectionUid, sessionUid, authToken) {
    callContext.connectionUid = connectionUid
    callContext.sessionUid = sessionUid
    callContext.authToken = authToken
    sendMessage(newMessage('startRecording', {config: config}))
  },

  stopRecording: function () {
    sendMessage(newMessage('stopRecording'))
  },

  isRecording: function () {
    sendMessage(newMessage('isRecording'))
  }
}

export default screenRecorder
