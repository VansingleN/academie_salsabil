import collegeCardImage from '../images/card_college.webp'
import primaryCardImage from '../images/card_primaire.webp'
import seedMascot from '../images/seed_mascot.webp'
import treeMascot from '../images/tree_mascot.webp'

const summerCampAssets = [
  primaryCardImage,
  collegeCardImage,
  seedMascot,
  treeMascot
]

let preloadPromise
let hoverTimer
const preloadedImages = []

export function preloadSummerCampAssets() {
  if (preloadPromise) return preloadPromise

  preloadPromise = Promise.all(
    summerCampAssets.map((src) => {
      const image = new Image()
      image.decoding = 'async'
      image.fetchPriority = 'auto'
      image.src = src
      preloadedImages.push(image)

      if (image.complete) {
        return Promise.resolve()
      }

      return new Promise((resolve) => {
        image.addEventListener('load', resolve, { once: true })
        image.addEventListener('error', resolve, { once: true })
      })
    })
  )

  return preloadPromise
}

export function scheduleSummerCampPreload() {
  if (preloadPromise || hoverTimer) return

  hoverTimer = window.setTimeout(() => {
    hoverTimer = undefined
    preloadSummerCampAssets()
  }, 180)
}

export function cancelSummerCampPreload() {
  if (!hoverTimer) return

  window.clearTimeout(hoverTimer)
  hoverTimer = undefined
}
