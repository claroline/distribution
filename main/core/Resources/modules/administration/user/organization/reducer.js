import {combineReducers, makeReducer} from '#/main/core/utilities/redux'

import {makeFormReducer} from '#/main/core/layout/form/reducer'
import {makeListReducer} from '#/main/core/layout/list/reducer'

const reducer = combineReducers({
  list: makeListReducer('organizations.list', {}, {
    sortable: false,
    paginated: false
  }),
  current: makeFormReducer('organizations.current', {
    users: makeListReducer('organizations.current.users'),
    groups: makeListReducer('organizations.current.groups'),
    workspaces: makeListReducer('organizations.current.workspaces')
  })
})

export {
  reducer
}
