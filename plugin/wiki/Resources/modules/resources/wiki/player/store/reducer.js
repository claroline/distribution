import {combineReducers, makeReducer} from '#/main/core/scaffolding/reducer'
import {makeFormReducer} from '#/main/core/data/form/reducer'
import {FORM_SUBMIT_SUCCESS} from '#/main/core/data/form/actions'

import {
  UPDATE_CURRENT_EDIT_SECTION,
  UPDATE_CURRENT_PARENT_SECTION,
  UPDATE_SECTION_VISIBILITY
} from '#/plugin/wiki/resources/wiki/player/store/actions'
import {
  UPDATE_ACTIVE_CONTRIBUTION
} from '#/plugin/wiki/resources/wiki/history/store/actions'
import {updateInTree, appendChildToTree} from '#/plugin/wiki/resources/wiki/utils'

const defaultCurrentSection = {
  id: null,
  parentId: null
}
const reducer = combineReducers({
  tree: makeReducer({}, {
    [UPDATE_ACTIVE_CONTRIBUTION]: (state, action) => updateInTree(state, action.sectionId, 'activeContribution', action.contribution),
    [UPDATE_SECTION_VISIBILITY]: (state, action) => updateInTree(state, action.sectionId, 'meta.visible', action.section.meta.visible),
    [FORM_SUBMIT_SUCCESS+'/sections.currentSection']: (state, action) => {
      if (action.updatedData.meta.new) {
        return appendChildToTree(state, action.updatedData.meta.parent, action.updatedData)
      }
      return updateInTree(state, action.updatedData.id, 'activeContribution', action.updatedData.activeContribution)
    }
  }),
  currentSection: makeFormReducer('sections.currentSection', defaultCurrentSection, {
    id: makeReducer(defaultCurrentSection.id, {
      [UPDATE_CURRENT_EDIT_SECTION]: (state, action) => action.sectionId,
      [UPDATE_CURRENT_PARENT_SECTION]: () => null,
      [FORM_SUBMIT_SUCCESS+'/sections.currentSection']: () => null
    }),
    parentId: makeReducer(defaultCurrentSection.parentId, {
      [UPDATE_CURRENT_EDIT_SECTION]: () => null,
      [UPDATE_CURRENT_PARENT_SECTION]: (state, action) => action.sectionId,
      [FORM_SUBMIT_SUCCESS+'/sections.currentSection']: () => null
    })
  })
})

export {
  reducer
}