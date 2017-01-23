import invariant from 'invariant'
import {makeActionCreator} from './../../utils/utils'
import {actions as baseActions} from './../actions'
import {VIEW_CORRECTION_QUESTIONS, VIEW_CORRECTION_ANSWERS} from './../enums'

export const QUESTION_CURRENT = 'QUESTION_CURRENT'
export const SCORE_UPDATE = 'SCORE_UPDATE'
export const FEEDBACK_UPDATE = 'FEEDBACK_UPDATE'
export const REMOVE_ANSWERS = 'REMOVE_ANSWERS'

export const actions = {}

const setCurrentQuestionId = makeActionCreator(QUESTION_CURRENT, 'id')
const updateScore = makeActionCreator(SCORE_UPDATE, 'answerId', 'score')
const updateFeedback = makeActionCreator(FEEDBACK_UPDATE, 'answerId', 'feedback')
const removeAnswers = makeActionCreator(REMOVE_ANSWERS, 'ids')

actions.displayQuestions = () => {
  return (dispatch) => {
    dispatch(baseActions.updateViewMode(VIEW_CORRECTION_QUESTIONS))
  }
}

actions.displayQuestionAnswers = id => {
  invariant(id, 'Question id is mandatory')
  return (dispatch) => {
    dispatch(setCurrentQuestionId(id))
    dispatch(baseActions.updateViewMode(VIEW_CORRECTION_ANSWERS))
  }
}

actions.updateScore = (answerId, score) => {
  invariant(answerId, 'Answer id is mandatory')
  return (dispatch) => {
    dispatch(updateScore(answerId, score))
  }
}

actions.updateFeedback = (answerId, feedback) => {
  invariant(answerId, 'Answer id is mandatory')
  return (dispatch) => {
    dispatch(updateFeedback(answerId, feedback))
  }
}

actions.saveCorrection = (questionId) => {
  return (dispatch, getState) => {
    let data = []
    let indexes = []
    const state = getState()
    state.correction['answers'].forEach(a => {
      if (a.questionId === questionId && a.score !== undefined && a.score !== null && !isNaN(a.score)) {
        data.push({id: a.id, score: a.score})
        indexes.push(a.id)
      }
    })
    dispatch(removeAnswers(indexes))
  }
}