export default class AudioManager {
  /**
   * Stops the given HTMLAudioElement
   * @param {HTMLAudioElement} audio The HTMLAudioElement to stop
   */
  static stopAudio (audio) {
    if (audio instanceof Audio) {
      audio.pause()
      audio.currentTime = 0
    }
  }

  /**
   * Plays the given HTMLAudioElement
   * @param {HTMLAudioElement} audio The HTMLAudioElement instance to play
   * @returns {Promise<void>} A Promise that resolves void
   */
  static async playAudio (audio) {
    if (audio instanceof Audio) {
      await audio.play()
    }
  }

  /**
   * Returns a new HTMLAudioElement containing the given media stream
   * @param {MediaStream} mediaStream The media stream to load
   * @returns {HTMLAudioElement} An HTMLAudioElement containing the media stream
   */
  static getAudioStream (mediaStream) {
    const audio = new Audio()
    audio.srcObject = mediaStream
    return audio
  }

  /**
   * Returns a new HTMLAudioElement containing the audio file found at the given URI
   * @param {string} source The audio file source to be loaded
   * @param {AudioConfiguration} [config] A configuration for the HTMLAudioElement
   * @returns {Promise<HTMLAudioElement>} A Promise that resolves an HTMLAudioElement
   */
  static async getAudio (source, config) {
    /**
     * @typedef {Object} AudioConfiguration
     * @property {boolean} [loop=false] Indicates whether to loop the audio
     * @property {MediaKeys} [mediaKeys=null] The media keys to support
     */
    const {
      loop = false,
      mediaKeys = null
    } = config || {}

    const audio = new Audio()
    audio.src = source
    audio.loop = loop
    // For browser compatibility
    if (audio.setMediaKeys && typeof audio.setMediaKeys === 'function') {
      await audio.setMediaKeys(mediaKeys)
    }
    return audio
  }

  /**
   * Returns an HTMLAudioElement containing a DTMF tone
   * @param {AudioConfiguration} [config] A configuration for the HTMLAudioElement
   * @returns {Promise<HTMLAudioElement>} A Promise that resolves to an HTMLAudioElement
   */
  static async getDtmfTone (config) {
    return AudioManager.getAudio(AudioManager.Tone.DTMF, config)
  }

  /**
   * Returns an HTMLAudioElement containing an inbound ring tone
   * @param {AudioConfiguration} [config] A configuration for the HTMLAudioElement
   * @returns {Promise<HTMLAudioElement>} A Promise that resolves to an HTMLAudioElement
   */
  static async getInboundRingTone (config) {
    return AudioManager.getAudio(AudioManager.Tone.INBOUND_CALL, config)
    // return AudioManager.getAudio('./assets/sounds/tone_inbound_call.wav', config)
  }

  /**
   * All available tones
   * @returns {ToneToUri} A mapping of a tone to its asset file
   */
  static get Tone () {
    /**
     * @typedef {Object} ToneToUri
     * @property {string} DTMF The DTMF tone
     * @property {string} INBOUND_CALL The INBOUND_CALL tone
     */
    return {
      DTMF: './assets/sounds/tone_dtmf.wav',
      INBOUND_CALL: './assets/sounds/tone_inbound_call.wav'
    }
  }
}
