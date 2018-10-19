import React from 'react'
import {PropTypes as T} from 'prop-types'
import {connect} from 'react-redux'

import {trans} from '#/main/app/intl/translation'
import {Routes} from '#/main/app/router'
import {ResourcePage} from '#/main/core/resource/containers/page'
import {CALLBACK_BUTTON, LINK_BUTTON} from '#/main/app/buttons'

import {actions} from '../actions'
import {BBBContent} from './bbb-content.jsx'
import {BBBConfig} from './bbb-config.jsx'

const BBBResource = props =>
  <ResourcePage
    editor={{
      path: '/edit',
      save: {
        disabled: false,
        action: props.validateForm
      }
    }}
    customActions={customActions(props)}
  >
    <Routes
      routes={[
        {
          path: '/',
          exact: true,
          component: BBBContent
        }, {
          path: '/edit',
          component: BBBConfig
        }
      ]}
    />
  </ResourcePage>

BBBResource.propTypes = {
  location: T.shape({
    pathname: T.string.isRequired
  }).isRequired,
  validateForm: T.func,
  endBBB: T.func
}

function customActions(props) {
  const actions = []

  actions.push({
    type: LINK_BUTTON,
    icon: 'fa fa-fw fa-home',
    label: trans('claroline_big_blue_button', {}, 'resource'),
    target: '/'
  })

  if (props.canEdit) {
    actions.push({
      type: CALLBACK_BUTTON,
      icon: 'fa fa-fw fa-stop-circle',
      label: trans('bbb_end', {}, 'bbb'),
      callback: props.endBBB
    })
  }

  return actions
}

const ConnectedBBBResource = connect(
  state => ({
    canEdit: state.canEdit
  }),
  dispatch => ({
    validateForm: () => dispatch(actions.validateResourceForm()),
    endBBB: () => dispatch(actions.endBBB())
  })
)(BBBResource)

export {
  ConnectedBBBResource as BBBResource
}
