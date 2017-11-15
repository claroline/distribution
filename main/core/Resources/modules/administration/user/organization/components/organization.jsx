import React from 'react'
import {PropTypes as T} from 'prop-types'
import {connect} from 'react-redux'

import {t} from '#/main/core/translation'
import {generateUrl} from '#/main/core/fos-js-router'

import {PageGroupActions, PageActions, PageAction} from '#/main/core/layout/page/components/page-actions.jsx'
import {makeSaveAction} from '#/main/core/layout/form/containers/form-save.jsx'
import {FormContainer as Form} from '#/main/core/layout/form/containers/form.jsx'
import {FormSections, FormSection} from '#/main/core/layout/form/components/form-sections.jsx'
import {select as formSelect} from '#/main/core/layout/form/selectors'
import {DataListContainer as DataList} from '#/main/core/layout/list/containers/data-list.jsx'

import {GroupList} from '#/main/core/administration/user/group/components/group-list.jsx'
import {UserList} from '#/main/core/administration/user/user/components/user-list.jsx'
import {WorkspaceList} from '#/main/core/administration/workspace/components/workspace-list.jsx'

const OrganizationSaveAction = makeSaveAction('organizations.current', formData => ({
  create: ['apiv2_organization_create'],
  update: ['apiv2_organization_update', {id: formData.id}]
}))(PageAction)

const OrganizationActions = props =>
  <PageActions>
    <PageGroupActions>
      <PageAction
        id="organization-delete"
        icon="fa fa-trash-o"
        title={t('delete')}
        action={() => true}
        dangerous={true}
      />
    </PageGroupActions>

    <PageGroupActions>
      <OrganizationSaveAction />

      <PageAction
        id="organization-list"
        icon="fa fa-list"
        title={t('back_to_list')}
        action="#/organizations"
      />
    </PageGroupActions>
  </PageActions>

const OrganizationForm = props =>
  <Form
    level={3}
    name="organizations.current"
    sections={[
      {
        id: 'general',
        title: t('general'),
        primary: true,
        fields: [
          {
            name: 'name',
            type: 'string',
            label: t('name')
          }, {
            name: 'code',
            type: 'string',
            label: t('code')
          }, {
            name: 'email',
            type: 'email',
            label: t('email')
          }, {
            name: 'managers',
            type: 'users',
            label: t('managers')
          }
        ]
      }, {
        id: 'position',
        title: t('position'),
        fields: [
          {
            name: 'meta.parent',
            type: 'organization',
            label: t('parent')
          }, {
            name: 'meta.position',
            type: 'number',
            label: t('position')
          }
        ]
      }
    ]}
  >
    <FormSections
      level={3}
    >
      <FormSection
        id="organization-users"
        icon="fa fa-fw fa-user"
        title={t('users')}
        actions={[
          {
            icon: 'fa fa-fw fa-plus',
            label: t('add_user'),
            action: () => true
          }
        ]}
      >
        <DataList
          name="organizations.current.users"
          fetch={{
            url: generateUrl('apiv2_organization_list_users', {id: props.organization.id}),
            autoload: true
          }}
          delete={{
            url: generateUrl('apiv2_organization_remove_users', {id: props.organization.id}),
          }}
          actions={[]}
          definition={UserList.definition}
          card={UserList.card}
        />
      </FormSection>

      <FormSection
        id="organization-groups"
        icon="fa fa-fw fa-id-badge"
        title={t('groups')}
        actions={[
          {
            icon: 'fa fa-fw fa-plus',
            label: t('add_group'),
            action: () => true
          }
        ]}
      >
        <DataList
          name="organizations.current.groups"
          fetch={{
            url: generateUrl('apiv2_organization_list_groups', {id: props.organization.id}),
            autoload: true
          }}
          delete={{
            url: generateUrl('apiv2_organization_remove_groups', {id: props.organization.id}),
          }}
          actions={[]}
          definition={GroupList.definition}
          card={GroupList.card}
        />
      </FormSection>

      <FormSection
        id="organization-workspaces"
        icon="fa fa-fw fa-book"
        title={t('workspaces')}
        actions={[
          {
            icon: 'fa fa-fw fa-plus',
            label: t('add_workspace'),
            action: () => true
          }
        ]}
      >
        <DataList
          name="organizations.current.workspaces"
          fetch={{
            url: generateUrl('apiv2_organization_list_workspaces', {id: props.organization.id}),
            autoload: true
          }}
          delete={{
            url: generateUrl('apiv2_organization_remove_workspaces', {id: props.organization.id}),
          }}
          actions={[]}
          definition={WorkspaceList.definition}
          card={WorkspaceList.card}
        />
      </FormSection>
    </FormSections>
  </Form>

OrganizationForm.propTypes = {
  organization: T.shape({
    id: T.string
  }).isRequired
}

const Organization = connect(
  state => ({
    organization: formSelect.data(formSelect.form(state, 'organizations.current'))
  }),
  dispatch => ({})
)(OrganizationForm)

export {
  OrganizationActions,
  Organization
}
