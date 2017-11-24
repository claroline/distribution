import cloneDeep from 'lodash/cloneDeep'

import {makeListReducer} from '#/main/core/layout/list/reducer'

import {reducer as apiReducer} from '#/main/core/api/reducer'
import {reducer as modalReducer} from '#/main/core/layout/modal/reducer'

import {
  THEME_UPDATE,
  THEMES_REMOVE
} from './actions'

const reducer = {
  themes: makeListReducer('themes', {}, {
    data: {
      [THEME_UPDATE]: (state, action) => {
        const newState = cloneDeep(state)

        // retrieve the theme we have updated
        const updatedTheme = newState.find(theme => action.theme.id === theme.id)

        // replace the updated in the themes list
        newState[newState.indexOf(updatedTheme)] = action.theme
      },

      [THEMES_REMOVE]: (state, action) => {
        const newState = cloneDeep(state)

        return newState.filter(theme => -1 !== action.themeIds.indexOf(theme.id))
      }
    }
  }),
  // generic reducers
  currentRequests: apiReducer,
  modal: modalReducer
}

export {
  reducer
}
