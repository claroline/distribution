import {combineReducers, makeReducer} from '#/main/core/scaffolding/reducer'
import {makeFormReducer} from '#/main/core/data/form/reducer'
import {makeListReducer} from '#/main/core/data/list/reducer'
import {
  SUBJECT_LOAD
} from '#/plugin/forum/resources/forum/player/actions'


const reducer = combineReducers({
  form: makeFormReducer('subjects.form', {
    showSubjectForm: false
  }, {
    showSubjectForm: makeReducer(false, {})
  }),
  list: makeListReducer('subjects.list', {
    // sortBy: [{property: 'meta.sticky', direction: -1}]
  }),
  current: makeReducer({}, {
    [SUBJECT_LOAD]: (state, action) => action.subject
  }),
  messages: makeListReducer('subjects.messages')
})

export {
  reducer
}
