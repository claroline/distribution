/* global process, require */

import {
  applyMiddleware,
  combineReducers,
  compose,
  createStore as baseCreate
} from 'redux'
import thunk from 'redux-thunk'
import {reducers as editorReducers} from './editor/reducers'
import {reducers as playerReducers} from './player/reducers'
import {reducers as quizReducers} from './reducers'

const middleware = [thunk]

if (process.env.NODE_ENV !== 'production') {
  const freeze = require('redux-freeze')
  middleware.push(freeze)
}

const reducer = combineReducers({
  quiz: editorReducers.quiz,
  steps: editorReducers.steps,
  items: quizReducers.viewMode === 'editor' ? editorReducers.items : playerReducers.items,
  currentObject: editorReducers.currentObject,
  openPanels: editorReducers.openPanels,
  modal: editorReducers.modal,
  viewMode: quizReducers.viewMode
})

export function createStore(initialState) {
  return baseCreate(reducer, initialState, compose(
    applyMiddleware(...middleware),
    window.devToolsExtension ? window.devToolsExtension() : f => f
  ))
}
