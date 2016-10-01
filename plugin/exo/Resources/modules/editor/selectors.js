import {createSelector} from 'reselect'
import {TYPE_QUIZ, TYPE_STEP} from './types'

const quizSelector = state => state.quiz
const stepsSelector = state => state.steps
const itemsSelector = state => state.items
const currentObjectSelector = state => state.currentObject

export const quizPropertiesSelector = state => state.quiz.meta

const stepListSelector = createSelector(
  quizSelector,
  stepsSelector,
  (quiz, steps) => quiz.steps.map(id => steps[id])
)

const quizThumbnailSelector = createSelector(
  quizSelector,
  currentObjectSelector,
  (quiz, current) => {
    return {
      id: quiz.id,
      title: 'Exercice',
      type: TYPE_QUIZ,
      active: quiz.id === current.id && current.type === TYPE_QUIZ
    }
  }
)

const stepThumbnailsSelector = createSelector(
  stepListSelector,
  currentObjectSelector,
  (steps, current) => steps.map((step, index) => {
    return {
      id: step.id,
      title: `Étape ${index + 1}`,
      type: TYPE_STEP,
      active: step.id === current.id && current.type === TYPE_STEP
    }
  })
)

export const thumbnailsSelector = createSelector(
  quizThumbnailSelector,
  stepThumbnailsSelector,
  (quiz, steps) => [quiz].concat(steps)
)

export const currentObjectDeepSelector = createSelector(
  currentObjectSelector,
  quizSelector,
  stepsSelector,
  itemsSelector,
  (current, quiz, steps, items) => {
    if (current.type === TYPE_QUIZ) {
      return {
        type: TYPE_QUIZ,
        id: quiz.id
      }
    }

    const step = steps[current.id]

    return {
      type: TYPE_STEP,
      id: step.id,
      items: step.items.map(itemId => items[itemId])
    }
  }
)

export const quizOpenPanelSelector = state => state.openPanels[TYPE_QUIZ]
const openStepPanelsSelector = state => state.openPanels[TYPE_STEP]

export const stepOpenPanelSelector = createSelector(
  currentObjectSelector,
  openStepPanelsSelector,
  (current, panels) => {
    if (current.type === TYPE_STEP && panels[current.id] !== undefined) {
      return panels[current.id]
    }
    return false
  }
)

export const modalSelector = state => state.modal

export const nextObjectSelector = createSelector(
  currentObjectSelector,
  quizSelector,
  stepListSelector,
  (current, quiz, steps) => {
    if (current.type === TYPE_QUIZ) {
      return current
    }

    if (steps.length <= 1) {
      return {
        id: quiz.id,
        type: TYPE_QUIZ
      }
    }

    const stepIndex = steps.findIndex(step => step.id === current.id)
    const nextIndex = stepIndex === 0 ? (stepIndex + 1) : (stepIndex - 1)

    return {
      id: steps[nextIndex].id,
      type: TYPE_STEP
    }
  }
)
