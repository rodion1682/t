export const loadScriptsFromString = scriptString => {
  let container = document.createElement('div')
  container.innerHTML = scriptString

  let scriptTags = container.getElementsByTagName('script')
  let scriptPromises = []

  // Create and append promises for each script
  for (let i = 0; i < scriptTags.length; i++) {
    let scriptTag = scriptTags[i]
    let newScript = document.createElement('script')
    let scriptPromise = new Promise(function (resolve, reject) {
      newScript.onload = function () {
        resolve()
      }
      newScript.onerror = function () {
        reject()
      }
    })

    if (scriptTag.src) {
      newScript.src = scriptTag.src

      if (scriptTag.hasAttribute('async')) {
        newScript.async = true
      } else if (scriptTag.hasAttribute('defer')) {
        newScript.defer = true
      }
    } else {
      newScript.textContent = scriptTag.textContent
    }

    document.head.appendChild(newScript)
    scriptPromises.push(scriptPromise)
  }

  // Wait for all script promises to resolve
  return Promise.all(scriptPromises)
}
