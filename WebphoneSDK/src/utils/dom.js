/**
 * Creates an array of HTML elements by traversing up from the
 * starting node to the very first parent node
 * @param {Object<HTMLElement>} startingNode The starting node
 * @returns {Array<HTMLElement>} an array of nodes starting from the first to the parent
 */
export function getNodeTree (startingNode) {
  const nodes = []
  let currentNode = startingNode
  while (currentNode) {
    nodes.push(currentNode)
    currentNode = currentNode.parentNode
  }
  return nodes
}

/**
 * Blurs the given target element
 * @param {Object<HTMLElement>} target The element to blur
 */
export function blurElement (target) {
  if (target && target.blur) {
    target.blur()
  }
}
