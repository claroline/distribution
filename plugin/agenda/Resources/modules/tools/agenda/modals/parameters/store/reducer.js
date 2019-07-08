import {makeFormReducer} from '#/main/app/content/form/store/reducer'

import {selectors} from '#/plugin/agenda/tools/agenda/modals/parameters/store/selectors'

const reducer = makeFormReducer(selectors.STORE_NAME)

export {
  reducer
}
