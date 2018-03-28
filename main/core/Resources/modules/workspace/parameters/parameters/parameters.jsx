import React from 'react'
import {PropTypes as T} from 'prop-types'
import {connect} from 'react-redux'

import get from 'lodash/get'

import {trans} from '#/main/core/translation'

import {FormContainer} from '#/main/core/data/form/containers/form.jsx'
import {select as formSelect} from '#/main/core/data/form/selectors'
import {actions as formActions} from '#/main/core/data/form/actions'

import {PageActions} from '#/main/core/layout/page/components/page-actions.jsx'
import {FormPageActionsContainer} from '#/main/core/data/form/containers/page-actions.jsx'


const Actions = () =>
  <PageActions>
    <FormPageActionsContainer
      formName="parameters"
      target={(workspace) => ['apiv2_workspace_update', {id: workspace.id}]}
      opened={true}
      cancel={{

      }}
    />
  </PageActions>

Actions.propTypes = {
  location: T.shape({
    pathname: T.string
  }).isRequired
}

const Parameters = (props) => {
  const roleEnum = {}
  props.workspace.roles.forEach(role => {
    roleEnum[role.id] = trans(role.translationKey)
  })

  return (
    <div>
      <FormContainer
        level={3}
        name="parameters"
        sections={[
          {
            id: 'general',
            title: trans('general'),
            primary: true,
            fields: [
              {
                name: 'name',
                type: 'string',
                label: trans('name'),
                required: true
              },
              {
                name: 'code',
                type: 'string',
                label: trans('code'),
                required: true
              },
              {
                name: 'meta.created',
                type: 'date',
                label: trans('created'),
                required: true,
                readOnly: true
              },
              {
                name: 'meta.creator.username',
                type: 'string',
                label: trans('creator'),
                required: true,
                readOnly: true
              },
              {
                name: 'meta.description',
                type: 'html',
                label: trans('description'),
                required: false
              },
              {
                name: 'thumbnail',
                type: 'image',
                label: trans('image')
              },
              {
                name: 'notifications',
                type: 'boolean',
                label: trans('notifications')
              },
              {
                name: 'meta.usedStorage',
                type: 'string',
                label: trans('used_storage'),
                readOnly: true
              },
              {
                name: 'meta.totalUsers',
                type: 'number',
                readOnly: true,
                label: trans('total_users')
              },
              {
                name: 'meta.totalResources',
                type: 'number',
                readOnly: true,
                label: trans('total_resources')
              }
            ]
          },
          {
            id: 'registration',
            title: trans('registration'),
            primary: true,
            fields: [
              {
                name: 'registration.validation',
                type: 'boolean',
                label: trans('registration_validation')
              },
              {
                name: 'registration.selfRegistration',
                type: 'boolean',
                label: trans('public_registration')
              },
              {
                name: 'registration.selfUnregistration',
                type: 'boolean',
                label: trans('public_unregistration')
              },
              {
                name: 'registration.defaultRole',
                type: 'enum',
                options: {
                  choices: roleEnum
                },
                onChange: (roleId) => props.updateProp(
                  'registration.defaultRole',
                  props.workspace.roles.find(role => role.id === roleId)
                ),
                calculated: get(props.workspace, 'defaultRole.id', null)
              },
            ]
          },
          {
            id: 'display',
            title: trans('display'),
            fields: [
              {
                name: 'display.displayable',
                type: 'boolean',
                label: trans('displayable_in_workspace_list')
              }
            ]
          },
          {
            id: 'restrictions',
            title: trans('restrictions'),
            fields: [
              {
                name: 'restrictions.accessibleFrom',
                type: 'date',
                label: trans('accessibleFrom')
              },
              {
                name: 'restrictions.accessibleUntil',
                type: 'date',
                label: trans('accessibleUntil')
              },
              {
                name: 'restrictions.maxStorage',
                type: 'string',
                label: trans('max_storage')
              },
              {
                name: 'restrictions.maxUsers',
                type: 'integer',
                label: trans('maxUsers')
              },
              {
                name: 'restrictions.maxResources',
                type: 'integer',
                label: trans('maxResources')
              },
              {
                name: 'restrictions.hidden',
                type: 'boolean',
                label: trans('hidden')
              }
            ]
          }
        ]}
      />
    </div>
  )
}

Parameters.propTypes = {
  workspace: T.shape({
  }).isRequired
}

const ConnectedParameters = connect(
  state => ({
    workspace: formSelect.data(formSelect.form(state, 'parameters'))
  }),
  dispatch => ({
    updateProp(propName, propValue) {
      dispatch(formActions.updateProp('parameters', propName, propValue))
    }
  })
)(Parameters)

export {
  ConnectedParameters as ParametersTab,
  Actions as ParametersActions
}
