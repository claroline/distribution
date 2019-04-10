import merge from 'lodash/merge'
import times from 'lodash/times'

import {trans} from '#/main/app/intl/translation'

import {CorrectedAnswer, Answerable} from '#/plugin/exo/quiz/correction/components/corrected-answer'
import {emptyAnswer} from '#/plugin/exo/items/utils'

import {SetItem as SetItemType} from '#/plugin/exo/items/set/prop-types'

// components
import {SetEditor} from '#/plugin/exo/items/set/components/editor'
import {SetPaper} from '#/plugin/exo/items/set/components/paper'
import {SetPlayer} from '#/plugin/exo/items/set/components/player'
import {SetFeedback} from '#/plugin/exo/items/set/components/feedback'

// scores
import ScoreSum from '#/plugin/exo/scores/sum'

export default {
  name: 'set',
  type: 'application/x.set+json',
  tags: [trans('question', {}, 'quiz')],
  answerable: true,

  // old
  paper: SetPaper,
  player: SetPlayer,
  feedback: SetFeedback,

  components: {
    editor: SetEditor
  },

  /**
   * List all available score modes for a set item.
   *
   * @return {Array}
   */
  supportScores: () => [
    ScoreSum
  ],

  /**
   * Create a new set item.
   *
   * @param {object} baseItem
   *
   * @return {object}
   */
  create: (baseItem) => merge({}, baseItem, SetItemType.defaultProps, {
    sets: [emptyAnswer()],
    items: [emptyAnswer()]
  }),

  /**
   * Correct an answer submitted to a set item.
   *
   * @param {object} item
   * @param {object} answer
   *
   * @return {CorrectedAnswer}
   */
  getCorrectedAnswer: (item, answer = {data: []}) => {
    const corrected = new CorrectedAnswer()

    item.solutions.associations.forEach(association => {
      const userAnswer = answer && answer.data ? answer.data.find(answer => (answer.itemId === association.itemId) && (answer.setId === association.setId)): null

      userAnswer ?
        corrected.addExpected(new Answerable(association.score)):
        corrected.addMissing(new Answerable(association.score))
    })

    item.solutions.odd.forEach(odd => {
      const penalty = answer && answer.data ? answer.data.find(answer => answer.itemId === odd.itemId): null
      if (penalty) corrected.addPenalty(new Answerable(-odd.score))
    })

    const found = answer && answer.data ? answer.data.length: 0
    times(item.solutions.associations.length - found, () => corrected.addPenalty(new Answerable(item.penalty)))

    return corrected
  }
}
