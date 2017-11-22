import {shuffle, sampleSize} from 'lodash/collection'
import moment from 'moment'
import times from 'lodash/times'
import cloneDeep from 'lodash/cloneDeep'

import {tex} from '#/main/core/translation'
import {makeId} from './../../utils/utils'
import defaults from './../defaults'

import {
  SHUFFLE_ONCE,
  SHUFFLE_ALWAYS,
  QUIZ_PICKING_DEFAULT,
  QUIZ_PICKING_TAGS
} from './../enums'

// TODO : apply shuffle on answer items

/**
 * Generate a new paper for a quiz.
 *
 * @param {object} quiz - the quiz definition
 * @param {object} steps - the list of quiz steps
 * @param {object} items - the list of quiz items
 * @param {object} previousPaper - the previous attempt of the user if any
 *
 * @returns {{number: number, anonymized: boolean, structure}}
 */
export function generatePaper(quiz, steps, items, previousPaper = null) {
  return {
    id: makeId(),
    finished: false,
    startDate: moment().format('YYYY-MM-DD[T]HH:mm:ss'),
    endDate: null,
    user: {
      name: tex('you')
    },
    number: previousPaper ? previousPaper.number + 1 : 1,
    anonymized: quiz.parameters.anonymizeAttempts,
    structure: generateStructure(quiz, steps, items, previousPaper)
  }
}

function generateStructure(quiz, steps, items, previousPaper = null) {
  switch (quiz.picking.type) {
    case QUIZ_PICKING_TAGS:
      return generateStructureByTags(quiz, steps, items, previousPaper)
    case QUIZ_PICKING_DEFAULT:
    default:
      return generateStructureBySteps(quiz, steps, items, previousPaper)
  }
}

function generateStructureBySteps(quiz, steps, items, previousPaper = null) {
  const picking = quiz.picking
  const previousStructure = getPreviousStructure(quiz, previousPaper)

  // Generate the list of step ids for the paper
  let pickedSteps
  if (previousPaper && SHUFFLE_ONCE === picking.randomPick) {
    // Get picked steps from the last user paper
    pickedSteps = previousStructure.steps.slice(0)
  } else {
    // Pick a new set of steps
    pickedSteps = pick(quiz.steps, picking.pick).map(stepId => steps[stepId])
  }

  // Shuffles steps if needed
  if ( (!previousPaper && SHUFFLE_ONCE === picking.randomOrder)
    || SHUFFLE_ALWAYS === picking.randomOrder) {
    pickedSteps = shuffle(pickedSteps)
  }

  // Pick questions for each steps and generate structure
  return Object.assign({}, quiz, {
    steps: pickedSteps.map((pickedStep) => {
      let pickedItems = []

      const stepStructure = previousPaper ? previousStructure.find((step) => step.id === pickedStep.id) : null
      if (stepStructure && SHUFFLE_ONCE === pickedStep.picking.randomPick) {
        // Get picked items from the last user paper
        // Retrieves the list of items of the current step
        pickedItems = stepStructure.items.slice(0)
      } else {
        // Pick a new set of questions
        pickedItems = pick(pickedStep.items, pickedStep.picking.pick).map(itemId => items[itemId])
      }

      // Shuffles items if needed
      if ( (!previousPaper && SHUFFLE_ONCE === pickedStep.picking.randomOrder)
        || SHUFFLE_ALWAYS === pickedStep.picking.randomOrder) {
        pickedItems = shuffle(pickedItems)
      }

      return Object.assign({}, pickedStep, {
        items: pickedItems
      })
    })
  })
}

function generateStructureByTags(quiz, steps, items) {
  const pageSize = quiz.picking.pageSize
  const tags = quiz.picking.pick
  const total = tags.reduce((sum, tag) => sum + parseInt(tag[1]), 0)
  const countSteps = Math.ceil(total/pageSize)
  const availableItems = Object.keys(items).map(key => items[key])

  let pickedSteps = []
  let pickedItems = []

  //get the list of available items given the current options
  tags.forEach(tag => {
    let taggedItems = availableItems.filter(item => item.tags.indexOf(tag[0]) >= 0)
    taggedItems = pick(taggedItems, tag[1])
    taggedItems.forEach(item => {
      availableItems.splice(availableItems.findIndex(availableItem => availableItem.id === item.id), 1)
    })
    pickedItems = pickedItems.concat(taggedItems)
  })

  pickedItems = shuffle(pickedItems)

  //create the steps
  times(countSteps, () => {
    let step = cloneDeep(defaults.step)
    step.id = makeId()
    times(pageSize, () => {
      let pickedItem = pick(pickedItems, 1)[0]
      if (pickedItem) {
        //remove it from the list now
        pickedItems.splice(pickedItems.findIndex(availableItem => availableItem.id === pickedItem.id), 1)
        step.items.push(pickedItem)
      }
    })

    if (step.items.length > 0) {
      pickedSteps.push(step)
    }
  })

  return Object.assign({}, quiz, {
    steps: pickedSteps
  })
}

function getPreviousStructure(quiz, previousPaper = null) {
  // The structure of the previous paper if any
  let previousStructure
  if (previousPaper) {
    previousStructure = Object.assign({}, previousPaper.structure)
  } else {
    previousStructure = Object.assign({}, quiz)
  }

  return previousStructure
}

/**
 * Picks a random subset of elements in a collection.
 * If count is 0, the whole collection is returned.
 *
 * @param {Array} originalSet
 * @param {number} count
 *
 * @returns {array}
 */
function pick(originalSet, count = 0) {
  let picked
  if (0 !== count) {
    // Get a random subset of element
    picked = sampleSize(originalSet, count).sort((a, b) => {
      // We need to put the picked items in their original order
      if (originalSet.indexOf(a) < originalSet.indexOf(b)) {
        return -1
      } else if (originalSet.indexOf(a) > originalSet.indexOf(b)) {
        return 1
      }
      return 0
    })
  } else {
    picked = originalSet.slice(0)
  }

  return picked
}
