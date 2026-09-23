// Dynamic Adapt fixed for Vue
'use strict'

let dynamicAdaptInstance = null

function DynamicAdapt(type) {
  this.type = type
  this.objects = []
  this.mediaQueries = []
  this.daClassname = '_dynamic_adapt_'
  this.handlers = []
}

DynamicAdapt.prototype.init = function () {
  this.destroy()

  this.removeDuplicateDaNodes()

  this.objects = []
  this.mediaQueries = []
  this.handlers = []

  const nodes = document.querySelectorAll('[data-da]')

  nodes.forEach(node => {
    const data = node.dataset.da?.trim()
    if (!data) return

    const dataArray = data.split(',')
    const destination = document.querySelector(dataArray[0].trim())

    if (!destination) return

    const object = {
      element: node,
      parent: node.parentNode,
      destination,
      breakpoint: dataArray[1] ? dataArray[1].trim() : '767',
      place: dataArray[2] ? dataArray[2].trim() : 'last',
      index: this.indexInParent(node.parentNode, node),
    }

    this.objects.push(object)
  })

  this.arraySort(this.objects)

  this.mediaQueries = this.objects
    .map(
      item => `(${this.type}-width: ${item.breakpoint}px),${item.breakpoint}`,
    )
    .filter((item, index, self) => self.indexOf(item) === index)

  this.mediaQueries.forEach(media => {
    const mediaSplit = media.split(',')
    const matchMedia = window.matchMedia(mediaSplit[0])
    const mediaBreakpoint = mediaSplit[1]

    const objectsFilter = this.objects.filter(
      item => item.breakpoint === mediaBreakpoint,
    )

    const handler = () => {
      this.mediaHandler(matchMedia, objectsFilter)
    }

    if (matchMedia.addEventListener) {
      matchMedia.addEventListener('change', handler)
    } else {
      matchMedia.addListener(handler)
    }

    this.handlers.push({
      matchMedia,
      handler,
    })

    this.mediaHandler(matchMedia, objectsFilter)
  })
}

DynamicAdapt.prototype.destroy = function () {
  if (this.objects?.length) {
    for (let i = this.objects.length - 1; i >= 0; i--) {
      const object = this.objects[i]

      if (
        object.element &&
        object.parent &&
        document.body.contains(object.element) &&
        document.body.contains(object.parent) &&
        object.element.classList.contains(this.daClassname)
      ) {
        this.moveBack(object.parent, object.element, object.index)
      }
    }
  }

  if (this.handlers?.length) {
    this.handlers.forEach(({ matchMedia, handler }) => {
      if (matchMedia.removeEventListener) {
        matchMedia.removeEventListener('change', handler)
      } else {
        matchMedia.removeListener(handler)
      }
    })
  }

  this.objects = []
  this.mediaQueries = []
  this.handlers = []
}

DynamicAdapt.prototype.removeDuplicateDaNodes = function () {
  const groups = {}

  document.querySelectorAll('[data-da-id]').forEach(node => {
    const id = node.dataset.daId

    if (!id) return

    if (!groups[id]) {
      groups[id] = []
    }

    groups[id].push(node)
  })

  Object.values(groups).forEach(nodes => {
    if (nodes.length <= 1) return

    nodes.forEach((node, index) => {
      if (index > 0) {
        node.remove()
      }
    })
  })
}

DynamicAdapt.prototype.mediaHandler = function (matchMedia, objects) {
  if (matchMedia.matches) {
    objects.forEach(object => {
      if (
        !object.element ||
        !object.destination ||
        !document.body.contains(object.element) ||
        !document.body.contains(object.destination)
      ) {
        return
      }

      object.index = this.indexInParent(object.parent, object.element)
      this.moveTo(object.place, object.element, object.destination)
    })
  } else {
    for (let i = objects.length - 1; i >= 0; i--) {
      const object = objects[i]

      if (
        object.element &&
        object.parent &&
        document.body.contains(object.element) &&
        document.body.contains(object.parent) &&
        object.element.classList.contains(this.daClassname)
      ) {
        this.moveBack(object.parent, object.element, object.index)
      }
    }
  }
}

DynamicAdapt.prototype.moveTo = function (place, element, destination) {
  if (!destination || !element) return
  if (element.parentNode === destination) return

  element.classList.add(this.daClassname)

  if (place === 'last' || Number(place) >= destination.children.length) {
    destination.insertAdjacentElement('beforeend', element)
    return
  }

  if (place === 'first') {
    destination.insertAdjacentElement('afterbegin', element)
    return
  }

  destination.children[Number(place)].insertAdjacentElement(
    'beforebegin',
    element,
  )
}

DynamicAdapt.prototype.moveBack = function (parent, element, index) {
  if (!parent || !element) return
  if (element.parentNode === parent) return

  element.classList.remove(this.daClassname)

  if (parent.children[index] !== undefined) {
    parent.children[index].insertAdjacentElement('beforebegin', element)
  } else {
    parent.insertAdjacentElement('beforeend', element)
  }
}

DynamicAdapt.prototype.indexInParent = function (parent, element) {
  if (!parent || !element) return 0

  return Array.prototype.indexOf.call(parent.children, element)
}

DynamicAdapt.prototype.arraySort = function (arr) {
  if (this.type === 'min') {
    arr.sort((a, b) => {
      if (a.breakpoint === b.breakpoint) {
        if (a.place === b.place) return 0
        if (a.place === 'first' || b.place === 'last') return -1
        if (a.place === 'last' || b.place === 'first') return 1
        return Number(a.place) - Number(b.place)
      }

      return Number(a.breakpoint) - Number(b.breakpoint)
    })
  } else {
    arr.sort((a, b) => {
      if (a.breakpoint === b.breakpoint) {
        if (a.place === b.place) return 0
        if (a.place === 'first' || b.place === 'last') return 1
        if (a.place === 'last' || b.place === 'first') return -1
        return Number(b.place) - Number(a.place)
      }

      return Number(b.breakpoint) - Number(a.breakpoint)
    })
  }
}

export function initDynamicAdapt(type = 'max') {
  if (!dynamicAdaptInstance) {
    dynamicAdaptInstance = new DynamicAdapt(type)
  }

  dynamicAdaptInstance.init()

  return dynamicAdaptInstance
}

export function destroyDynamicAdapt() {
  if (dynamicAdaptInstance) {
    dynamicAdaptInstance.destroy()
    dynamicAdaptInstance = null
  }
}
