import {makeActionCreator} from '#/main/core/scaffolding/actions'
import {actions as formActions} from '#/main/core/data/form/actions'
import {API_REQUEST} from '#/main/app/api'

export const UPDATE_CURRENT_EDIT_SECTION = 'UPDATE_CURRENT_EDIT_SECTION'
export const UPDATE_CURRENT_PARENT_SECTION = 'UPDATE_CURRENT_PARENT_SECTION'
export const UPDATE_SECTION_VISIBILITY = 'UPDATE_SECTION_VISIBILITY'

export const actions = {}

actions.updateCurrentEditSection = makeActionCreator(UPDATE_CURRENT_EDIT_SECTION, 'sectionId')
actions.updateCurrentParentSection = makeActionCreator(UPDATE_CURRENT_PARENT_SECTION, 'sectionId')
actions.updateSectionVisibility = makeActionCreator(UPDATE_SECTION_VISIBILITY, 'sectionId', 'section')

actions.setCurrentParentSection = (parentId = null) => (dispatch) => {
  if (parentId) {
    dispatch(actions.updateCurrentParentSection(parentId))
  } else {
    dispatch(actions.updateCurrentParentSection(null))
  }
  dispatch(formActions.resetForm('sections.currentSection', {}, true))
}

actions.setCurrentEditSection = (section = null) => (dispatch) => {
  if (section) {
    dispatch(actions.updateCurrentEditSection(section.id))
    dispatch(formActions.resetForm('sections.currentSection', section, false))
  } else {
    dispatch(actions.updateCurrentEditSection(null))
    dispatch(formActions.resetForm('sections.currentSection', {}, true))
  }
}

actions.setSectionVisibility = (id = null, visible = true) => (dispatch) => {
  if (id) {
    dispatch({
      [API_REQUEST]: {
        url: ['apiv2_wiki_section_set_visibility', {id}],
        request: {
          method: 'PUT',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            visible
          })
        },
        success: (data, dispatch) => {
          dispatch(actions.updateSectionVisibility(id, data))
        }
      }
    })
  }
}