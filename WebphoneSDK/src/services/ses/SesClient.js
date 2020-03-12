// import * as Stomp from '../../../stomp.js'

import Serializer from './Serializer'
import screenRecorder from '../../utils/screen-recorder.js'

const Errors = {
  1000: 'Failed to associate event handler with your device!',
  1010: 'Unable to find station device!',
  1020: 'Station registration failed!',

  2000: 'Unable to get agent state!',
  2010: 'Unable to set agent state!',
  2020: 'Unable to set agent state!',

  3000: 'Failed to release call!',
  3010: 'Failed to release connection!',
  3020: 'Failed to merge calls!',
  3030: 'Failed to make consultation call!',
  3040: 'No active calls found!',
  3050: 'Unable to find station third party device!',
  3060: 'Failed to hold call!',
  3070: 'Failed to make call!',
  3080: 'Failed to unhold call!',
  3090: 'Failed to transfer call!',
  3100: 'Masking failed! Please wait several seconds and try again!',
  3110: 'Unmasking failed!',
  3120: 'No active call found!',
  3130: 'Invalid number!',
  3140: 'Invalid transfer number!',
  3150: 'Invalid consultation number!',
  3160: 'Lease not found!',
  3170: 'Calling self agent/station id is not allowed!',
  3180: 'Service is not currently available!',

  [-1]: 'An unknown error occurred!'
};

const Event = {
  BOOTSTRAP: 'BOOTSTRAP',
  SCREEN_POPS_CONFIG: 'SCREEN_POPS_CONFIG',
  VOICE_CHANNEL: 'VOICE_CHANNEL',
  HOLD: 'HOLD',
  UNHOLD: 'UNHOLD',
  MASK: 'MASK',
  UNMASK: 'UNMASK',
  CALL_DELIVERED: 'CALL_DELIVERED',
  CALL_ORIGINATED: 'CALL_ORIGINATED',
  CONFIRMED_ORIGINATED: 'CONFIRMED_ORIGINATED',
  HANG_UP: 'HANG_UP',
  TRANSFER: 'TRANSFER',
  CONSULTATION: 'CONSULTATION',
  CONFIRMED_CONSULTATION: 'CONFIRMED_CONSULTATION',
  MERGE: 'MERGE',
  CONFIRMED_WARM_TRANSFER: 'CONFIRMED_WARM_TRANSFER',
  // Transfer event for caller who initials the transfer call
  WARM_TRANSFER: 'WARM_TRANSFER',
  // Transfer event for calee who receives the transfer call and answer it
  WARM_TRANSFER_IN: 'WARM_TRANSFER_IN',
  CONFIRMED_SWAP: 'CONFIRMED_SWAP',
  HEARTBEAT: 'HEARTBEAT',
  DISCONNECT: 'DISCONNECT'
}

export default class SesClient {
  /**
   * If useAuthToken is set to true, the authToken will be used to
   * authenticate whether or not username and password are provided
   * @param {Object} config The SesClient configuration
   * @param {string} config.url The Web Socket Connection URL
   * @param {boolean} [config.useAuthToken] Set to true to use token-based authentication
   * @param {string} [config.authToken] The authentication token
   * @param {string} [config.username] Authentication username
   * @param {string} [config.password] Authentication password
   */
  constructor (url, useAuthToken, authToken, username, password ) {
    this._url = url
    this._useAuthToken = useAuthToken
    this._authToken = authToken
    this._username = username
    this._password = password
    this._pendingHealthChecks = 0
    this._healthCheckThreshold = 3
    this._consultationCallTrigger = null
	if (url) {
      var ws = new WebSocket(this._url);
      this._stompClient = Stomp.over(ws);
      console.log('_stompClient ', this._stompClient)
	}

    this._eventHandlers = {}

    this._healthCheck = {
      MAX_NUMBER_LATENCIES: 3,
      subscribed: false,
      pending: false,
      startTime: null,
      latenciesMs: []
    }

    if (url) {
      this.configure()
    }

    this.addEventHandlers()
  }

  get averageLatencyMs () {
    const { latenciesMs } = this._healthCheck
    const count = latenciesMs.length
    const sum = latenciesMs.reduce((sum, value) => sum + value, 0)
    const average = sum / (count || 1)
    return Math.round(average)
  }

  _addLatency (latencyMs) {
    if (this._healthCheck.latenciesMs.length >= this._healthCheck.MAX_NUMBER_LATENCIES) {
      this._healthCheck.latenciesMs.shift()
    }
    this._healthCheck.latenciesMs.push(latencyMs)
  }

