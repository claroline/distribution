import React, {Component} from 'react'
import {PropTypes as T} from 'prop-types'
import Modal from 'react-bootstrap/lib/Modal'
import {BaseModal} from '#/main/core/layout/modal/components/base.jsx'
import {tex} from '#/main/core/translation'
import {FormGroup} from '#/main/core/layout/form/components/form-group.jsx'

export const MODAL_DUPLICATE_QUESTION = 'MODAL_DUPLICATE_QUESTION'

class DuplicateQuestionModal extends Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  handleChange(value) {
    this.setState({value})
  }

  duplicate() {
    this.props.handleSubmit(this.state.value, this.props.itemId, this.props.stepId)
    this.props.fadeModal()
  }

  render() {
    return (
      <BaseModal {...this.props}>
        <Modal.Body>
          <FormGroup
            controlId={`item-${this.props.itemId}-duplicate`}
            label={tex('amount')}
          >
            <input
              id={`item-${this.props.itemId}-duplicate`}
              type="number"
              min="1"
              value="1"
              className="form-control"
              onChange={e => this.handleChange(parseInt(e.target.value))}
            />
          </FormGroup>
        </Modal.Body>
        <button
          className="modal-btn btn btn-primary"
          onClick={() => this.duplicate()}
        >
          {tex('duplicate')}
        </button>
      </BaseModal>
    )
  }
}

DuplicateQuestionModal.propTypes = {
  handleSubmit: T.func.isRequired,
  itemId: T.string.isRequired,
  stepId: T.string.isRequired,
  fadeModal: T.func.isRequired
}

export {DuplicateQuestionModal}
