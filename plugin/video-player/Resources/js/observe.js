export default function observe (selector, callback, containers = [document.body]) {
  window.MutationObserver = window.MutationObserver || window.WebKitMutationObserver

  const initialized = []
  // create an observer instance
  var observer = new MutationObserver(function (mutations) {
    mutations.forEach(mutation => {
      if (mutation.type == 'attributes') {
          var toInit = $(mutation.target).find(selector)
          toInit.each((i, el) => {
              let keepGoing = true
              initialized.forEach(id => {
                  //this is required because otherwise videoJs goes into infinite loop for unknown reason
                  //as it automatically adds html_5_api at the end of an id wich triggers the observer wich trigger video js
                  //to add html_5_api to the id wich trigger the observer... etc.
                  if (el.id.indexOf(id) === 0) keepGoing = false
              })

              if (keepGoing) {
                  callback(el)
                  initialized.push(el.id)
              }
          })
      }
    })
  })

  var config = { attributes: true, childList: false, characterData: false, subtree: true }
  containers.forEach(container => observer.observe(container, config))
}
//https://github.com/AdamPietrasiak/jquery.initialize
