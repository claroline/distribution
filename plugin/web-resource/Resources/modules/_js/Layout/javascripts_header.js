/*eslint no-unused-vars: ["error", { "varsIgnorePattern": "enterFullScreen" }]*/

function runPrefixedMethod (obj, method) {
  var pfx = ['webkit', 'moz', 'ms', 'o', '']
  var p = 0, m = null, t = null

  while (p < pfx.length && !obj[m]) {
    m = method

    if (pfx[p] == '') {
      m = m.substr(0, 1).toLowerCase() + m.substr(1)
    }

    m = pfx[p] + m

    if ('undefined' !== (t = typeof obj[m])) {
      pfx = [pfx[p]]

      return t === 'function' ? obj[m]() : obj[m]
    }

    p++
  }
}

function enterFullScreen () {
  if (runPrefixedMethod(document, 'FullScreen') || runPrefixedMethod(document, 'IsFullScreen')) {
    runPrefixedMethod(document, 'CancelFullScreen')
  } else {
    runPrefixedMethod(document.getElementById('web-resource-frame'), 'RequestFullScreen')
  }
}
