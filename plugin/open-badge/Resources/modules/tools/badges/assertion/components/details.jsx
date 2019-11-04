import React, {Fragment} from 'react'
import {PropTypes as T} from 'prop-types'
import {connect} from 'react-redux'
import get from 'lodash/get'

// TODO : avoid hard dependency
import html2pdf from 'html2pdf.js'

import {trans} from '#/main/app/intl/translation'
import {Button} from '#/main/app/action/components/button'
import {CALLBACK_BUTTON, LINK_BUTTON, MODAL_BUTTON} from '#/main/app/buttons'
import {ListData} from '#/main/app/content/list/containers/data'
import {selectors as securitySelectors} from '#/main/app/security/store'
import {selectors as formSelectors} from '#/main/app/content/form/store'
import {selectors as toolSelectors} from '#/main/core/tool/store'

import {BadgeLayout}  from '#/plugin/open-badge/tools/badges/badge/components/layout'
import {actions} from '#/plugin/open-badge/tools/badges/assertion/store'
import {Assertion as AssertionTypes} from '#/plugin/open-badge/prop-types'
import {MODAL_BADGE_EVIDENCE} from '#/plugin/open-badge/tools/badges/assertion/modals/evidence'
import {selectors}  from '#/plugin/open-badge/tools/badges/store/selectors'

const AssertionDetailsComponent = (props) =>
  <BadgeLayout
    badge={get(props.assertion, 'badge')}
    assertion={props.assertion}

    backAction={{
      type: LINK_BUTTON,
      icon: 'fa fa-fw fa-arrow-left',
      label: trans('back'),
      tooltip: 'bottom',
      target: `${props.path}/badges/${get(props.assertion, 'badge.id')}`
    }}
    actions={[
      {
        type: CALLBACK_BUTTON,
        icon: 'fa fa-fw fa-download',
        label: trans('download', {}, 'actions'),
        displayed: get(props.assertion.badge, 'permissions.assign') || get(props.currentUser, 'id') === get(props.assertion, 'user.id'),
        callback: () => props.download(props.assertion)
      }
    ]}

    sections={[
      {
        name: 'evidence',
        label: trans('evidences', {}, 'badge'),
        render() {
          return (
            <Fragment>
              <ListData
                name={selectors.STORE_NAME + '.badges.assertion.evidences'}
                fetch={{
                  url: ['apiv2_assertion_evidences', {assertion: props.assertion.id}],
                  autoload: props.assertion.id && !props.new
                }}
                primaryAction={(row) => ({
                  type: MODAL_BUTTON,
                  modal: [MODAL_BADGE_EVIDENCE, {
                    evidence: row,
                    assertion: props.assertion
                  }]
                })}
                delete={{
                  url: ['apiv2_evidence_delete_bulk']
                }}
                definition={[
                  {
                    name: 'name',
                    type: 'string',
                    label: trans('name'),
                    displayed: true,
                    primary: true
                  }
                ]}
              />

              {get(props.assertion.badge, 'permissions.assign') &&
                <Button
                  className="btn btn-block btn-emphasis component-container"
                  type={MODAL_BUTTON}
                  label={trans('add_evidence', {}, 'badge')}
                  modal={[MODAL_BADGE_EVIDENCE, {
                    assertion: props.assertion
                  }]}
                  primary={true}
                />
              }
            </Fragment>
          )
        }
      }
    ]}
  />

AssertionDetailsComponent.propTypes = {
  path: T.string.isRequired,
  currentUser: T.shape({
    // TODO : user types
  }),
  assertion: T.shape(
    AssertionTypes.propTypes
  ),
  download: T.func.isRequired
}

const AssertionDetails = connect(
  (state) => ({
    path: toolSelectors.path(state),
    currentUser: securitySelectors.currentUser(state),
    assertion: formSelectors.data(formSelectors.form(state, selectors.STORE_NAME + '.badges.assertion'))
  }),
  (dispatch) => ({
    download(assertion) {
      dispatch(actions.download(assertion)).then(pdfContent => {
        html2pdf()
          .set({
            filename:    pdfContent.name,
            image:       { type: 'jpeg', quality: 1 },
            html2canvas: { scale: 4 },
            enableLinks: true
          })
          .from(pdfContent.content, 'string')
          .save()
      })
    }
  })
)(AssertionDetailsComponent)

export {
  AssertionDetails
}
