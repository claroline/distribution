import {makeActionCreator} from '#/main/core/utilities/redux'

import {API_REQUEST} from '#/main/core/api/actions'

export const PROFILE_FACET_OPEN   = 'PROFILE_FACET_OPEN'
export const PROFILE_FACET_ADD    = 'PROFILE_FACET_ADD'
export const PROFILE_FACET_UPDATE = 'PROFILE_FACET_UPDATE'
export const PROFILE_FACET_REMOVE = 'PROFILE_FACET_REMOVE'

export const PROFILE_ADD_SECTION    = 'PROFILE_ADD_SECTION'
export const PROFILE_UPDATE_SECTION = 'PROFILE_UPDATE_SECTION'
export const PROFILE_REMOVE_SECTION = 'PROFILE_REMOVE_SECTION'

export const PROFILE_ADD_FIELD    = 'PROFILE_ADD_FIELD'
export const PROFILE_UPDATE_FIELD = 'PROFILE_UPDATE_FIELD'
export const PROFILE_REMOVE_FIELD = 'PROFILE_REMOVE_FIELD'

export const actions = {}

actions.openFacet = makeActionCreator(PROFILE_FACET_OPEN, 'id')
actions.addFacet = makeActionCreator(PROFILE_FACET_ADD)
actions.updateFacet = makeActionCreator(PROFILE_FACET_UPDATE, 'id', 'prop', 'value')
actions.removeFacet = makeActionCreator(PROFILE_FACET_REMOVE, 'id') // todo redirect if this is the current facet

actions.addSection = makeActionCreator(PROFILE_ADD_SECTION, 'facetId')
actions.updateSection = makeActionCreator(PROFILE_UPDATE_SECTION, 'sectionId', 'prop', 'value')
actions.removeSection = makeActionCreator(PROFILE_REMOVE_SECTION, 'facetId', 'sectionId')

actions.addField = makeActionCreator(PROFILE_ADD_FIELD, 'facetId', 'sectionId', 'fieldType')
actions.updateField = makeActionCreator(PROFILE_UPDATE_FIELD, 'facetId', 'sectionId')
actions.removeField = makeActionCreator(PROFILE_REMOVE_FIELD, 'facetId', 'sectionId')

actions.fetchFacets = () => ({
  [API_REQUEST]: {
    url: ['apiv2_']
  }
})
