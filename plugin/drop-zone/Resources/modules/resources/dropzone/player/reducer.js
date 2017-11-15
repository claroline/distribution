import cloneDeep from 'lodash/cloneDeep'
import {makeReducer} from '#/main/core/utilities/redux'

import {
  MY_DROP_LOAD,
  MY_DROP_UPDATE,
  DOCUMENTS_ADD,
  DOCUMENT_REMOVE,
  PEER_DROP_LOAD,
  PEER_DROP_RESET,
  PEER_DROPS_INC
} from './actions'

import {
  CORRECTION_UPDATE
} from '../correction/actions'

const myDropReducer = makeReducer({}, {
  [MY_DROP_LOAD]: (state, action) => {
    return action.drop
  },
  [MY_DROP_UPDATE]: (state, action) => {
    return Object.assign({}, state, {[action.property]: action.value})
  },
  [DOCUMENTS_ADD]: (state, action) => {
    const documents = cloneDeep(state.documents)
    action.documents.forEach(d => documents.push(d))

    return Object.assign({}, state, {documents: documents})
  },
  [DOCUMENT_REMOVE]: (state, action) => {
    const documents = cloneDeep(state.documents)
    const index = documents.findIndex(d => d.id === action.documentId)

    if (index > -1) {
      documents.splice(index, 1)
    }

    return Object.assign({}, state, {documents: documents})
  },
  [CORRECTION_UPDATE]: (state, action) => {
    const corrections = cloneDeep(state.corrections)
    const index = corrections.findIndex(c => c.id === action.correction.id)

    if (index > -1) {
      corrections[index] = action.correction
    }

    return Object.assign({}, state, {corrections: corrections})
  }
})

const myDropsReducer = makeReducer({}, {})

const nbCorrectionsReducer = makeReducer({}, {
  [PEER_DROPS_INC]: (state) => {
    return state + 1
  }
})

const peerDropReducer = makeReducer({}, {
  [CORRECTION_UPDATE]: (state, action) => {
    const corrections = cloneDeep(state.corrections)
    const index = corrections.findIndex(c => c.id === action.correction.id)

    if (index > -1) {
      corrections[index] = action.correction
    }

    return Object.assign({}, state, {corrections: corrections})
  },
  [PEER_DROP_LOAD]: (state, action) => {
    return action.drop
  },
  [PEER_DROP_RESET]: () => {
    return null
  }
})

const reducer = {
  myDrop: myDropReducer,
  myDrops: myDropsReducer,
  nbCorrections: nbCorrectionsReducer,
  peerDrop: peerDropReducer
}

export {
  reducer
}
