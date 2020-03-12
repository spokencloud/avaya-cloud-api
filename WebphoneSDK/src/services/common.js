/**
 * Registers a handler to the given event function
 * @param {Function} event A function that takes a function callback
 * @param {Object} context The "this" context for the event
 * @param {Function} handler The function to execute when the event is called
 */
export function addEventHandler (event, context, handler) {
  console.log('common event: ', event)
  console.log('common handler: ', handler)
  if (handler && typeof handler === 'function') {
    event.apply(context, [ handler ])
  }
}
