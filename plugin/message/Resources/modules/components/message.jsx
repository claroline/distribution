import React from 'react'
import {connect} from 'react-redux'
import {PropTypes as T} from 'prop-types'
import get from 'lodash/get'

import {trans} from '#/main/core/translation'
import {UserMessage} from '#/main/core/user/message/components/user-message'
import {MODAL_CONFIRM} from '#/main/app/modals/confirm'
import {actions as modalActions} from '#/main/app/overlay/modal/store'

import {NewMessage} from '#/plugin/message/components/new-message'
import {selectors} from '#/plugin/message/selectors'
import {actions} from '#/plugin/message/actions'


const MessageComponent = (props) =>
  <div>
    <UserMessage
      user={get(props.message, 'from')}
      date={get(props.message, 'meta.date')}
      content={props.message.content}
      object={props.message.object}
      allowHtml={true}
      actions={[
        {
          icon: 'fa fa-fw fa-sync-alt',
          label: trans('restore'),
          displayed: get(props.message, 'meta.removed'),
          action: () => props.restoreMessage([props.message])
        }, {
          icon: 'fa fa-fw fa-trash-o',
          label: trans('delete'),
          action: () => props.removeMessage([props.message]),
          dangerous: true,
          displayed: true
        }
      ]}
    />
    {!get(props.message, 'meta.sent') && !get(props.message, 'meta.removed') &&
      <NewMessage/>
    }
  </div>

MessageComponent.propTypes = {
  message: T.shape({})
}

MessageComponent.defaultProps = {
  message: {
    content: '',
    meta : {
      removed: true,
      sent: true
    }
  }
}
const Message = connect(
  state => ({
    message: selectors.message(state)
  }),
  dispatch => ({
    removeMessage(message) {
      dispatch(
        modalActions.showModal(MODAL_CONFIRM, {
          title: trans('messages_delete_title'),
          question: trans('messages_confirm_permanent_delete'),
          dangerous: true,
          handleConfirm: () => dispatch(actions.removeMessages(message))
        })
      )
    },
    restoreMessage(message) {
      dispatch(
        modalActions.showModal(MODAL_CONFIRM, {
          title: trans('messages_restore_title'),
          question: trans('messages_confirm_restore'),
          handleConfirm: () => dispatch(actions.restoreMessages(message))
        })
      )
    }
  })
)(MessageComponent)
export {
  Message
}
