import {makeReducer} from '#/main/app/store/reducer'
import {makeFormReducer} from '#/main/core/data/form/reducer'

import {
  PROFILE_FACET_OPEN
} from '#/main/core/user/profile/actions'

const reducer = {
  currentFacet: makeReducer(null, {
    [PROFILE_FACET_OPEN]: (state, action) => action.id
  }),
  facets: makeReducer([], {}),
  user: makeFormReducer('user', {}),
  parameters: makeReducer({}, {})
}

export {
  reducer
}
