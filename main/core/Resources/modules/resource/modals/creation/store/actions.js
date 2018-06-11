import merge from 'lodash/merge'

import {makeActionCreator} from '#/main/app/store/actions'

import {currentUser} from '#/main/core/user/current'
import {actions as formActions} from '#/main/core/data/form/actions'

import {ResourceNode as ResourceNodeTypes} from '#/main/core/resource/prop-types'
import {selectors} from '#/main/core/resource/modals/creation/store'

// action names
export const RESOURCE_SET_PARENT = 'RESOURCE_SET_PARENT'

// action creators
export const actions = {}

actions.setParent = makeActionCreator(RESOURCE_SET_PARENT, 'parent')

actions.startCreation = (parent, resourceType) => (dispatch) => {
  dispatch(actions.setParent(parent))
  dispatch(formActions.resetForm(selectors.FORM_NAME, {
    resource: null,
    node: merge({}, ResourceNodeTypes.defaultProps, {
      meta: {
        mimeType: `custom/${resourceType.name}`,
        type: resourceType.name,
        creator: currentUser()
      },
      restrictions: parent.restrictions
    }),
    rights: parent.rights
  }, true))
}

actions.create = (parent) => {
  formActions.saveForm(selectors.STORE_NAME, ['claro_resource_action', {
    resourceType: parent.meta.type,
    action: 'add',
    id: parent.id
  }])
}