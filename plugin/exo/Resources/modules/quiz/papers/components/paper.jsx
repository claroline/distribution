import React from 'react'
import {PropTypes as T} from 'prop-types'
import {connect} from 'react-redux'
import Panel from 'react-bootstrap/lib/Panel'

import {tex} from '#/main/core/translation'
import {getDefinition, isQuestionType} from './../../../items/item-types'
import {select as resourceSelect} from '#/main/core/resource/selectors'
import quizSelect from './../../selectors'
import {selectors as paperSelect} from './../selectors'
import {Metadata as ItemMetadata} from './../../../items/components/metadata.jsx'
import {ScoreBox} from '#/main/core/layout/progression/components/score-box.jsx'
import {ScoreGauge} from './../../../components/score-gauge.jsx'
import {utils} from './../utils'
import {getNumbering} from './../../../utils/numbering'
import {
  NUMBERING_NONE
} from './../../../quiz/enums'

let Paper = props => {
  const showScore = utils.showScore(
    props.admin,
    props.paper.finished,
    paperSelect.showScoreAt(props.paper),
    paperSelect.showCorrectionAt(props.paper),
    paperSelect.correctionDate(props.paper)
  )
  return (
    <div className="paper">
      <h2 className="paper-title">
        {showScore &&
          <ScoreGauge userScore={props.paper.score} maxScore={paperSelect.paperScoreMax(props.paper)} size="sm" />
        }
        {tex('correction')}&nbsp;{props.paper.number}
      </h2>

      {props.steps.map((step, idx) =>
        <div key={idx} className="quiz-item item-paper">
          <h3 className="step-title">
            {step.title ? step.title : tex('step') + ' ' + (idx + 1)}
          </h3>

          {step.items.map((item, idxItem) => {
            const tmp = document.createElement('div')
            tmp.innerHTML = item.feedback
            const displayFeedback = (/\S/.test(tmp.textContent)) && item.feedback

            return isQuestionType(item.type) ?

                <Panel key={item.id}>
                {showScore && getAnswerScore(item.id, props.paper.answers) !== undefined && getAnswerScore(item.id, props.paper.answers) !== null &&
                  <ScoreBox className="pull-right" score={getAnswerScore(item.id, props.paper.answers)} scoreMax={paperSelect.itemScoreMax(item)}/>
                }
                {item.title &&
                  <h4 className="item-title">{item.title}</h4>
                }

                <ItemMetadata item={item} numbering={props.numbering !== NUMBERING_NONE ? (idx + 1) + '.' + getNumbering(props.numbering, idxItem): null} />

                {React.createElement(
                  getDefinition(item.type).paper,
                  {
                    item, answer: getAnswer(item.id, props.paper.answers),
                    feedback: getAnswerFeedback(item.id, props.paper.answers),
                    showScore: showScore,
                    showExpected: props.showExpectedAnswers,
                    showStats: props.showStatistics,
                    showYours: true,
                    stats: props.showStatistics ?
                      getDefinition(item.type).generateStats(item, props.papers, props.allPapersStatistics) :
                      {}
                  }
                )}

                {displayFeedback &&
                  <div className="item-feedback">
                    <span className="fa fa-comment" />
                    <div dangerouslySetInnerHTML={{__html: item.feedback}} />
                  </div>
                }
                </Panel>
               :
              ''
          })}
        </div>
      )}
    </div>
  )
}

Paper.propTypes = {
  admin: T.bool.isRequired,
  paper: T.shape({
    id: T.string.isRequired,
    number: T.number.isRequired,
    score: T.number,
    finished: T.bool.isRequired,
    structure: T.object.isRequired
  }).isRequired,
  steps: T.arrayOf(T.shape({
    items: T.arrayOf(T.shape({
      id: T.string.isRequired,
      content: T.string,
      type: T.string.isRequired
    })).isRequired
  })).isRequired,
  showExpectedAnswers: T.bool.isRequired,
  showStatistics: T.bool.isRequired,
  allPapersStatistics: T.bool.isRequired,
  papers: T.object.isRequired
}

function getAnswer(itemId, answers) {
  const answer = answers.find(answer => answer.questionId === itemId)

  return answer && answer.data ? answer.data : undefined
}

function getAnswerFeedback(itemId, answers) {
  const answer = answers.find(answer => answer.questionId === itemId)

  return answer && answer.feedback ? answer.feedback : null
}

function getAnswerScore(itemId, answers) {
  const answer = answers.find(answer => answer.questionId === itemId)

  return answer ? answer.score : undefined
}

function mapStateToProps(state) {
  return {
    admin: resourceSelect.editable(state) || quizSelect.papersAdmin(state),
    numbering: quizSelect.quizNumbering(state),
    paper: paperSelect.currentPaper(state),
    steps: paperSelect.paperSteps(state),
    showExpectedAnswers: quizSelect.papersShowExpectedAnswers(state),
    showStatistics: quizSelect.papersShowStatistics(state),
    allPapersStatistics: quizSelect.allPapersStatistics(state),
    papers: paperSelect.papers(state)
  }
}

const ConnectedPaper = connect(mapStateToProps)(Paper)

export {ConnectedPaper as Paper}
