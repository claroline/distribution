import React from 'react'
import {PropTypes as T} from 'prop-types'
import get from 'lodash/get'

import {trans} from '#/main/app/intl/translation'
import {Routes} from '#/main/app/router'
import {ResourcePage} from '#/main/core/resource/containers/page'
import {LINK_BUTTON} from '#/main/app/buttons'

import {constants} from '#/plugin/drop-zone/resources/dropzone/constants'

import {Overview} from '#/plugin/drop-zone/resources/dropzone/overview/components/overview'
import {Editor} from '#/plugin/drop-zone/resources/dropzone/editor/components/editor'
import {MyDrop} from '#/plugin/drop-zone/resources/dropzone/player/components/my-drop'
import {Drops} from '#/plugin/drop-zone/resources/dropzone/correction/components/drops'
import {Correctors} from '#/plugin/drop-zone/resources/dropzone/correction/components/correctors'
import {Corrector} from '#/plugin/drop-zone/resources/dropzone/correction/components/corrector'
import {Drop} from '#/plugin/drop-zone/resources/dropzone/correction/components/drop'
import {PeerDrop} from '#/plugin/drop-zone/resources/dropzone/player/components/peer-drop'
import {MyRevisions} from '#/plugin/drop-zone/resources/dropzone/player/components/my-revisions'
import {Revisions} from '#/plugin/drop-zone/resources/dropzone/player/components/revisions'
import {Revision} from '#/plugin/drop-zone/resources/dropzone/player/components/revision'

const DropzoneResource = props =>
  <ResourcePage
    customActions={[
      {
        type: LINK_BUTTON,
        icon: 'fa fa-fw fa-home',
        label: trans('show_overview'),
        target: props.path,
        exact: true
      }, {
        type: LINK_BUTTON,
        icon: 'fa fa-fw fa-upload',
        label: trans('show_evaluation', {}, 'dropzone'),
        target: `${props.path}/my/drop`,
        displayed: !!props.myDrop,
        exact: true
      }, {
        type: LINK_BUTTON,
        icon: 'fa fa-fw fa-list',
        label: trans('show_drops', {}, 'dropzone'),
        target: `${props.path}/drops`,
        displayed: props.canEdit
      }, {
        type: LINK_BUTTON,
        icon: 'fa fa-fw fa-users',
        label: trans('correctors', {}, 'dropzone'),
        target: `${props.path}/correctors`,
        displayed: props.canEdit && constants.REVIEW_TYPE_PEER === get(props.dropzone, 'parameters.reviewType')
      }, {
        type: LINK_BUTTON,
        icon: 'fa fa-fw fa-history',
        label: trans('show_revisions', {}, 'dropzone'),
        target: `${props.path}/revisions`,
        displayed: props.canEdit,
        exact: true
      }
    ]}
  >
    <Routes
      path={props.path}
      routes={[
        {
          path: '/',
          render: () => <Overview path={props.path} />,
          exact: true
        }, {
          path: '/edit',
          render: () => <Editor path={props.path} />,
          disabled: !props.canEdit,
          onLeave: () => props.resetForm(),
          onEnter: () => props.resetForm(props.dropzone)
        }, {
          path: '/my/drop',
          render: () => <MyDrop path={props.path} />,
          exact: true,
          onEnter: () => {
            if (props.currentRevisionId) {
              props.fetchRevision(props.currentRevisionId)
            }
          },
          onLeave: () => props.resetRevision()
        }, {
          path: '/drops',
          render: () => <Drops path={props.path} />
        }, {
          path: '/drop/:id',
          render: () => <Drop path={props.path} />,
          onEnter: (params) => props.fetchDrop(params.id, 'current'),
          onLeave: () => props.resetCurrentDrop()
        }, {
          path: '/peer/drop',
          render: () => <PeerDrop path={props.path} />,
          onEnter: () => props.fetchPeerDrop()
        }, {
          path: '/correctors',
          render: () => <Correctors path={props.path} />,
          onEnter: () => {
            props.fetchCorrections(props.dropzone.id)
          }
        }, {
          path: '/corrector/:id',
          component: Corrector,
          onEnter: (params) => {
            props.fetchDrop(params.id, 'corrector')
            props.fetchCorrections(props.dropzone.id)
          },
          onLeave: () => props.resetCorrectorDrop()
        }, {
          path: '/my/drop/revisions',
          render: () => <MyRevisions path={props.path} />,
          disabled: !props.dropzone || !props.dropzone.parameters || !props.dropzone.parameters.revisionEnabled,
          exact: true
        }, {
          path: '/my/drop/revisions/:id',
          render: () => <Revision path={props.path} />,
          disabled: !props.dropzone || !props.dropzone.parameters || !props.dropzone.parameters.revisionEnabled,
          onEnter: (params) => {
            props.fetchRevision(params.id)
            props.fetchDropFromRevision(params.id)
          },
          onLeave: () => {
            props.resetRevision()
            props.resetCurrentDrop()
          }
        }, {
          path: '/revisions',
          render: () => <Revisions path={props.path} />,
          disabled: !props.canEdit,
          exact: true
        }, {
          path: '/revisions/:id',
          render: () => <Revision path={props.path} />,
          disabled: !props.canEdit,
          onEnter: (params) => {
            props.fetchRevision(params.id)
            props.fetchDropFromRevision(params.id)
          },
          onLeave: () => {
            props.resetRevision()
            props.resetCurrentDrop()
          }
        }
      ]}
    />
  </ResourcePage>

DropzoneResource.propTypes = {
  path: T.string.isRequired,
  canEdit: T.bool.isRequired,
  dropzone: T.object.isRequired,
  myDrop: T.object,
  currentRevisionId: T.string,

  resetForm: T.func.isRequired,
  fetchDrop: T.func.isRequired,
  resetCurrentDrop: T.func.isRequired,
  fetchCorrections: T.func.isRequired,
  resetCorrectorDrop: T.func.isRequired,
  fetchPeerDrop: T.func.isRequired,
  fetchRevision: T.func.isRequired,
  fetchDropFromRevision: T.func.isRequired,
  resetRevision: T.func.isRequired
}

export {
  DropzoneResource
}
