import isEmpty from 'lodash/isEmpty'
import set from 'lodash/set'

import {makeInstanceActionCreator} from '#/main/core/utilities/redux'

import {tval} from '#/main/core/translation'
import {API_REQUEST} from '#/main/core/api/actions'
import {actions as alertActions} from '#/main/core/layout/alert/actions'
import {select as formSelect} from '#/main/core/data/form/selectors'

export const FORM_RESET       = 'FORM_RESET'
export const FORM_SET_ERRORS  = 'FORM_SET_ERRORS'
export const FORM_SUBMIT      = 'FORM_SUBMIT'
export const FORM_UPDATE_PROP = 'FORM_UPDATE_PROP'

export const actions = {}

actions.setErrors = makeInstanceActionCreator(FORM_SET_ERRORS, 'errors')
actions.submitForm = makeInstanceActionCreator(FORM_SUBMIT)
actions.updateProp = makeInstanceActionCreator(FORM_UPDATE_PROP, 'propName', 'propValue')

actions.resetForm = (formName, data = {}, isNew = false) => ({
  type: FORM_RESET+'/'+formName,
  data: data,
  isNew: isNew
})

actions.saveForm = (formName, target) => (dispatch, getState) => {
  const formNew = formSelect.isNew(formSelect.form(getState(), formName))
  const formData = formSelect.data(formSelect.form(getState(), formName))
  const formErrors = formSelect.errors(formSelect.form(getState(), formName))

  dispatch(actions.submitForm(formName))

  if (!isEmpty(formErrors)) {
    dispatch(alertActions.addAlert(
      formName+'validation',
      'warning',
      formNew ? 'create':'update',
      formNew ? 'Création impossible':'Mise à jour impossible'
    ))
  } else {
    dispatch({
      [API_REQUEST]: {
        url: target,
        request: {
          method: formNew ? 'POST' : 'PUT',
          body: JSON.stringify(formData)
        },
        success: (response, dispatch) => {
          dispatch(actions.resetForm(formName, response, false))
        },
        error: (errors, dispatch) => {
          // try to build form errors object from response
          const formErrors = {}
          if (errors && Array.isArray(errors)) {
            errors.map(error => {
              const errorPath = error.path
                .replace(/^\/|\/$/g, '') // removes trailing and leading slashes
                .replace('/', '.') // replaces / by . (for lodash)

              set(formErrors, errorPath, tval(error.message))
            })

            // inject errors in form
            dispatch(actions.setErrors(formName, formErrors))
          }
        }
      }
    })
  }
}
