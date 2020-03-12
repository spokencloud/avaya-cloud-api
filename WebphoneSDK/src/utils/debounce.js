/**
 * Debounces the given function
 * @param {Function} func The function to be debounced
 * @param {number|null} [wait=200] The debounce wait time in milliseconds
 * @param {boolean} [immediate] Indicates if debounce should trigger on leading or trailing edge
 * @returns {Function} A debounced function
 */
export default function (func, wait, immediate) {
  let timeout

  return function () {
    const context = this
    const args = Array.from(arguments)

    const later = function () {
      timeout = null
      if (!immediate) {
        func.apply(context, args)
      }
    }

    const callNow = immediate && !timeout

    clearTimeout(timeout)

    timeout = setTimeout(later, wait || 200)

    if (callNow) {
      func.apply(context, args)
    }
  }
}
