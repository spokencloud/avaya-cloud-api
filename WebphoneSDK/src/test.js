import SesClient from "./services/ses/SesClient.js"
import Serializer from "./services/ses/Serializer.js"
import sipService from "./services/sip/sip-service"
import screenRecorder from "./utils/screen-recorder.js"
import * as agentService from "./services/http/agent-service"
// import JsSIP from "jssip/dist/jssip.min"
import SipSessionClient from "./services/sip/SipSessionClient"

import * as Stomp from './stomp.js'
import { addEventHandler } from './services/common'
import AudioManager from "./services/AudioManager.js"



const SES_HEARTBEAT_INTERVAL_MS = 3000;

const state = {
  webphoneInitialized: false,
  averageLatencyMs: -1,
  onCall: false,
  onConsultationCall: false,
  onMergedCall: false,
  skills: [],
  agentId: '',
  stationId: '',

  agentStates: {
    currentValue: 'OFFLINE'
  },

  auxCodes: {
    currentCode: null,
    available: []
  },

  callDetails: {
    callerId: '',
    connectionUid: '',
    sessionUid: '',
    consultationCallerId: '',
    consultationCallId: null,
    duration: {
      seconds: 0,
      intervalId: null
    }
  },

  options: {
    hold: false,
    mask: false,
    mute: false
  },

  errors: {
    initializeWebphone: false
  },
  errorMessages: [],

  pending: {
    initializeWebphone: false,
    consultationCall: false,
    merge: false,
    warmTransfer: false,
    outboundCall: false,
    transfer: false
  }
},
INITIALIZED = 'initialize',
CHANGE_STATE_TO_READY = 'changeStateToReady',
CHANGE_STATE_TO_AFTER_CALL_WORK = 'changeStateToAfterCallWork',
CHANGE_STATE_TO_NOT_READY_EGAIN_DIGITAL = 'changeStateToNotReadyEgainDigital',
CHANGE_STATE_TO_OFFLINE = 'changeStateToOffline',
END_CALL = 'endCall',
MUTE_CALL = 'muteCall',
HOLD_CALL = 'holdCall',
OUTBOUND_CALL = 'outboundCall',
CONSULT_CALL = 'consultCall',
MERGE_CALL = 'mergeCall',
WARM_TRANSFER = "warmTransfer",
TRANSFER_CALL = 'transferCall',
END_CONSULTATION_CALL = 'endConsultationCall',
HOLD_CONSULTATION_CALL = 'holdConsultationCall';

let sesClient,
sesHeartbeatInterval;

