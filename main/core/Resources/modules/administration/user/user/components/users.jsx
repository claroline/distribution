import React from 'react'
import {PropTypes as T} from 'prop-types'
import {connect} from 'react-redux'

import {trans} from '#/main/core/translation'
import {CALLBACK_BUTTON, LINK_BUTTON, URL_BUTTON} from '#/main/app/buttons'

import {ListData} from '#/main/app/content/list/containers/data'
import {actions as modalActions} from '#/main/app/overlay/modal/store'
import {MODAL_USER_PASSWORD} from '#/main/core/user/modals/password'
import {actions as userActions} from '#/main/core/user/actions'

import {actions} from '#/main/core/administration/user/user/actions'
import {UserList, getUserListDefinition} from '#/main/core/administration/user/user/components/user-list'

// todo : restore custom actions the same way resource actions are implemented

const UsersList = props =>
  <ListData
    name="users.list"
    fetch={{
      url: ['apiv2_user_list_managed_organization'],
      autoload: true
    }}
    delete={{
      url: ['apiv2_user_delete_bulk']
    }}
    primaryAction={UserList.open}
    actions={(rows) => [
      {
        type: URL_BUTTON,
        icon: 'fa fa-fw fa-id-card-o',
        label: trans('show_profile'),
        target: ['claro_user_profile', {publicUrl: rows[0].meta.publicUrl}],
        scope: ['object']
      }, {
        type: CALLBACK_BUTTON,
        icon: 'fa fa-fw fa-lock',
        label: trans('change_password'),
        scope: ['object'],
        callback: () => props.updatePassword(rows[0]),
        dangerous: true
      }, {
        type: URL_BUTTON,
        icon: 'fa fa-fw fa-line-chart',
        label: trans('show_tracking'),
        target: ['claro_user_tracking', {publicUrl: rows[0].meta.publicUrl}],
        scope: ['object']
      }, {
        type: URL_BUTTON,
        icon: 'fa fa-fw fa-user-secret',
        label: trans('show_as'),
        target: ['claro_desktop_open', {_switch: rows[0].username}],
        scope: ['object']
      }, {
        type: CALLBACK_BUTTON,
        icon: 'fa fa-fw fa-check-circle',
        label: trans('enable_user'),
        scope: ['object', 'collection'],
        displayed: 0 < rows.filter(u => u.restrictions.disabled).length,
        callback: () => props.enable(rows)
      }, {
        type: CALLBACK_BUTTON,
        icon: 'fa fa-fw fa-times-circle',
        label: trans('disable_user'),
        scope: ['object', 'collection'],
        displayed: 0 < rows.filter(u => !u.restrictions.disabled).length,
        callback: () => props.disable(rows),
        dangerous: true
      }, {
        type: CALLBACK_BUTTON,
        icon: 'fa fa-fw fa-book',
        label: trans('enable_personal_ws'),
        scope: ['object'], // todo should be a selection action too
        displayed: !rows[0].meta.personalWorkspace,
        callback: () => props.createWorkspace(rows[0])
      }, {
        type: CALLBACK_BUTTON,
        icon: 'fa fa-fw fa-book',
        label: trans('disable_personal_ws'),
        scope: ['object'], // todo should be a selection action too
        displayed: rows[0].meta.personalWorkspace,
        callback: () => props.deleteWorkspace(rows[0]),
        dangerous: true
      }, {
        type: LINK_BUTTON,
        icon: 'fa fa-fw fa-compress',
        label: trans('merge_accounts'),
        target: rows.length === 2 ? `/users/merge/${rows[0].id}/${rows[1].id}`: '',
        displayed: rows.length === 2,
        dangerous: true
      }
    ]}
    definition={getUserListDefinition({platformRoles: props.platformRoles})}
    card={UserList.card}
  />

UsersList.propTypes = {
  enable: T.func.isRequired,
  disable: T.func.isRequired,
  createWorkspace: T.func.isRequired,
  deleteWorkspace: T.func.isRequired,
  updatePassword: T.func.isRequired,
  platformRoles: T.array.isRequired
}

UsersList.defaultProps = {
  platformRoles: []
}

const Users = connect(
  state => ({
    platformRoles: state.platformRoles
  }),
  dispatch => ({
    enable(users) {
      dispatch(actions.enable(users))
    },
    disable(users) {
      // todo add confirm
      dispatch(actions.disable(users))
    },
    createWorkspace(user) {
      dispatch(actions.createWorkspace(user))
    },
    deleteWorkspace(user) {
      // todo add confirm
      dispatch(actions.deleteWorkspace(user))
    },
    updatePassword(user) {
      dispatch(
        modalActions.showModal(MODAL_USER_PASSWORD, {
          changePassword: (password) => dispatch(userActions.updatePassword(user, password))
        })
      )
    }
  })
)(UsersList)

export {
  Users
}
