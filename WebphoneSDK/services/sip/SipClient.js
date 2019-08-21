/**
 * All possible connection events in JsSIP 3.1.2
 * @readonly
 * @enum {string}
 */
const SipEvent = {
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  REGISTERED: 'registered',
  UNREGISTERED: 'unregistered',
  REGISTRATION_FAILED: 'registrationFailed',
  REGISTRATION_EXPIRING: 'registrationExpiring',
  NEW_RTC_SESSION: 'newRTCSession',
  NEW_MESSAGE: 'newMessage'
}

class SipClient {
  constructor (config, debug = true) {
    this._JsSIP = JsSIP
    this._userAgent = null
    this._ringTone = null
    this.configure(config)
    if (debug) {
      this._registerDefaultEventHandlers()
    }
  }

  _getSocket (url) {
    return new this._JsSIP.WebSocketInterface(url)
  }

  _registerDefaultEventHandlers () {
    Object.values(SipEvent).forEach(event => {
      this._addEventHandler(event)
    })
  }

  _addEventHandler (event, handler = () => {}) {
    this._userAgent.on(event, data => {
      console.group(`SipEvent: [${event}]`)
      console.log(data)
      console.groupEnd()
      handler(data)
    })
  }

  configure (config) {
    const {
      url = null,
      port = null,
      extension = null,
      username = null,
      password = null,
      secure = null,
      autoRenewRegistration = true
    } = config || {}
    const socket = this._getSocket(`${secure ? 'wss' : 'ws'}://${url}:${port}`)
    // Force non-secure transport
    socket.via_transport = 'ws'
    this._userAgent = new this._JsSIP.UA({
      sockets: socket,
      uri: `sip:${extension}@${url}?Spokenuid=${encodeURIComponent(username)}&Appid=mpact`,
      password
    })
    if (autoRenewRegistration) {
      this._addEventHandler(SipEvent.REGISTRATION_EXPIRING, () => this._userAgent.register())
    }
  }

  start () {
    this._userAgent.start()
  }

  stop () {
    this._userAgent.stop()
  }

  onEventDisconnected (handler) {
    this._addEventHandler(SipEvent.DISCONNECTED, handler)
  }

  onEventRegistered (handler) {
    this._addEventHandler(SipEvent.REGISTERED, handler)
  }

  onEventRegistrationFailed (handler) {
    this._addEventHandler(SipEvent.REGISTRATION_FAILED, handler)
  }

  async playRingTone () {
    try {
      this._ringTone = await AudioManager.getInboundRingTone({ loop: true })
      AudioManager.playAudio(this._ringTone)
    } catch (error) {
      console.error('Could not play ring tone', error)
    }
  }

  stopRingTone () {
    if (this._ringTone) {
      AudioManager.stopAudio(this._ringTone)
      this._ringTone = null
    }
  }

  onEventNewRtcSession (handler = () => {}) {
    console.log('onEventNewRtcSession')
    this._addEventHandler(SipEvent.NEW_RTC_SESSION, data => {
      this.playRingTone()
      data.session.on('confirmed', () => {
        const mediaStream = data.session.connection.getRemoteStreams()[0]
        const audio = AudioManager.getAudioStream(mediaStream)
        AudioManager.playAudio(audio)
        this.stopRingTone()
      })
      const sipSessionClient = new SipSessionClient(data.session)
      handler(sipSessionClient)
    })
  }
}