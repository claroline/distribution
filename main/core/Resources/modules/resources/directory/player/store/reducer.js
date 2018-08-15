import {makeReducer} from '#/main/app/store/reducer'
import {makeResourceExplorerReducer} from '#/main/core/resource/explorer/store/reducer'

import {RESOURCE_LOAD} from '#/main/core/resource/store/actions'

import {selectors} from '#/main/core/resources/directory/player/store/selectors'

const reducer = {
  directoryExplorer: makeResourceExplorerReducer(selectors.EXPLORER_NAME, {}, {
    current: makeReducer({}, {
      [RESOURCE_LOAD]: (state, action) => action.resourceData.resourceNode
    }),
    root: makeReducer({}, {
      [RESOURCE_LOAD]: (state, action) => action.resourceData.resourceNode
    })
  })
}

export {
  reducer
}