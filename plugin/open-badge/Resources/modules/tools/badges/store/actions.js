import merge from 'lodash/merge'
import isEmpty from 'lodash/isEmpty'

import {url} from '#/main/app/api'

import {API_REQUEST} from '#/main/app/api'
import {actions as formActions} from '#/main/app/content/form/store'
import {actions as listActions} from '#/main/app/content/list/store'
import {selectors}  from '#/plugin/open-badge/tools/badges/store/selectors'

import {Badge as BadgeTypes} from '#/plugin/open-badge/tools/badges/prop-types'

export const actions = {}

actions.openBadge = (formName, id = null, workspace = null) => {
  if (id) {
    return {
      [API_REQUEST]: {
        url: ['apiv2_badge-class_get', {id}],
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
        url: ['apiv2_assertion_get', {id}],
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

actions.addUsers = (id, users) => ({
  [API_REQUEST]: {
    url: url(['apiv2_badge-class_add_users', {badge: id}], {ids: users.map(user => user.id)}),
    request: {
      method: 'PATCH'
    },
    success: (data, dispatch) => {
      dispatch(listActions.invalidateData(selectors.STORE_NAME + '.badges.list'))
      dispatch(listActions.invalidateData(selectors.STORE_NAME + '.badges.current.assertions'))
    }
  }
})
