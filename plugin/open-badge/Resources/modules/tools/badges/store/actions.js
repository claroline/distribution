import merge from 'lodash/merge'
import isEmpty from 'lodash/isEmpty'

import {API_REQUEST} from '#/main/app/api'
import {actions as formActions} from '#/main/app/content/form/store'

import {Badge as BadgeTypes} from '#/plugin/open-badge/prop-types'

export const actions = {}

actions.openBadge = (formName, id = null, workspace = null) => {
  if (id) {
    return {
      [API_REQUEST]: {
        silent: true,
        url: ['apiv2_badge-class_get', {id: id}],
        before: (dispatch) => {
          dispatch(formActions.resetForm(formName, {}, false))
        },
        success: (response, dispatch) => {
          dispatch(formActions.resetForm(formName, response, false))
        }
      }
    }
  }

  return formActions.resetForm(formName, merge({}, BadgeTypes.defaultProps, !isEmpty(workspace) ? {workspace: workspace} : {}), true)
}

actions.openAssertion = (formName, id = null) => {
  if (id) {
    return {
      [API_REQUEST]: {
        silent: true,
        url: ['apiv2_assertion_get', {id: id}],
        before: (dispatch) => {
          dispatch(formActions.resetForm(formName, {}, false))
        },
        success: (response, dispatch) => {
          dispatch(formActions.resetForm(formName, response, false))
        }
      }
    }
  }

  return formActions.resetForm(formName, {}, true)
}
