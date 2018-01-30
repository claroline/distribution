import React from 'react'
import {connect} from 'react-redux'
import {PropTypes as T} from 'prop-types'

import {trans} from '#/main/core/translation'
import {displayDate} from '#/main/core/scaffolding/date'
import {actions as modalActions} from '#/main/core/layout/modal/actions'
import {MODAL_GENERIC_TYPE_PICKER} from '#/main/core/layout/modal'
import {HtmlText} from '#/main/core/layout/components/html-text.jsx'

import {ResourceOverview} from '#/main/core/resource/components/overview.jsx'

import {constants} from '#/plugin/drop-zone/resources/dropzone/constants'
import {select} from '#/plugin/drop-zone/resources/dropzone/selectors'
import {computeDropCompletion} from '#/plugin/drop-zone/resources/dropzone/utils'
import {actions} from '#/plugin/drop-zone/resources/dropzone/player/actions'
import {DropzoneType, DropType} from '#/plugin/drop-zone/resources/dropzone/prop-types'

import {Parameters} from '#/plugin/drop-zone/resources/dropzone/overview/components/parameters.jsx'
import {Timeline} from '#/plugin/drop-zone/resources/dropzone/overview/components/timeline.jsx'

const OverviewComponent = props =>
  <ResourceOverview
    contentText={props.dropzone.instruction ||
      <span className="empty-text">{trans('no_instruction', {}, 'dropzone')}</span>
    }
    progression={{
      status: 'opened',
      statusTexts: {
        opened: 'Vous n\'avez jamais soumis de travaux.'
      },
      score: {
        displayed: props.dropzone.display.showScore,
        current: props.myDrop ? props.myDrop.score : null,
        total: props.dropzone.parameters.scoreMax
      },
      feedback: {
        displayed: props.dropzone.display.showFeedback,
        success: props.dropzone.display.successMessage,
        failure: props.dropzone.display.failMessage
      },
      details: [
        [
          trans('drop_date', {}, 'dropzone'),
          props.myDrop && props.myDrop.dropDate ?
            displayDate(props.myDrop.dropDate, false, true) :
            trans('not_submitted', {}, 'dropzone')
        ], [
          'Nbre de corrections reçus',
          `${props.myDrop ? props.myDrop.corrections.length : '0'}/4`
        ], [
          'Nbre de corrections faîtes',
          '2/4'
        ]
      ]
    }}
    actions={[
      {
        icon: 'fa fa-fw fa-upload icon-with-text-right',
        label: trans('submit_my_copy', {}, 'dropzone'),
        action: '#/drop',
        primary: !props.myDrop || !props.myDrop.finished,
        disabled: !props.dropEnabled,
        disabledMessages: props.dropDisabledMessages
      }, {
        icon: 'fa fa-fw fa-check-square-o icon-with-text-right',
        label: trans('correct_a_copy', {}, 'dropzone'),
        action: '#/review',
        primary: props.myDrop && props.myDrop.finished,
        disabled: !props.peerReviewEnabled,
        disabledMessages: props.peerReviewDisabledMessages
      }
    ]}
  >
    <section className="resource-parameters">
      <h3 className="h2">{trans('evaluation_configuration', {}, 'dropzone')}</h3>

      <Parameters
        dropType={props.dropzone.parameters.dropType}
        reviewType={props.dropzone.parameters.reviewType}
      />

      <Timeline
        state={props.currentState}
        planning={props.dropzone.planning}
        reviewType={props.dropzone.parameters.reviewType}
      />
    </section>

    {props.errorMessage &&
    <div className="alert alert-danger">
      {props.errorMessage}
    </div>
    }

    {false && !props.myDrop &&
    !props.errorMessage &&
    props.dropEnabled &&
    <button
      className="btn btn-primary"
      type="button"
      onClick={() => props.startDrop(props.dropzone.parameters.dropType, props.teams)}
    >
      {trans('start_evaluation', {}, 'dropzone')}
    </button>
    }

    {props.myDrop &&
      <div className="btn-group btn-group-justified">
        <a
          href="#/my/drop"
          className="btn btn-default"
        >
          {!props.myDrop.finished && [constants.STATE_ALLOW_DROP, constants.STATE_ALLOW_DROP_AND_PEER_REVIEW].indexOf(props.currentState) > -1 ?
            <span>
              <span className="fa fa-fw fa-pencil dropzone-button-icon"/>
              {trans('complete_my_copy', {}, 'dropzone')}
              </span> :
            <span>
            <span className="fa fa-fw fa-eye dropzone-button-icon"/>
              {trans('see_my_copy', {}, 'dropzone')}
            </span>
          }
        </a>

        {props.myDrop.finished && props.peerReviewEnabled && props.nbCorrections < props.dropzone.parameters.expectedCorrectionTotal &&
          <a
            href="#/peer/drop"
            className="btn btn-default"
          >
            <span className="fa fa-fw fa-edit dropzone-button-icon"/>
            {trans('correct_a_copy', {}, 'dropzone')}
          </a>
        }
      </div>
    }
  </ResourceOverview>

OverviewComponent.propTypes = {
  user: T.object,
  dropzone: T.shape(DropzoneType.propTypes).isRequired,
  myDrop: T.shape(DropType.propTypes),
  dropEnabled: T.bool.isRequired,
  dropDisabledMessages: T.arrayOf(T.string).isRequired,
  peerReviewEnabled: T.bool.isRequired,
  peerReviewDisabledMessages: T.arrayOf(T.string).isRequired,
  nbCorrections: T.number.isRequired,
  currentState: T.oneOf(
    Object.keys(constants.PLANNING_STATES.all)
  ).isRequired,
  userEvaluation: T.shape({
    status: T.string.isRequired
  }),
  errorMessage: T.string,
  teams: T.arrayOf(T.shape({
    id: T.number.isRequired,
    name: T.string.isRequired
  })),
  startDrop: T.func.isRequired
}

OverviewComponent.defaultProps = {
  myDrop: {}
}

const Overview = connect(
  (state) => ({
    user: select.user(state),
    dropzone: select.dropzone(state),
    myDrop: select.myDrop(state),
    dropEnabled: select.isDropEnabled(state),
    dropDisabledMessages: select.dropDisabledMessages(state),
    peerReviewEnabled: select.isPeerReviewEnabled(state),
    peerReviewDisabledMessages: select.peerReviewDisabledMessages(state),
    nbCorrections: select.nbCorrections(state),
    currentState: select.currentState(state),
    userEvaluation: select.userEvaluation(state),
    errorMessage: select.errorMessage(state),
    teams: select.teams(state)
  }),
  (dispatch) => ({
    startDrop(dropType, teams = []) {
      switch (dropType) {
        case constants.DROP_TYPE_USER :
          dispatch(actions.initializeMyDrop())
          break
        case constants.DROP_TYPE_TEAM :
          if (teams.length === 1) {
            dispatch(actions.initializeMyDrop(teams[0].id))
          } else {
            dispatch(
              modalActions.showModal(MODAL_GENERIC_TYPE_PICKER, {
                title: trans('team_selection_title', {}, 'dropzone'),
                types: teams.map(t => ({
                  type: t.id,
                  name: t.name,
                  icon: 'fa fa-users'
                })),
                handleSelect: (type) => dispatch(actions.initializeMyDrop(type.type))
              })
            )
          }
          break
      }
    }
  })
)(OverviewComponent)

export {
  Overview
}
