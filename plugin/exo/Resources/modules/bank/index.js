import {bootstrap} from '#/main/app/bootstrap'

import {registerDefaultItemTypes} from '#/plugin/exo/items/item-types'
import {registerModal} from '#/main/core/layout/modal'

// reducers
import {makePageReducer} from '#/main/core/layout/page/reducer'
import {reducer} from '#/plugin/exo/bank/reducer'

import {Questions} from '#/plugin/exo/bank/components/questions.jsx'
import {MODAL_SHARE, ShareModal} from '#/plugin/exo/bank/components/modal/share.jsx'

// Load question types
registerDefaultItemTypes()

// Register needed modals
registerModal(MODAL_SHARE, ShareModal)

// mount the react application
bootstrap(
  // app DOM container (also holds initial app data as data attributes)
  '.question-bank-container',

  // app main component
  Questions,

  // app store configuration
  makePageReducer({
    currentUser: (state = null) => state,
    questions: reducer
  })
)
