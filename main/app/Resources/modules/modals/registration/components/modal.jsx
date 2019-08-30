import React from 'react'
import {PropTypes as T} from 'prop-types'
import omit from 'lodash/omit'

import {Router} from '#/main/app/router'
import {trans} from '#/main/app/intl/translation'
import {Modal} from '#/main/app/overlays/modal/components/modal'

import {RegistrationMain} from '#/main/app/security/registration/containers/main'

const RegistrationModal = props =>
  <Modal
    {...omit(props, 'fadeModal', 'hideModal', 'onRegister')}
    title={trans('registration')}
    bsSize="lg"
    onHide={props.fadeModal}
  >
    <div className="modal-body">
      <Router embedded={true}>
        <RegistrationMain
          path="/"
          onRegister={(user) => {
            if (props.onRegister) {
              props.onRegister(user)
            }

            props.fadeModal()
          }}
        />
      </Router>
    </div>
  </Modal>

RegistrationModal.propTypes = {
  onRegister: T.func,
  fadeModal: T.func.isRequired
}

export {
  RegistrationModal
}
