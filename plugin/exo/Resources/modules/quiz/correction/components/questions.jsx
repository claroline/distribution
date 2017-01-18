import React, {PropTypes as T} from 'react'
import {connect} from 'react-redux'
import {selectors as correctionSelectors} from './../selectors'
import {tex} from './../../../utils/translate'

export const QuestionRow = props =>
  <tr>
    <td>{props.question.title}</td>
    <td dangerouslySetInnerHTML={{__html: props.question.content}}></td>
    <td>{props.answers.length}</td>
    <td>
      <a className="btn btn-default" href={`#correction/questions/${props.question.id}`}>
        {tex('to_correct')}
      </a>
    </td>
  </tr>

QuestionRow.propTypes = {
  question: T.shape({
    id: T.string.isRequired,
    title: T.string.isRequired,
    content: T.string.isRequired
  }).isRequired,
  answers: T.arrayOf(T.object)
}

let Questions = props =>
  <div className="questions-list">
    <table className="table table-striped table-hover">
      <thead>
        <tr>
          <th>{tex('question_title_short')}</th>
          <th>{tex('question')}</th>
          <th>{tex('number_of_papers_to_correct')}</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {props.questions.map((question, idx) =>
          <QuestionRow key={idx} {...question}/>
        )}
      </tbody>
    </table>
  </div>

Questions.propTypes = {
  questions: T.arrayOf(T.object).isRequired
}

function mapStateToProps(state) {
  return {
    questions: correctionSelectors.questions(state)
  }
}

const ConnectedQuestions = connect(mapStateToProps)(Questions)

export {ConnectedQuestions as Questions}