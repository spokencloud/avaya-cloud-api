function Message ({
    event = null,
    error = null,
    data = null
  } = {} ) {
  this.event = event
    this.error = error
    this.data = data
};

export default class Serializer {
  static normalizeMessage (data) {
    return new Message(data)
  }

  static normalizeSipConnectionDetails (data) {
    console.log('Serializer.normalizeSipConnectionDetails', data)
    return Object.assign({}, {
      uri: null,
      port: null,
      extension: null,
      password: null,
      secure: null
    }, data)
  }

  static normalizeAuxCodes (data) {
    console.log('Serializer.normalizeAuxCodes', data)
    if (!Array.isArray(data)) {
      return data
    }
    return data
      .map(auxCode => {
        return Object.assign({}, {
          reason: null,
          code: null
        }, auxCode)
      })
      .filter(auxCode => auxCode.reason !== undefined)
      .filter(auxCode => auxCode.reason !== null)
      .filter(auxCode => typeof auxCode.reason === 'string')
      .filter(auxCode => {
        const trimmedReason = auxCode.reason.trim()
        return trimmedReason.length > 0
      })
  }

  static normalizeAgentState (data) {
    console.log('Serializer.normalizeAgentState', data)
    return Object.assign({}, {
      state: null,
      channel: null,
      auxCode: null
    }, data)
  }

  static normalizeBootstrapData (data) {
    console.log('Serializer.normalizeBootstrapData', data)
    const {
      agentId = null,
      stationId = null,
      agentState = {},
      auxCodes = [],
      sipConnectionDetails = {},
      authToken = null,
      uploadServiceUrl = null,
      config = {},
      maskEnabled,
      telecommuterMode
    } = data || {}
    return Object.assign({}, {
      agentId,
      stationId,
      agentState: Serializer.normalizeAgentState(agentState),
      auxCodes: Serializer.normalizeAuxCodes(auxCodes),
      sipConnectionDetails: Serializer.normalizeSipConnectionDetails(sipConnectionDetails),
      authToken,
      uploadServiceUrl,
      config,
      maskEnabled,
      telecommuterMode
    })
  }

  static normalizeScreenPopsConfig (data) {
    console.log('Serializer.normalizeScreenPopsConfig', data)
    const {
      enabled = false,
      urlTemplate = null
    } = data || {}
    return Object.assign({}, {
      enabled,
      urlTemplate
    })
  }

  static normalizeCallDetails (data) {
    console.log('Serializer.normalizeCallDetails')
    const {
      id: callId = null,
      callerId = null,
      connectionUid = null,
      sessionUid = null,
      authToken = null,
      skillName = null
    } = data || {}
    return Object.assign({}, {
      callId,
      callerId,
      connectionUid,
      sessionUid,
      authToken,
      skillName
    }, data)
  }

  static normalizeHangUpResponse (data) {
    console.log('Serializer.normalizeHangUpResponse')
    const {
      id: callId = null
    } = data || {}
    return callId
  }
}
