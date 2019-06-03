import {trans} from '#/main/app/intl/translation'

import {CorrectedAnswer, Answerable} from '#/plugin/exo/items/utils'
import {ClozeItem as ClozeItemTypes} from '#/plugin/exo/items/cloze/prop-types'
import {utils} from '#/plugin/exo/items/cloze/utils'

// components
import {ClozeEditor} from '#/plugin/exo/items/cloze/components/editor'
import {ClozePaper} from '#/plugin/exo/items/cloze/components/paper'
import {ClozePlayer} from '#/plugin/exo/items/cloze/components/player'
import {ClozeFeedback} from '#/plugin/exo/items/cloze/components/feedback'

// scores
import ScoreSum from '#/plugin/exo/scores/sum'

export default {
  name: 'cloze',
  type: 'application/x.cloze+json',
  tags: [trans('question', {}, 'quiz')],
  answerable: true,

  paper: ClozePaper,
  player: ClozePlayer,
  feedback: ClozeFeedback,

  components: {
    editor: ClozeEditor
  },

  /**
   * List all available score modes for a cloze item.
   *
   * @return {Array}
   */
  supportScores: () => [
    ScoreSum
  ],

  /**
   * Create a new cloze item.
   *
   * @param {object} baseItem
   *
   * @return {object}
   */
  create: (baseItem) => {
    return Object.assign(baseItem, ClozeItemTypes.defaultProps)
  },

  /**
   * Validate a cloze item.
   *
   * @param {object} item
   *
   * @return {object} the list of item errors
   */
  validate: (item) => {
    const errors = {}

    return errors
  },

  /**
   * Correct an answer submitted to a cloze item.
   *
   * @param {object} item
   * @param {object} answers
   *
   * @return {CorrectedAnswer}
   */
  correctAnswer: (item, answers = null) => {
    const corrected = new CorrectedAnswer()

    item.solutions.map(solution => {
      const hole = item.holes.find(hole => hole.id === solution.holeId)
      const answer = answers ? answers.data.find(answer => answer.holeId === hole.id): null
      const expected = utils.findSolutionExpectedAnswer(solution)


      if (answer) {
        if (answer.answerText.trim() === expected.text) {
          corrected.addExpected(new Answerable(expected.score))
        } else {
          const userAnswer = solution.answers.find(solutionAnswer => solutionAnswer.text === answer.answerText)
          corrected.addUnexpected(new Answerable(userAnswer ? userAnswer.score: 0))
        }
      } else {
        corrected.addMissing(new Answerable(expected.score))
      }
    })

    return corrected
  },

  expectAnswer: (item) => {
    const answers = []

    if (item.solutions) {
      item.solutions.map(solution => {
        // search for the best answer for each hole
        let expected
        solution.answers.map(answer => {
          if (!expected || answer.score > expected.score) {
            expected = answer
          }
        })

        if (expected) {
          answers.push(new Answerable(expected.score))
        }
      })
    }

    return answers
  },

  allAnswers: (item) => {
    const answers = []
    if (item.solutions) {
      item.solutions.map(solution => solution.answers.map(answer => answers.push(new Answerable(answer.score))))
    }

    return answers
  }
}
