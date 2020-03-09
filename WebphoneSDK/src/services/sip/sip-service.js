import SipClient from './SipClient'
import { addEventHandler } from '../common'

let _sipClient = null
let _sipSessionClient = null
const _eventHandlers = []
const SESSION_EXPIRATION_TIME = 120

function isInitialized () {
  return _sipSessionClient !== null
}

function execute (fn) {
  if (!isInitialized()) {
    console.log('The service has not been initialized')
  }
  if (typeof fn === 'function') {
    fn()
  }
}

function addSessionEventHandlers () {
  console.log('%cRegistering session event handlers', 'font-weight: bold;')
  _eventHandlers.forEach(handler => handler())
}
export default {
  sipInitialize (config) {
  const {
    url,
    port,
    extension,
    username,
    password,
    secure
  } = config || {}
  // var password1 = 'Spoken@1';
  _sipClient = new SipClient({ url, port, extension, username, password, secure })
  console.log('_sipClient: ', _sipClient)

  addEventHandler(_sipClient.onEventNewRtcSession, _sipClient, sipSessionClient => {
    console.log('%cAssigning SipSessionClient instance', 'font-weight: bold;')
    _sipSessionClient = sipSessionClient
    addSessionEventHandlers()
    console.log('_sipSessionClient:3 ', _sipSessionClient)
    console.log('_eventhandler:3 ', _eventHandlers)
  })
  _sipClient.start()

  return new Promise((resolve, reject) => {
    addEventHandler(_sipClient.onEventRegistered, _sipClient, () => {
      console.log('_sipClient1: ', _sipClient)
      console.log('Registered!')
      console.log('Returning resolved promise!')
      resolve()
    })
    addEventHandler(_sipClient.onEventRegistrationFailed, _sipClient, error => {
      console.log('Registration failed!')
      console.log('Returning rejected promise!')
      reject(error)
    })
    addEventHandler(_sipClient.onEventDisconnected, _sipClient, error => {
      console.log('Disconnected!')
      console.log('Returning rejected promise!')
      _sipClient.stop()
      reject(error)
    })
  })
},
sipAddEventHandlers (handlers) {
  const {
    onIncomingCall,
    onMute,
    onUnmute,
    onDtmf
  } = handlers || {}
  console.log('_sipSessionClient2:', _sipSessionClient)
  console.log('_eventHandlers2 :', _eventHandlers)
  _eventHandlers.push(
    () => addEventHandler(_sipSessionClient.onEventProgress, _sipSessionClient, onIncomingCall),
    () => addEventHandler(_sipSessionClient.onEventMuted, _sipSessionClient, onMute),
    () => addEventHandler(_sipSessionClient.onEventUnmuted, _sipSessionClient, onUnmute),
    () => addEventHandler(_sipSessionClient.onEventNewDtmf, _sipSessionClient, onDtmf)
  )
},
  sipAnswer () {
  console.log('sipService.answer before')
  execute(() => {
    console.log('sipService.answer')
    _sipSessionClient.answer({ sessionTimersExpires: SESSION_EXPIRATION_TIME })
  })
},
  terminate () {
    execute(() => {
      console.log('sipService.terminate')
      _sipSessionClient.terminate()
    })
  },
  mute () {
    execute(() => {
      console.log('sipService.mute')
      _sipSessionClient.muteAudio()
    })
  },
  unmute () {
    execute(() => {
      console.log('sipService.unmute')
      _sipSessionClient.unmuteAudio()
    })
  },
  sendDtmf (tone) {
    execute(() => {
      console.log(`sipService.sendDtmf(${tone})`)
      _sipSessionClient.sendDtmf(tone)
    })
  }
}