  subscribeToHeartbeat ({ onComputedAverageLatencyMs = () => {} }) {
    if (this._healthCheck.subscribed) {
      console.warn('Already subscribed to heartbeat')
      return
    }
    this._healthCheck.subscribed = true

    this._stompClient.subscribe('/user/queue/utilities', frame => {
      const parsedFrame = SesClient._parseFrameBody(frame.body)
      const message = Serializer.normalizeMessage(parsedFrame)
      if (message.event === Event.HEARTBEAT) {
        const endTime = Date.now()
        const latencyMs = endTime - this._healthCheck.startTime
        this._addLatency(latencyMs)
        onComputedAverageLatencyMs(this.averageLatencyMs)
        Object.assign(this._healthCheck, {
          pending: false,
          startTime: null
        })
        if (message.data && message.data.authToken) {
          // console.log("heartbeat body autoToken: "+message.data.authToken)
          screenRecorder.updateAuthToken(message.data.authToken)
        }
      }
    })
  }

  sendHeartbeat () {
    if (this._healthCheck.pending) {
      if (this._pendingHealthChecks++ >= this._healthCheckThreshold) {
        this._eventHandlers[Event.DISCONNECT].onSuccess()
      } else {
        console.warn('Health check(s) are already pending [pending: %s, maximum allowable: %s]', this._pendingHealthChecks, this._healthCheckThreshold)
      }
      return
    }
    this._pendingHealthChecks = 0

    Object.assign(this._healthCheck, {
      pending: true,
      startTime: Date.now()
    })

    this._stompClient.send('/message/utilities/heartbeat')
  }

  configure (config) {
    const {
      /**
       * If a heart-beat header is included in the CONNECTED
       * message from the server, then those values will take
       * precedence over the heartbeat values set here
       */
      incomingHeartbeat = 10000,
      outgoingHeartbeat = 10000,
      reconnectDelay = 5000,
      debug = () => {}
    } = config || {}

    Object.assign(this._stompClient, {
      heartbeat: {
        incoming: incomingHeartbeat,
        outgoing: outgoingHeartbeat
      },
      reconnect_delay: reconnectDelay,
      debug
    })
  }

  get _authHeaders () {
    return this._useAuthToken
      ? { 'X-Auth-Token': this._authToken }
      : { login: this._username, passcode: this._password }
  }

  get isConnected () {
    return (this._stompClient !== null && this._stompClient.connected)
  }

  connect () {
    return new Promise((resolve, reject) => {
      this._stompClient.connect(this._authHeaders, resolve, () => { this._eventHandlers[Event.DISCONNECT].onSuccess() })
    })
  }

  connectAndSubscribeToAll () {
    return new Promise((resolve, reject) => {
      this.connect()
        .then(result => {
          this._subscribeToAll()
          resolve(result)
        })
        .catch(error => {
          reject(error)
        })
    })
  }

  disconnect () {
    return new Promise(resolve => {
      this._stompClient.disconnect(resolve)
      this._stompClient.connected = false
      this._stompClient = null
    })
  }

