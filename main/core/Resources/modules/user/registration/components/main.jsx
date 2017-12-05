import React from 'react'
import {PropTypes as T} from 'prop-types'
import {connect} from 'react-redux'

import {t} from '#/main/core/translation'
import {generateUrl} from '#/main/core/fos-js-router'

import {PageContainer, PageHeader, PageContent} from '#/main/core/layout/page/index'
import {FormStepper} from '#/main/core/layout/form/components/form-stepper.jsx'
import {select as formSelect} from '#/main/core/data/form/selectors'

import {actions as modalActions} from '#/main/core/layout/modal/actions'
import {MODAL_CONFIRM} from '#/main/core/layout/modal'

import {Facet} from '#/main/core/user/registration/components/facet.jsx'
import {Required} from '#/main/core/user/registration/components/required.jsx'
import {Optional} from '#/main/core/user/registration/components/optional.jsx'

import {select} from '#/main/core/user/registration/selectors'
import {actions} from '#/main/core/user/registration/actions'

const RegistrationForm = props =>
  <PageContainer id="user-registration">
    <PageHeader
      title={t('user_registration')}
    />

    <FormStepper
      className="page-content"
      submit={{
        icon: 'fa fa-user-plus',
        label: t('registration_confirm'),
        action: () => props.register(props.user, props.termOfService)
      }}
      steps={[
        {
          path: '/account',
          title: 'Compte utilisateur',
          component: Required
        }, {
          path: '/options',
          title: 'Configuration',
          component: Optional
        }, {
          path: '/facet',
          title: 'Facet title',
          component: Facet
        }
      ]}
      redirect={[
        {from: '/', exact: true, to: '/account'}
      ]}
    />
  </PageContainer>

RegistrationForm.propTypes = {
  user: T.shape({
    // user type
  }).isRequired,
  termOfService: T.string,
  register: T.func.isRequired
}

const UserRegistration = connect(
  (state) => ({
    user: formSelect.data(formSelect.form(state, 'user')),
    termOfService: select.termOfService(state),
    options: select.options(state)
  }),
  (dispatch) => ({
    register(user, termOfService) {
      if (termOfService) {
        // show terms before create new account
        dispatch(modalActions.showModal(MODAL_CONFIRM, {
          icon: 'fa fa-fw fa-copyright',
          title: t('term_of_service'),
          question: termOfService,
          isHtml: true,
          confirmButtonText: t('accept_term_of_service'),
          handleConfirm: () => {
            // todo : set acceptedTerms flag
            dispatch(actions.createUser(user))
          }
        }))
      } else {
        // create new account
        dispatch(actions.createUser(user))
      }
    },
    onCreated() {
      /*if (this.props.options.redirectAfterLoginUrl) {
        window.location = this.props.options.redirectAfterLoginUrl
      }

      switch (this.props.options.redirectAfterLoginOption) {
        case 'DESKTOP': window.location = generateUrl('claro_desktop_open')
      }*/
    }
  })
)(RegistrationForm)

export {
  UserRegistration
}
