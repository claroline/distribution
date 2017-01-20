import React, {PropTypes as T} from 'react'
import {connect} from 'react-redux'
import {actions} from './../actions'
import {selectors as correctionSelectors} from './../selectors'
import Panel from 'react-bootstrap/lib/Panel'
import Col from 'react-bootstrap/lib/Col'
import InputGroup from 'react-bootstrap/lib/InputGroup'
import FormControl from 'react-bootstrap/lib/FormControl'
import Button from 'react-bootstrap/lib/Button'

export const AnswerRow = props =>
  <div className="row">
    <Col md={10}>
      <Panel key={props.id}>
        <div dangerouslySetInnerHTML={{__html: props.data}}></div>
      </Panel>
    </Col>
    <Col md={2}>
      <InputGroup>
        <FormControl key={props.id}
                     type="text"
                     value={props.score !== undefined && props.score !== null && !isNaN(props.score) ? props.score : ''}
                     onChange={(e) => props.updateScore(props.id, e.target.value)}
        />
        <InputGroup.Addon>/{props.scoreMax}</InputGroup.Addon>
        <InputGroup.Button>
          <Button>
            <span className="fa fa-fw fa-comments-o"></span>
          </Button>
        </InputGroup.Button>
      </InputGroup>
    </Col>
    <Col md={12}>
      <hr/>
    </Col>
  </div>

AnswerRow.propTypes = {
  id: T.string.isRequired,
  questionId: T.string.isRequired,
  type: T.string.isRequired,
  data: T.string.isRequired,
  score: T.number,
  scoreMax: T.number,
  updateScore: T.func.isRequired
}

let Answers = props =>
  <div className="answers-list">
    <h4 dangerouslySetInnerHTML={{__html: props.question.content}}></h4>
    {props.answers.map((answer, idx) =>
      <AnswerRow key={idx} scoreMax={props.question.score && props.question.score.max} updateScore={props.updateScore} {...answer}/>
    )}
  </div>

Answers.propTypes = {
  question: T.object.isRequired,
  answers: T.arrayOf(T.object).isRequired,
  updateScore: T.func.isRequired
}

function mapStateToProps(state) {
  return {
    question: correctionSelectors.currentQuestion(state),
    answers: correctionSelectors.answers(state)
  }
}

const ConnectedAnswers = connect(mapStateToProps, actions)(Answers)

export {ConnectedAnswers as Answers}