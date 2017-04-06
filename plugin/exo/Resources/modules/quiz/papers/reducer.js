import {PAPERS_INIT, PAPER_CURRENT, PAPER_ADD, PAPER_FETCHED} from './actions'
import {update} from '../../utils/utils'

export const reducePapers = (state = {papers: {}, isFetched: false}, action = {}) => {

  switch (action.type) {
    case PAPERS_INIT:
      let withKeys = {}
      Object.keys(action.papers).forEach(key => {
        const paper = action.papers[key]
        withKeys[paper.id] = paper
      })
      return Object.assign({}, state, {
        papers: Object.assign({}, state.papers, withKeys)
      })
    case PAPER_CURRENT:
      return Object.assign({}, state, {
        current: action.id
      })
    case PAPER_ADD:
      return Object.assign({}, state, {
        papers: update(state.papers, {[action.paper.id]:{$set: action.paper}})
      })
    case PAPER_FETCHED:
      return Object.assign({}, state, {
        isFetched: true
      })
  }

  return state
}
