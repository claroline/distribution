import React from 'react'
import {PropTypes as T} from 'prop-types'
import {connect} from 'react-redux'
import omit from 'lodash/omit'

import {trans} from '#/main/core/translation'
import {Button} from '#/main/app/action/components/button'
import {Modal} from '#/main/app/overlay/modal/components/modal'

import {actions, selectors} from '#/main/core/resource/modals/creation/store'
import {ResourceNode as ResourceNodeTypes} from '#/main/core/resource/prop-types'
import {ResourceRights} from '#/main/core/resource/components/rights'

const RightsModalComponent = props =>
  <Modal
    {...omit(props, 'parent', 'saveEnabled', 'save', 'configure', 'updateRights')}
    icon="fa fa-fw fa-plus"
    title={trans('new_resource', {}, 'resource')}
    subtitle="2. Configurer les droits"
  >
    <ResourceRights
      resourceNode={props.parent}
      updateRights={props.updateRights}
    />

    <Button
      className="modal-btn btn-link"
      type="callback"
      label={trans('configure', {}, 'actions')}
      disabled={!props.saveEnabled}
      callback={() => {
        props.configure()
      }}
    />

    <Button
      className="modal-btn btn"
      type="callback"
      primary={true}
      label={trans('create', {}, 'actions')}
      disabled={!props.saveEnabled}
      callback={() => {
        props.save(props.parent)
        props.fadeModal()
      }}
    />
  </Modal>

RightsModalComponent.propTypes = {
  parent: T.shape(
    ResourceNodeTypes.propTypes
  ).isRequired,
  saveEnabled: T.bool.isRequired,
  save: T.func.isRequired,
  updateRights: T.func.isRequired,
  configure: T.func.isRequired,
  fadeModal: T.func.isRequired
}

const RightsModal = connect(
  (state) => ({
    parent: selectors.parent(state),
    saveEnabled: selectors.saveEnabled(state)
  }),
  (dispatch) => ({
    updateRights() {

    },
    save(parent) {
      dispatch(actions.create(parent))
    },
    configure() {

    }
  })
)(RightsModalComponent)

export {
  RightsModal
}
