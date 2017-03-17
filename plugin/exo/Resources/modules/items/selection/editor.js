import {Selection as component} from './editor.jsx'
import {ITEM_CREATE} from './../../quiz/editor/actions'
import {makeActionCreator, makeId} from './../../utils/utils'
import cloneDeep from 'lodash/cloneDeep'
import {utils} from './utils/utils'
import {reduce as findReduce} from './editors/find'
import {reduce as selectReduce} from './editors/select'
import {reduce as highlightReduce} from './editors/highlight'
import {actions as findActions} from './editors/find'
import {actions as selectActions} from './editors/select'
import {actions as highlightActions} from './editors/highlight'
import {validate as findValidate} from './editors/find'
import {validate as selectValidate} from './editors/select'
import {validate as highlightValidate} from './editors/highlight'
import {notBlank} from './../../utils/validate'
import {tex} from './../../utils/translate'

const UPDATE_QUESTION = 'UPDATE_QUESTION'
const CLOSE_POPOVER = 'CLOSE_POPOVER'
const OPEN_ANSWER = 'OPEN_ANSWER'

export const actions = Object.assign(
  {},
  {
    updateQuestion: makeActionCreator(UPDATE_QUESTION, 'value', 'parameter', 'offsets'),
    closePopover: makeActionCreator(CLOSE_POPOVER),
    openAnswer: makeActionCreator(OPEN_ANSWER, 'selectionId')
  },
  findActions,
  selectActions,
  highlightActions
)

export default {
  component,
  reduce,
  validate,
  decorate
}

function decorate(item) {
  item = Object.assign({}, item, {
    _text: utils.makeTextHtml(item.text, item.mode === 'find' ? item.solutions : item.selections, 'editor')
  })

  if (item.mode === 'highlight') {
    const solutions = cloneDeep(item.solutions)

    solutions.forEach(solution => {
      let answers = []
      solution.answers.forEach(answer => {
        answers.push(Object.assign({}, answer, {_answerId: makeId()}))
      })
      solution.answers = answers
    })

    item = Object.assign({}, item, {solutions})
  }

  return item
}

function reduce(item = {}, action) {
  switch (action.type) {
    case ITEM_CREATE: {
      return Object.assign({}, item, {
        text: '',
        mode: 'select',
        globalScore: false,
        solutions: [],
        _selectionPopover: false,
        _text: '',
        penalty: 0
      })
    }
    case UPDATE_QUESTION: {
      const oldText = item._text

      //maybe simplifiable with lodash "set" function
      if (action.parameter === 'score.type') {
        item = cloneDeep(item)
        item.score.type = action.value
      }

      if (action.parameter === 'score.success') {
        item = cloneDeep(item)
        item.score.success = action.value
      }

      if (action.parameter === 'score.failure') {
        item = cloneDeep(item)
        item.score.failure = action.value
      }

      if (action.parameter === 'penalty') {
        item = cloneDeep(item)
        item.penalty = action.value
      }

      if (action.parameter === 'tries') {
        item = cloneDeep(item)
        item.tries = action.value
      }

      //set the dislayed text here
      if (action.parameter === 'text') {
        //then we need to update the positions here because if we add text BEFORE our marks, then everything is screwed up
        item = recomputePositions(item, action.offsets, oldText)
        item = Object.assign({}, item, {text: action.value, _text: action.value})
      }
      //if we set the mode to highlight, we also initialize the colors
      if (action.parameter === 'mode') {
        item = Object.assign({}, item, {mode: action.value})

        switch (action.value) {
          case 'highlight': {
            item = toHighlightMode(item)
            break
          }
          case 'find': {
            item = toFindMode(item)
            break
          }
          case 'select': {
            item = toSelectMode(item)
            break
          }
        }
      }

      return utils.cleanItem(item)
    }
    case OPEN_ANSWER: {
      return Object.assign({}, item, {
        _selectionPopover: true,
        _selectionId: action.selectionId
      })
    }
    case CLOSE_POPOVER: {
      return Object.assign({}, item, {_selectionPopover: false})
    }
  }

  item = findReduce(item, action)
  item = selectReduce(item, action)
  item = highlightReduce(item, action)

  return item
}

function validate(item) {
  let _errors = {}

  switch (item.mode) {
    case 'find': {
      _errors = Object.assign({}, _errors, findValidate(item))
      break
    }
    case 'select': {
      _errors = Object.assign({}, _errors, selectValidate(item))
      break
    }
    case 'highlight': {
      _errors = Object.assign({}, _errors, highlightValidate(item))
    }
  }

  if (notBlank(item.text, true)) {
    _errors.text = tex('selection_empty_text_error')
  }

  if (!_errors.text) {
    if (item.solutions.length === 0) {
      _errors.text = tex('selection_text_must_contain_selections_error')
    }
  }

  return _errors
}

export function recomputePositions(item, offsets, oldText) {
  let toSort = item.mode === 'find' ? item.solutions : item.selections

  if (!toSort) {
    return item
  }

  toSort = cloneDeep(toSort)
  toSort.sort((a, b) => a.begin - b.begin)
  let idx = 0

  toSort.forEach(element => {
    //this is where the word really start
    element._trueBegin = utils.getHtmlLength(element, 'editor') * idx + element.begin + utils.getFirstSpan(element, 'editor').length
    idx++

    const amount = item.text.length - oldText.length

    if (offsets.trueStart < element._trueBegin) {
      element._trueBegin += amount
      element.begin += amount
      element.end += amount
    }
  })

  const newData = item.mode === 'find' ? {solutions: toSort} : {selections: toSort}

  item = Object.assign({}, item, newData)

  return item
}

function toFindMode(item) {
  const newItem = cloneDeep(item)
  const solutions = newItem.solutions
  //add beging and end to solutions
  solutions.forEach(solution => {
    let selection = item.selections.find(selection => selection.id === solution.selectionId)
    solution.begin = selection.begin
    solution.end = selection.end
    solution.score = 0
  })

  delete newItem.selections
  delete newItem.colors

  return Object.assign({}, newItem, {solutions, tries: solutions.length})
}

function toSelectMode(item) {
  item = addSelectionsFromAnswers(item)

  //remove colors
  delete item.colors

  return item
}

function toHighlightMode(item) {
  item = addSelectionsFromAnswers(item)

  const solutions = cloneDeep(item.solutions)

  solutions.forEach(solution => {
    solution.answers = []
  })

  return Object.assign({}, item, {colors: [{
    id: makeId(),
    code: '#'+(Math.random()*0xFFFFFF<<0).toString(16)
  }], solutions})
}

function addSelectionsFromAnswers(item) {
  if (!item.selections) {
    const selections = []
    const solutions = cloneDeep(item.solutions)

    solutions.forEach(solution => selections.push({
      id: solution.selectionId,
      begin: solution.begin,
      end: solution.end
    }))

    item =  Object.assign({}, item, {selections})
  }

  return item
}
