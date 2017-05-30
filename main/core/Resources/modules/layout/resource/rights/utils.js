import cloneDeep from 'lodash/cloneDeep'

// TODO : this 3 methods should be moved in a `role` module
const roleAnonymous = () => 'ROLE_ANONYMOUS'
const roleUser = () => 'ROLE_USER'
const roleWorkspaceUser = (workspace, admin = false) => (admin ? 'ROLE_WS_MANAGER_':'ROLE_WS_COLLABORATOR_')+workspace.id

/**
 * Gets permissions object for a Role.
 *
 * @param {string} roleName
 * @param {object} perms
 *
 * @return {object}
 */
const findRolePermissions = (roleName, perms) => perms[roleName] ? perms[roleName].permissions : {}

const setRolePermission = (roleName, permission, value) => {

}

/**
 * Checks if the resource has custom permissions.
 *
 * @param {object} perms
 * @param {object} workspace
 *
 * @returns {boolean}
 */
const hasCustomRules = (perms, workspace = null) => {
  return false
}

/**
 * Computes permissions to get a single string representing who have the `open` right.
 *
 * @todo manages the `custom` case
 *
 * @param {object} perms
 * @param {object} workspace
 *
 * @return {string}
 */
const getSimpleAccessRule = (perms, workspace = null) => {
  const anonymous = findRolePermissions(roleAnonymous(), perms)
  if (anonymous.open) {
    return 'all'
  } else {
    const users = findRolePermissions(roleUser(), perms)
    if (users.open) {
      return 'user'
    } else {
      const wsUsers = findRolePermissions(roleWorkspaceUser(workspace), perms)
      if (wsUsers.open) {
        return 'workspace'
      } else {
        return 'admin'
      }
    }
  }
}

const setSimpleAccessRule = (perms, rule, workspace = null) => {
  // Retrieve and duplicates standard roles
  const anonymous = cloneDeep(perms[roleAnonymous()])
  const users     = cloneDeep(perms[roleUser()])
  const wsUsers   = cloneDeep(perms[roleWorkspaceUser(workspace)])

  switch (rule) {
    case 'all':
      anonymous.permissions.open = true
      users.permissions.open     = true
      wsUsers.permissions.open   = true
      break
    case 'user':
      anonymous.permissions.open = false
      users.permissions.open     = true
      wsUsers.permissions.open   = true
      break
    case 'workspace':
      anonymous.permissions.open = false
      users.permissions.open     = false
      wsUsers.permissions.open   = true
      break
    case 'admin':
      anonymous.permissions.open = false
      users.permissions.open     = false
      wsUsers.permissions.open   = false
      break
  }

  return Object.assign({}, perms, {
    [roleAnonymous()]: anonymous,
    [roleUser()]: users,
    [roleWorkspaceUser(workspace)]: wsUsers
  })
}

export {
  roleAnonymous,
  roleUser,
  roleWorkspaceUser,
  findRolePermissions,
  setRolePermission,
  hasCustomRules,
  getSimpleAccessRule,
  setSimpleAccessRule
}
