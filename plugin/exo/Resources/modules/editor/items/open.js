import {Open as component} from './open.jsx'
import {ITEM_CREATE} from './../actions'
import {setIfError, notBlank, number, gteZero, chain} from './../lib/validate'
import {makeActionCreator} from './../util'
import cloneDeep from 'lodash/cloneDeep'
import merge from 'lodash/merge'
import set from 'lodash/set'

const UPDATE = 'UPDATE'

export const actions = {
  update: makeActionCreator(UPDATE, 'property', 'value')
}

function reduce(item = {}, action) {
  switch (action.type) {
    case ITEM_CREATE: {
      return Object.assign({}, item, {
        maxScore: 0,
        maxLength: 0
      })
    }

    case UPDATE: {
      const newItem = cloneDeep(item)
      newItem._touched = merge(
        newItem._touched || {},
        set({}, action.property, true)
      )
      newItem[action.property] = parseFloat(action.value)
      return newItem
    }
  }
  return item
}


function validate(values) {
  const errors = {}
  setIfError(errors, 'maxScore', chain(values.maxScore, [notBlank, number, gteZero]))
  setIfError(errors, 'maxLength', chain(values.maxLength, [notBlank, number, gteZero]))

  return errors
}

export default {
  type: 'application/x.open+json',
  name: 'open',
  component,
  reduce,
  validate
}