async function commandToWebPhone(command, value) {
    if (command === INITIALIZED) {
      state.pending.initializeWebphone = true;
      state.errors.initializeWebphone = false;
      state.webphoneInitialized = false;
      refreshControls();
      state.errorMessages = [];
      try {
        if (sesClient && sesClient.isConnected()) {
          await sesClient.disconnect();
        }
        username = value.username
        password = value.password
        url = value.url
        sesClient = new SesClient(url, null, null, username, password)
        // sesClient = new SesClient(url, useAuthToken: true, v.authToken, null, null)
        await sesClient.connectAndSubscribeToAll();
        const bootstrapData = await sesClient.fetchBootstrapData();

        const sipConnectionDetails = bootstrapData.sipConnectionDetails;
        Object.assign(sipConnectionDetails, { username });

        fetchAgentssBySubAccountId('434019')
          .then(skills => {
          console.log(JSON.stringify(skills))
          skills = skills.sort(function (a, b) {
            if (a['username'] > b['username']) { return 1 }
            if (a['username'] < b['username']) { return -1 }
            return 0
          })
          var index = skills.findIndex(x => x.loginId === bootstrapData.agentId)
          if (index >= 0 && index < skills.length) {
            skills.splice(index, 1)
          }
          state.skills = skills;
        })

        const agentState = bootstrapData.agentState;
        state.agentStates.currentValue = agentState.state;
        state.auxCodes.currentCode = agentState.auxCode;
        state.auxCodes.available = bootstrapData.auxCodes;
        state.agentId = bootstrapData.agentId;
        state.stationId = bootstrapData.stationId;
        refreshControls();

        sesClient.addEventHandlers({
          onVoiceChannelAgentStateSuccess: agentState => {
          console.log('voiceChannelAgentStateSuccess', agentState)
          state.agentStates.currentValue = agentState.state;
          state.auxCodes.currentCode = agentState.auxCode;
          refreshControls();
        },
        onVoiceChannelAgentStateError: error => {
          console.error('voiceChannelAgentStateError', error);
          addErrorMessages(error);
        },
        onHoldSuccess: () => {
          console.log('holdSuccess')

          try {
            terminate()
          } catch (error) {
            console.warn('Attempted to terminate an already terminated call', error)
          }
          setTimeout(() => {
            if (sesClient._consultationCallTrigger !== null) {
              sesClient.consultationCallConnect(sesClient._consultationCallTrigger)
            }
          }, 4000)

          // sesClient.hold();
          state.options.hold = true;
          state.options.mute = false;
          isOnHold = true;
          isOnMute = false;
          refreshControls();
        },
        onHoldError: error => {
          console.error('holdError', error);
          addErrorMessages(error);
        },
        onUnholdSuccess: () => {
          console.log('unholdSuccess');
          state.options.hold = false;
          refreshControls();
        },
        onUnholdError: error => {
          console.error('unholdError', error)
          addErrorMessages(error);
        },
        onCallDeliveredSuccess: callDetails => {
          console.log('callDeliveredSuccess', callDetails)
          startCall(callDetails);
          state.pending.outboundCall = false;
          refreshControls();
        },
        onCallDeliveredError: error => {
          console.error('callDeliveredError', error);
          state.pending.outboundCall = false;
          refreshControls();
          addErrorMessages(error);
        },
        onCallOriginatedSuccess: callDetails => {
          console.log('callOriginatedSuccess', callDetails);
          state.onCall = true;
          state.pending.outboundCall = false;
          refreshControls();
        },
        onCallOriginatedError: error => {
          console.error('callOriginatedError', error);
          addErrorMessages(error);
        },
        onHangUpSuccess: callId => {
          console.log('hangUpSuccess')
          try {
            terminate()
          } catch (error) {
            console.warn('Attempted to terminate an already terminated call', error)
          }

          if (!state.onMergedCall && callId === state.callDetails.consultationCallId) {
             state.callDetails.consultationCallId = null;
             state.callDetails.consultationCallerId = '';
             state.onConsultationCall = false;
           } else {
             state.onCall = false;
             state.callDetails.callerId = '';
             endCallTimer();
             resetCallTimer();
             state.options.hold = false;
             state.options.mute = false;
          }
          state.callDetails.connectionUid = null;
          state.callDetails.sessionUid = null;
          state.onMergedCall = false;
          refreshControls();
        },
        onHangUpError: error => {
          console.error('hangUpError', error)
          addErrorMessages(error);
        },
        onTransferSuccess: () => {
          console.log('transferSuccess')
          try {
            terminate()
          } catch (error) {
            console.warn('Attempted to terminate an already terminated call', error)
          }
          state.pending.transfer = false;
          state.onCall = false;
          state.callDetails.callerId = '';
          endCallTimer();
          resetCallTimer();
          state.options.hold = false;
          state.options.mute = false;
          refreshControls();
        },
        onTransferError: error => {
          console.error('transferError', error)
          addErrorMessages(error);
          state.pending.transfer = false;
          refreshControls();
        },
        onConfirmedWarmTransferSuccess: () => {
          console.log('confirmedWarmTransferSuccess')
          state.pending.warmTransfer = false;
          state.onCall = false;
          state.callDetails.callerId = '';
          endCallTimer();
          resetCallTimer();
          state.options.hold = false;
          state.options.mute = false;
          refreshControls();
	    },
	    onConfirmedWarmTransferError: error => {
	      console.error('confirmedWarmTransferError', error)
	      state.pending.warmTransfer = false;
	      addErrorMessages(error);
	      refreshControls();
	    },
	    onWarmTransferFailed: () => {
	      console.error('warmTransferFailed', error)
	      state.pending.warmTransfer = false;
	      addErrorMessages(error);
	      refreshControls();
	    },
	    onWarmTransferFailedError: error => {
	      console.error('warmTransferFailedError', error)
	      state.pending.warmTransfer = false;
	      addErrorMessages(error);
	      refreshControls();
	    },
        onConsultationSuccess: callDetails => {
          console.log('onConsultationSuccess', callDetails)
          const { callerId = '' } = callDetails || {}
          state.callDetails.consultationCallerId = callerId;
          refreshControls();
        },
        onConsultationError: error => {
          console.error('onConsultationError', error)
          addErrorMessages(error);
        },
        onConfirmedConsultationSuccess: callDetails => {
          console.log('onConfirmedConsultationSuccess', callDetails)
          const { callId = null } = callDetails || {}
          state.callDetails.consultationCallId = callId;
          state.pending.consultationCall = false;
          state.onConsultationCall = true;
          refreshControls();
        },
        onConfirmedConsultationError: error => {
          console.error('onConfirmedConsultationError', error)
          addErrorMessages(error);
          state.pending.consultationCall = false;
          refreshControls();
        },
        onMergeSuccess: () => {
          console.log('onMergeSuccess');
          state.pending.merge = false;
          state.callDetails.consultationCallId = null;
          state.callDetails.consultationCallerId = '';
          state.onConsultationCall = false;
          state.onMergedCall = true;
          state.options.hold = false;
          refreshControls();
        },
        onMergeError: error => {
          console.error('onMergeError');
          state.pending.merge = false;
          addErrorMessages(error);
        },
        onMaskRecordingSuccess: () => {
          console.log('onMaskRecordingSuccess')
          // screenRecorder.pauseCapturing()
        },
        onMaskRecordingError: error => {
          console.error('onMaskRecordingError')
        },
        onUnmaskRecordingSuccess: () => {
          console.log('onUnmaskRecordingSuccess')
          // screenRecorder.resumeCapturing()
        },
        onUnmaskRecordingError: error => {
          console.error('onUnmaskRecordingError')
        }
      });
      await sipInitialize(sipConnectionDetails);
      sipAddEventHandlers({
         onIncomingCall: () => sipAnswer(),
         onMute: () => { state.options.mute = true;
         refreshControls();},
         onUnmute: () => { state.options.mute = false;
         refreshControls();}
       });

     if (sesHeartbeatInterval) {
        clearInterval(sesHeartbeatInterval)
        sesHeartbeatInterval = null
      }
      sesClient.subscribeToHeartbeat({
        onComputedAverageLatencyMs: averageLatencyMs => {
          console.log(`Average latency (ms) = ${averageLatencyMs}`)
          state.averageLatencyMs = averageLatencyMs;
        }
      })
      sesHeartbeatInterval = setInterval(() => {
        sesClient.sendHeartbeat()
      }, SES_HEARTBEAT_INTERVAL_MS)

     state.webphoneInitialized = true;
   } catch (error) {
     console.error('Failed to initialize the Webphone', error);
     state.errors.initializeWebphone = true;
   }
    state.pending.initializeWebphone = false;
    refreshControls();
  }
  else if (command === CHANGE_STATE_TO_READY) {
    sesClient.setVoiceChannelAgentState('READY')
  }
  else if (command === END_CALL) {
    endCall();
  } else if (command === MUTE_CALL) {
    toggleMute();
  } else if (command === HOLD_CALL) {
    toggleHold();
  } else if (command === OUTBOUND_CALL) {
    makeOutboundCall(value);
  } else if (command === CONSULT_CALL) {
    makeConsultCall(value);
  } else if (command === MERGE_CALL) {
    makeMergeCalls();
  } else if (command === WARM_TRANSFER) {
	makeWarmTransferCall();
  } else if (command === TRANSFER_CALL) {
    makeTransferCall(value);
  } else if (command === END_CONSULTATION_CALL) {
    disconnectConsultationCall();
  } else if (command === HOLD_CONSULTATION_CALL) {
    holdConsultationCall();
  }
};
function startCall(callDetails) {
  console.log('actions.startCall')
  var config = {
    tabCaptureAPI: false,
    microphone: true,
    camera: true,
    screen: true,
    speakers: true
  };
  sesClient
    .fetchScreenPopsConfigForSessionId(callDetails.sessionUid)
    .then(screenPopsConfig => {
      console.log('screenPopsConfig:', screenPopsConfig)
      if (screenPopsConfig && screenPopsConfig.enabled) {
        if (screenPopsConfig.urlTemplate) {
          window.open(screenPopsConfig.urlTemplate, '_blank')
        } else {
          console.error('Screen Pop URL empty. Not popping.')
        }
      }
    })
    .catch(error => {
      console.error('While fetching screen pops configuration:', error)
    })

    const { callerId = '' } = callDetails || {}
    state.callDetails.callerId = callerId;
    state.callDetails.connectionUid = callDetails.connectionUid;
    state.callDetails.sessionUid = callDetails.sessionUid;
    state.onCall = true;

    startCallTimer();
    refreshCallDuration();
    refreshControls();
}
function endCall() {
  console.log('actions.endCall: ')
  sesClient.hangUp();
}
function toggleMute() {
  if (state.options.mute) {
    console.log('actions.toggleMicrophone > unmute()')
    unmute();
    state.options.mute = false;
  } else {
    console.log('actions.toggleMicrophone > mute()')
    mute();
    state.options.mute = true;
  }
  refreshControls();
}
function toggleHold() {
  console.log('isOnHold: ', isOnHold);
  if (state.options.hold) {
    console.log('actions.toggleHold > unhold()')
    sesClient.unhold();
    state.options.hold = false;
  } else {
    console.log('actions.toggleHold > hold()')
    sesClient.hold();
    state.options.hold = true;
  }
  refreshControls();
}
function makeOutboundCall(phoneNo) {
  console.log('actions.makeOutboundCall');
  state.pending.outboundCall = true;
  refreshControls();
  sesClient.outboundCall(phoneNo);
}
function makeConsultCall(phoneNo) {
  console.log('actions.makeConsultationCall');
  state.pending.consultationCall = true;
  refreshControls();
  sesClient.consultationCall(phoneNo);
}
function makeMergeCalls() {
  console.log('actions.mergeCalls');
  state.pending.merge = true;
  refreshControls();
  sesClient.mergeCalls();
}
function makeWarmTransferCall() {
  console.log('actions.warmTransfer');
  state.pending.warmTransfer = true;
  refreshControls();
  sesClient.warmTransfer();
}
function makeTransferCall(phoneNo) {
  console.log('actions.transferCall');
  state.pending.transfer = true;
  refreshControls();
  sesClient.transfer(phoneNo);
}
function addErrorMessages(errorMessage) {
  if (!state.errorMessages.includes(errorMessage)) {
    state.errorMessages.push(errorMessage)
  }
}
function startCallTimer() {
  if (state.callDetails.duration.intervalId !== null) {
    console.log('null return')
    return
  }
  state.callDetails.duration.intervalId = setInterval(function () {
  incrementCallTimer();
  }, 1000);
}

function incrementCallTimer() {
  state.callDetails.duration.seconds++;
  refreshCallDuration();
}
function resetCallTimer() {
  state.callDetails.duration.seconds = 0;
  refreshCallDuration();
}
function endCallTimer() {
  if (state.callDetails.duration.intervalId === null) {
    return
  }
  clearInterval(state.callDetails.duration.intervalId)
  state.callDetails.duration.intervalId = null;
  refreshCallDuration();
}
function disconnectConsultationCall () {
  console.log('actions.disconnectConsultationCall')
  sesClient.hangUpByCallId(state.callDetails.consultationCallId);
}
function holdConsultationCall () {
  console.log('actions.holdConsultationCall')
  if (state.options.hold) {
    console.log('actions.toggleHold > unhold()')
    sesClient.unhold()
    sesClient.holdByCallId(state.callDetails.consultationCallId)
  } else {
    console.log('actions.toggleHold > hold()')
    sesClient.hold()
    sesClient.unholdByCallId(state.callDetails.consultationCallId)
  }
}