  addEventHandlers (handlers) {
    const noop = () => {}
    const {
      onVoiceChannelAgentStateSuccess = noop,
      onVoiceChannelAgentStateError = noop,
      onHoldSuccess = noop,
      onHoldError = noop,
      onUnholdSuccess = noop,
      onUnholdError = noop,
      onMaskRecordingSuccess = noop,
      onMaskRecordingError = noop,
      onUnmaskRecordingSuccess = noop,
      onUnmaskRecordingError = noop,
      onCallDeliveredSuccess = noop,
      onCallDeliveredError = noop,
      onCallOriginatedSuccess = noop,
      onCallOriginatedError = noop,
      onConfirmedOriginatedSuccess = noop,
      onConfirmedOriginatedError = noop,
      onHangUpSuccess = noop,
      onHangUpError = noop,
      onTransferSuccess = noop,
      onTransferError = noop,
      onConfirmedWarmTransferSuccess = noop,
      onConfirmedWarmTransferError = noop,
      onWarmTransferSuccess = noop,
      onWarmTransferError = noop,
      onWarmTransferInSuccess = noop,
      onConfirmedSwapSuccess = noop,
      onConfirmedSwapError = noop,
      onConsultationSuccess = noop,
      onConsultationError = noop,
      onConfirmedConsultationSuccess = noop,
      onConfirmedConsultationError = noop,
      onMergeSuccess = noop,
      onMergeError = noop,
      onDisconnect = noop
    } = handlers || {}

    Object.assign(this._eventHandlers, {
      [Event.VOICE_CHANNEL]: {
        onSuccess: onVoiceChannelAgentStateSuccess,
        onError: onVoiceChannelAgentStateError,
        normalize: Serializer.normalizeAgentState
      },
      [Event.HOLD]: {
        onSuccess: onHoldSuccess,
        onError: onHoldError,
        normalize: noop
      },
      [Event.UNHOLD]: {
        onSuccess: onUnholdSuccess,
        onError: onUnholdError,
        normalize: noop
      },
      [Event.MASK]: {
        onSuccess: onMaskRecordingSuccess,
        onError: onMaskRecordingError,
        normalize: noop
      },
      [Event.UNMASK]: {
        onSuccess: onUnmaskRecordingSuccess,
        onError: onUnmaskRecordingError,
        normalize: noop
      },
      [Event.CONFIRMED_WARM_TRANSFER]: {
        onSuccess: onConfirmedWarmTransferSuccess,
        onError: onConfirmedWarmTransferError,
        normalize: noop
      },
      [Event.WARM_TRANSFER]: {
        onSuccess: onWarmTransferSuccess,
        onError: onWarmTransferError,
        normalize: noop
      },
      [Event.WARM_TRANSFER_IN]: {
        onSuccess: onWarmTransferInSuccess,
        onError: noop,
        normalize: Serializer.normalizeCallDetails
      },
      [Event.CONFIRMED_SWAP]: {
        onSuccess: onConfirmedSwapSuccess,
        onError: onConfirmedSwapError,
        normalize: Serializer.normalizeCallDetails
      },
      [Event.CALL_DELIVERED]: {
        onSuccess: onCallDeliveredSuccess,
        onError: onCallDeliveredError,
        normalize: Serializer.normalizeCallDetails
      },
      [Event.CALL_ORIGINATED]: {
        onSuccess: onCallOriginatedSuccess,
        onError: onCallOriginatedError,
        normalize: Serializer.normalizeCallDetails
      },
      [Event.CONFIRMED_ORIGINATED]: {
        onSuccess: onConfirmedOriginatedSuccess,
        onError: onConfirmedOriginatedError,
        normalize: Serializer.normalizeCallDetails
      },
      [Event.HANG_UP]: {
        onSuccess: onHangUpSuccess,
        onError: onHangUpError,
        normalize: Serializer.normalizeHangUpResponse
      },
      [Event.TRANSFER]: {
        onSuccess: onTransferSuccess,
        onError: onTransferError,
        normalize: noop
      },
      [Event.CONSULTATION]: {
        onSuccess: onConsultationSuccess,
        onError: onConsultationError,
        normalize: Serializer.normalizeCallDetails
      },
      [Event.CONFIRMED_CONSULTATION]: {
        onSuccess: onConfirmedConsultationSuccess,
        onError: onConfirmedConsultationError,
        normalize: Serializer.normalizeCallDetails
      },
      [Event.MERGE]: {
        onSuccess: onMergeSuccess,
        onError: onMergeError,
        normalize: noop
      },
      // Disconnect is not message-based event
      [Event.DISCONNECT]: {
        onSuccess: onDisconnect,
        onError: onDisconnect,
        normalize: noop
      }
    })
  }

  fetchBootstrapData (telecommuteNumber) {
    const message = {
      telecommuteNumber: telecommuteNumber
    }

    return new Promise((resolve, reject) => {
      const subscription = this._stompClient.subscribe('/user/queue/utilities', frame => {
        const parsedFrame = SesClient._parseFrameBody(frame.body)
        const message = Serializer.normalizeMessage(parsedFrame)
        const { event, error, data } = message
        if (event === null && error) {
          reject(error)
        } else if (event === Event.BOOTSTRAP) {
          if (error) {
            reject(error)
          } else {
            resolve(Serializer.normalizeBootstrapData(data))
          }
          subscription.unsubscribe()
        }
      })
      this._sendMessage({ endpoint: '/message/utilities/bootstrap', message })
    })
  }

  async fetchScreenPopsConfigForSessionId (sessionUid) {
    return new Promise((resolve, reject) => {
      const subscription = this._stompClient.subscribe('/user/queue/utilities/screenPopConfig', frame => {
        const parsedFrame = SesClient._parseFrameBody(frame.body)
        const message = Serializer.normalizeMessage(parsedFrame)
        console.log('ScreenPopsConfig message:', message)
        const {
          event,
          error,
          data
        } = message
        if (event === null && error) {
          reject(error)
        } else if (event === Event.SCREEN_POPS_CONFIG) {
          if (error) {
            reject(error)
          } else {
            resolve(Serializer.normalizeScreenPopsConfig(data))
          }
          subscription.unsubscribe()
        }
      })
      this._stompClient.send(`/message/utilities/screenPopConfig/${encodeURIComponent(sessionUid)}`)
    })
  }

