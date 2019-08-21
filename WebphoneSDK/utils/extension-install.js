
var popupCenter = function (url, title, w, h) {
  // Fixes dual-screen position                         Most browsers      Firefox
  var dualScreenLeft = window.screenLeft !== undefined ? window.screenLeft : window.screenX
  var dualScreenTop = window.screenTop !== undefined ? window.screenTop : window.screenY

  var width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width
  var height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height

  var left = ((width / 2) - (w / 2)) + dualScreenLeft
  var top = ((height / 2) - (h / 2)) + dualScreenTop
  var newWindow = window.open(url, title, 'scrollbars=yes, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left)

  // Puts focus on the newWindow
  if (window.focus) {
    newWindow.focus()
  }
}

var popupExtensionInstallation = function (extensionId, minimumVersion) {
  let text = minimumVersion ? 'Minimum version ' + minimumVersion + ' is required. Remove the old version?' : 'Add Webphone Extension to Chrome?'
  let okText = 'ok'
  let cancelText = 'cancel'
  var baseStoreUrl = 'https://chrome.google.com/webstore/detail/'
  var extensionUrl = baseStoreUrl + extensionId
  var w = window
  var h = 40
  var i = document.createElement('iframe')
  i.style.position = 'fixed'
  i.style.top = '-' + (h + 1) + 'px'
  i.style.left = 0
  i.style.right = 0
  i.style.width = '100%'
  i.style.height = h + 'px'
  i.style.backgroundColor = '#ffffe0'
  i.style.border = 'none'
  i.style.borderBottom = '1px solid #888888'
  i.style.zIndex = '9999999'
  if (typeof i.style.webkitTransition === 'string') {
    i.style.webkitTransition = 'all .25s ease-out'
  } else if (typeof i.style.transition === 'string') {
    i.style.transition = 'all .25s ease-out'
  }
  document.body.appendChild(i)
  var c = (i.contentWindow) ? i.contentWindow
    : (i.contentDocument.document) ? i.contentDocument.document : i.contentDocument
  c.document.open()
  c.document.write(
    '<span style="' +
    '  font-family: Helvetica, Arial, sans-serif; ' +
    '  font-size: .9rem; ' +
    '  padding: 7px; ' +
    '  vertical-align: middle; ' +
    '  cursor: default;' +
    '">' +
    text +
    '</span>')

  if (okText) {
    c.document.write(
      '<button id="okay">' + okText + '</button>' +
      '&nbsp;' +
      '<button>' + cancelText + '</button>')
    c.document.close()

    c.document.getElementById('okay').addEventListener('click', function (e) {
      popupCenter(extensionUrl, 'Avaya Screen Capture Extension', 960, 600)

      e.preventDefault()
      try {
        event.cancelBubble = true
      } catch (error) {
        // Mute the exception
      }
    })
  } else {
    c.document.close()
  }

  c.document.addEventListener('click', function () {
    w.document.body.removeChild(i)
  })

  setTimeout(function () {
    if (typeof i.style.webkitTransform === 'string') {
      i.style.webkitTransform = 'translateY(' + h + 'px)'
    } else if (typeof i.style.transform === 'string') {
      i.style.transform = 'translateY(' + h + 'px)'
    } else {
      i.style.top = '0px'
    }
  }, 300)
}

export default popupExtensionInstallation
