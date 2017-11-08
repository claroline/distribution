import {setIfError, notBlank, notEmptyArray} from '#/main/core/validation'

/**
 * Gets validation errors for a Group.
 *
 * @param   {Object} group
 *
 * @returns {Object}
 */
function validate(location) {
  const errors = {}

  setIfError(errors, 'name', notBlank(location.name))

  return errors
}

export {
  validate
}