  _processIncomingMessage (message) {
    const { event, error, data } = message
    if (this._eventHandlers.hasOwnProperty(event)) {
      const eventHandler = this._eventHandlers[event]
      if (error) {
        const webphoneError = { errorCode: error.code, errorMessage: '' }
        webphoneError.errorMessage = Errors.hasOwnProperty(error.code) ? Errors[error.code] : Errors[-1]
        eventHandler.onError(webphoneError)
      } else {
        const normalizedData = eventHandler.normalize(data)
        eventHandler.onSuccess(normalizedData)
      }
    }
  }

  static _parseFrameBody (frameBody) {
    return JSON.parse(frameBody)
  }

  _subscribe (endpoint) {
    const genericHandler = (frame) => {
      const parsedFrame = SesClient._parseFrameBody(frame.body)
      const message = Serializer.normalizeMessage(parsedFrame)
      this._processIncomingMessage(message)
    }
    this._stompClient.subscribe(endpoint, genericHandler)
  }

  _subscribeToAll () {
    const endpointRoot = '/user/queue'
    const subscriptions = {
      callControl: `${endpointRoot}/callControl`,
      agentState: `${endpointRoot}/agentState`
    }
    Object.values(subscriptions).forEach(endpoint => {
      this._subscribe(endpoint)
    })
  }

  _sendMessage ({ endpoint, message, headers = {} }) {
    if (this._stompClient) {
      this._stompClient.send(endpoint, headers, JSON.stringify(message))
    }
  }

  setVoiceChannelAgentState (state, auxCode) {
    const message = {
      state,
      channel: 'VOICE',
      auxCode
    }
    this._sendMessage({ endpoint: '/message/agentState/voiceChannel', message })
  }

  transfer (phoneNumber) {
    var pattern = /\//g
    phoneNumber = phoneNumber.replace(pattern, '')
    this._sendMessage({ endpoint: `/message/callControl/transfer/${phoneNumber}` })
  }

  warmTransfer () {
    this._sendMessage({ endpoint: '/message/callControl/warmTransfer' })
  }

  outboundCall (phoneNumber) {
    var pattern = /\//g
    phoneNumber = phoneNumber.replace(pattern, '')
    this._sendMessage({ endpoint: `/message/callControl/outboundCall/${phoneNumber}` })
  }

  consultationCall (phoneNumber) {
    this._consultationCallTrigger = phoneNumber
    this._sendMessage({ endpoint: `/message/callControl/hold` })
  }

  consultationCallConnect (phoneNumber) {
    var pattern = /\//g
    phoneNumber = phoneNumber.replace(pattern, '')
    this._sendMessage({ endpoint: `/message/callControl/consultationCall/${phoneNumber}` })
    this._consultationCallTrigger = null
  }

  mergeCalls () {
    this._sendMessage({ endpoint: '/message/callControl/mergeCalls' })
  }

  hangUp () {
    this._sendMessage({ endpoint: '/message/callControl/hangUp' })
  }

  hangUpByCallId (callId) {
    this._sendMessage({ endpoint: `/message/callControl/hangUp/${callId}` })
  }

  hold () {
    this._sendMessage({ endpoint: '/message/callControl/hold' })
  }

  holdByCallId (callId) {
    this._sendMessage({ endpoint: `/message/callControl/hold/${callId}` })
  }

  unhold () {
    this._sendMessage({ endpoint: '/message/callControl/unhold' })
  }

  unholdByCallId (callId) {
    this._sendMessage({ endpoint: `/message/callControl/unhold/${callId}` })
  }

  sendDtmf (tone) {
    this._playDtmfTone()
    this._sendMessage({ endpoint: `/message/callControl/dtmf/${tone}` })
  }

  async _playDtmfTone () {
    try {
      const dtmfTone = await AudioManager.getDtmfTone()
      await AudioManager.playAudio(dtmfTone)
    } catch (error) {
    }
  }

  maskRecording (connUid) {
    this._sendMessage({ endpoint: `/message/callControl/mask/${connUid}` })
  }

  unmaskRecording (connUid) {
    this._sendMessage({ endpoint: `/message/callControl/unmask/${connUid}` })
  }
}
