import React from 'react'

const T = React.PropTypes

const PreviousButton = props =>
  <button className="btn btn-previous btn-default" onClick={props.onClick}>
    <span className="fa fa-fw fa-angle-double-left"></span>
    Previous
  </button>

PreviousButton.propTypes = {
  onClick: T.func.isRequired
}

const NextButton = props =>
  <button className="btn btn-next btn-default" onClick={props.onClick}>
    Next
    <span className="fa fa-fw fa-angle-double-right"></span>
  </button>

NextButton.propTypes = {
  onClick: T.func.isRequired
}

const ValidateButton = props =>
  <button className="btn btn-next btn-validate btn-default" onClick={props.onClick}>
    Validate
    <span className="fa fa-fw fa-angle-double-right"></span>
  </button>

ValidateButton.propTypes = {
  onClick: T.func.isRequired
}

const SubmitButton = props =>
  <button className="btn btn-submit btn-success" onClick={props.onClick}>
    <span className="fa fa-fw fa-check"></span>
    Validate
  </button>

SubmitButton.propTypes = {
  onClick: T.func.isRequired
}

const FinishButton = props =>
  <button className="btn btn-finish btn-primary" onClick={props.onClick}>
    <span className="fa fa-fw fa-sign-out"></span>
    Finish
  </button>

FinishButton.propTypes = {
  onClick: T.func.isRequired
}

const ForwardButton = props =>
  (props.next) ?
    <NotLastQuestionButton
      openFeedbackAndValidate={props.openFeedbackAndValidate}
      navigateToAndValidate={props.navigateToAndValidate}
      step={props.step}
      next={props.next}
      currentStepSend={props.currentStepSend}
      feedbackEnabled={props.feedbackEnabled}
      showFeedback={props.showFeedback}
    />:
    //no next section
    <LastQuestionButton
      openFeedbackAndValidate={props.openFeedbackAndValidate}
      finish={props.finish}
      currentStepSend={props.currentStepSend}
      feedbackEnabled={props.feedbackEnabled}
      showFeedback={props.showFeedback}
      step={props.step}
    />

ForwardButton.propTypes = {
  next: T.shape({
    id: T.string.isRequired,
    items: T.arrayOf(T.string).isRequired
  }),
  step: T.shape({
    id: T.string.isRequired,
    items: T.arrayOf(T.string).isRequired
  }).isRequired,
  navigateToAndValidate: T.func.isRequired,
  finish: T.func.isRequired,
  openFeedbackAndValidate: T.func.isRequired,
  showFeedback: T.bool.isRequired,
  feedbackEnabled: T.bool.isRequired,
  currentStepSend: T.bool.isRequired
}

const LastQuestionButton = props =>
  (props.showFeedback) ?
    (props.currentStepSend) ?
      (!props.feedbackEnabled) ?
        <ValidateButton onClick={() => props.openFeedbackAndValidate(props.step)} /> :
        <NextButton onClick={() => props.openFeedbackAndValidate(props.step)} /> :
      <FinishButton onClick={props.finish}/> :
    <FinishButton onClick={props.finish}/>

LastQuestionButton.propTypes = {
  step: T.shape({
    id: T.string.isRequired,
    items: T.arrayOf(T.string).isRequired
  }).isRequired,
  finish: T.func.isRequired,
  openFeedbackAndValidate: T.func.isRequired,
  showFeedback: T.bool.isRequired,
  feedbackEnabled: T.bool.isRequired,
  currentStepSend: T.bool.isRequired
}

const NotLastQuestionButton = props =>
  (props.currentStepSend) ?
    (props.showFeedback) ?
      (!props.feedbackEnabled) ?
        <ValidateButton onClick={() => props.openFeedbackAndValidate(props.step)} /> :
        <NextButton onClick={() => props.navigateToAndValidate(props.next)} /> :
      <ValidateButton onClick={() => props.navigateToAndValidate(props.next)} /> :
    <NextButton onClick={() => props.navigateToAndValidate(props.next)} />

NotLastQuestionButton.propTypes = {
  step: T.shape({
    id: T.string.isRequired,
    items: T.arrayOf(T.string).isRequired
  }).isRequired,
  next: T.shape({
    id: T.string.isRequired,
    items: T.arrayOf(T.string).isRequired
  }),
  openFeedbackAndValidate: T.func.isRequired,
  navigateToAndValidate: T.func.navigateToAndValidate,
  showFeedback: T.bool.isRequired,
  feedbackEnabled: T.bool.isRequired,
  currentStepSend: T.bool.isRequired
}

const PlayerNav = props =>
  <nav className="player-nav">
    <div className="backward">
      {(props.previous) &&
        <PreviousButton onClick={() => props.navigateTo(props.previous)} />
      }
    </div>

    <div className="forward">
      <ForwardButton
        openFeedbackAndValidate={props.openFeedbackAndValidate}
        navigateToAndValidate={props.navigateToAndValidate}
        finish={props.finish}
        step={props.step}
        next={props.next}
        currentStepSend={props.currentStepSend}
        feedbackEnabled={props.feedbackEnabled}
        showFeedback={props.showFeedback}
      />
    </div>
  </nav>

PlayerNav.propTypes = {
  next: T.shape({
    id: T.string.isRequired,
    items: T.arrayOf(T.string).isRequired
  }),
  previous: T.shape({
    id: T.string.isRequired,
    items: T.arrayOf(T.string).isRequired
  }),
  step: T.shape({
    id: T.string.isRequired,
    items: T.arrayOf(T.string).isRequired
  }).isRequired,
  navigateToAndValidate: T.func.isRequired,
  navigateTo: T.func.isRequired,
  finish: T.func.isRequired,
  openFeedbackAndValidate: T.func.isRequired,
  submit: T.func.isRequired,
  showFeedback: T.bool.isRequired,
  feedbackEnabled: T.bool.isRequired,
  currentStepSend: T.bool.isRequired
}

PlayerNav.defaultProps = {
  previous: null,
  next: null
}

export {PlayerNav}
