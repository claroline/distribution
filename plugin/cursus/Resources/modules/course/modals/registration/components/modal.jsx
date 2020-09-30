import React, {Fragment} from 'react'
import {PropTypes as T} from 'prop-types'
import get from 'lodash/get'
import omit from 'lodash/omit'

import {trans} from '#/main/app/intl/translation'
import {AlertBlock} from '#/main/app/alert/components/alert-block'
import {Button} from '#/main/app/action/components/button'
import {CALLBACK_BUTTON, LINK_BUTTON} from '#/main/app/buttons'
import {Modal} from '#/main/app/overlays/modal/components/modal'
import {DetailsData} from '#/main/app/content/details/components/data'

import {Course as CourseTypes, Session as SessionTypes} from '#/plugin/cursus/prop-types'
import {route} from '#/plugin/cursus/routing'
import {getInfo} from '#/plugin/cursus/course/utils'

const RegistrationModal = props =>
  <Modal
    {...omit(props, 'course')}
    icon="fa fa-fw fa-user-plus"
    title={trans('registration')}
    subtitle={getInfo(props.course, props.session, 'name')}
    poster={getInfo(props.course, props.session, 'poster.url')}
  >
    {!props.session &&
      <div className="modal-body">
        <AlertBlock title={trans('no_available_session', {}, 'cursus')}>
          {trans('no_available_session_help', {}, 'cursus')}
        </AlertBlock>
      </div>
    }

    {props.session &&
      <Fragment>
        <DetailsData
          data={props.session}
          sections={[
            {
              title: trans('general'),
              primary: true,
              fields: [
                {
                  name: 'restrictions.dates',
                  type: 'date-range',
                  label: trans('date')
                }, {
                  name: 'description',
                  label: trans('description'),
                  type: 'html'
                }, {
                  name: 'location',
                  type: 'location',
                  label: trans('location'),
                  placeholder: trans('online_session', {}, 'cursus')
                }, {
                  name: 'available',
                  type: 'string',
                  label: trans('available_seats', {}, 'cursus'),
                  displayed: (session) => !!get(session, 'restrictions.users'),
                  calculated: (session) => (get(session, 'restrictions.users') - get(session, 'participants.learners')) + ' / ' + get(session, 'restrictions.users')
                }
              ]
            }
          ]}
        />

        <Button
          className="btn modal-btn"
          type={LINK_BUTTON}
          label={trans('show_other_sessions', {}, 'actions')}
          target={route(props.course, props.session)+'/sessions'}
          onClick={() => props.fadeModal()}
        />
      </Fragment>
    }

    <Button
      className="btn modal-btn"
      type={CALLBACK_BUTTON}
      primary={true}
      label={trans(!props.session ? 'register_waiting_list' : 'self-register', {}, 'actions')}
      callback={() => {
        props.fadeModal()
      }}
    />
  </Modal>

RegistrationModal.propTypes = {
  course: T.shape(
    CourseTypes.propTypes
  ).isRequired,
  session: T.shape(
    SessionTypes.propTypes
  ),

  // from modal
  fadeModal: T.func.isRequired
}

export {
  RegistrationModal
}
