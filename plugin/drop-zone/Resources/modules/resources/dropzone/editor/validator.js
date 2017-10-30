import isEmpty from 'lodash/isEmpty'

import {setIfError, notBlank} from '#/main/core/validation'

/**
 * Checks if a Dropzone data are valid.
 *
 * @param   {Object} dropzone
 *
 * @returns {boolean}
 */
function isValid(dropzone) {
  return isEmpty(validate(dropzone))
}

/**
 * Gets validation errors for a Dropzone resource.
 *
 * @param   {Object} dropzone
 *
 * @returns {Object}
 */
function validate(dropzone) {
  const errors = {}

  setIfError(errors, 'instruction', notBlank(dropzone.display.instruction))
  setIfError(errors, 'criteriaTotal', notBlank(dropzone.parameters.criteriaTotal))

  if (dropzone.parameters.criteriaEnabled) {
    dropzone.criteria.forEach(c => setIfError(errors, `criterion.${c.id}`, notBlank(c.instruction)))
  }
  return errors
}

export {
  isValid,
  validate
}
