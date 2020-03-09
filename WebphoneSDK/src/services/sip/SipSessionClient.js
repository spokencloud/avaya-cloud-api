/**
 * All possible session events in JsSIP 3.1.2
 * @readonly
 * @enum {string}
 */
const SessionEvent = {
  PEER_CONNECTION: 'peerconnection',
  CONNECTING: 'connecting',
  SENDING: 'sending',
  PROGRESS: 'progress',
  ACCEPTED: 'accepted',
  CONFIRMED: 'confirmed',
  ENDED: 'ended',
  FAILED: 'failed',
  NEW_DTMF: 'newDTMF',
  NEW_INFO: 'newInfo',
  HOLD: 'hold',
  UNHOLD: 'unhold',
  MUTED: 'muted',
  UNMUTED: 'unmuted',
  REINVITE: 'reinvite',
  UPDATE: 'update',
  REFER: 'refer',
  REPLACES: 'replaces',
  SDP: 'sdp',
  GET_USER_MEDIA_FAILED: 'getusermediafailed',
  PEER_CONNECTION_CREATE_OFFER_FAILED: 'peerconnection:createofferfailed',
  PEER_CONNECTION_CREATE_ANSWER_FAILED: 'peerconnection:createanswerfailed',
  PEER_CONNECTION_SET_LOCAL_DESCRIPTION_FAILED: 'peerconnection:setlocaldescriptionfailed',
  PEER_CONNECTION_SET_REMOTE_DESCRIPTION_FAILED: 'peerconnection:setremotedescriptionfailed'
}

export default class SipSessionClient {
  constructor (RTCSession, eventHandlers, debug = true) {
    this._RTCSession = RTCSession
    if (debug) {
      this._registerDefaultEventHandlers()
    }
    this._registerCustomEventHandlers(eventHandlers)
  }

  _registerDefaultEventHandlers () {
    Object.values(SessionEvent).forEach(event => this._addEventHandler(event))
  }

  _registerCustomEventHandlers (eventHandlers = {}) {
    Object.keys(eventHandlers).forEach(event => {
      if (eventHandlers[event]) {
        this._addEventHandler(event, eventHandlers[event])
      }
    })
  }

  _addEventHandler (event, handler = () => {}) {
    this._RTCSession.on(event, data => {
      console.group(`SessionEvent: [${event}]`)
      console.log(data)
      console.log('handler', handler)
      console.groupEnd()
      handler(data)
    })
  }

  onEventProgress (handler) {
    this._addEventHandler(SessionEvent.PROGRESS, handler)
  }

  onEventEnded (handler) {
    this._addEventHandler(SessionEvent.ENDED, handler)
  }

  onEventNewDtmf (handler) {
    this._addEventHandler(SessionEvent.NEW_DTMF, handler)
  }

  onEventMuted (handler) {
    this._addEventHandler(SessionEvent.MUTED, handler)
  }

  onEventUnmuted (handler) {
    this._addEventHandler(SessionEvent.UNMUTED, handler)
  }

  answer (options) {
    this._RTCSession.answer(options)
  }

  terminate (options) {
    console.log('sipsessionclient terminated');
    this._RTCSession.terminate(options)
  }

  sendDtmf (tone, options) {
    this._RTCSession.sendDTMF(tone, options)
  }

  muteAudio () {
    this._RTCSession.mute({ audio: true })
  }

  unmuteAudio () {
    this._RTCSession.unmute({ audio: true })
  }
}
