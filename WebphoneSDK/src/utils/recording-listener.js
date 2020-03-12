class RecordingListener {
  onStart () {
    console.log('recording begin')
  }
  onStop () {
    console.log('recording stop')
  }
  ondataavailable (slice, blob) {
    console.log('recording data: len = ' + slice.length)
  }
}

export default RecordingListener
