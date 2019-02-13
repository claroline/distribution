import {createSelector} from 'reselect'
import get from 'lodash/get'

import {currentUser} from '#/main/app/security'
import {selectors as resourceSelect} from '#/main/core/resource/store'
import {hasPermission} from '#/main/app/security'

const authenticatedUser = currentUser()

const STORE_NAME = 'resource'

const resource = (state) => state[STORE_NAME]

const clacoForm = createSelector(
  [resource],
  (resource) => resource.clacoForm
)

const isAnon = () => authenticatedUser === null

const params = createSelector(
  [clacoForm],
  (clacoForm) => clacoForm.details || {}
)

const fields = createSelector(
  [clacoForm],
  (clacoForm) => clacoForm.fields
)

const visibleFields = createSelector(
  [fields],
  (fields) => fields.filter(f => !f.restrictions.hidden)
)

const template = createSelector(
  [clacoForm],
  (clacoForm) => get(clacoForm, 'template.content')
)

const useTemplate = createSelector(
  [clacoForm],
  (clacoForm) => get(clacoForm, 'template.enabled')
)

const entries = createSelector(
  [resource],
  (resource) => resource.entries
)

const currentEntry = createSelector(
  [entries],
  (entries) => entries.current.data
)

const myEntriesCount = createSelector(
  [entries],
  (entries) => entries.myEntriesCount
)

const listConfiguration = createSelector(
  [clacoForm],
  (clacoForm) => clacoForm.list
)

const categories = createSelector(
  [clacoForm],
  (clacoForm) => clacoForm.categories
)

const keywords = createSelector(
  [clacoForm],
  (clacoForm) => clacoForm.keywords
)

const roles = createSelector(
  [resource],
  (resource) => resource.roles
)

const myRoles = createSelector(
  [resource],
  (resource) => resource.myRoles
)

const entryUser = createSelector(
  [entries],
  (entries) => entries.entryUser
)

const usedCountries = createSelector(
  [entries],
  (entries) => entries.countries
)

const canEdit = createSelector(
  resourceSelect.resourceNode,
  (resourceNode) => hasPermission('edit', resourceNode)
)

const canAdministrate = createSelector(
  resourceSelect.resourceNode,
  (resourceNode) => hasPermission('administrate', resourceNode)
)

const canSearchEntry = createSelector(
  resourceSelect.resourceNode,
  isAnon,
  params,
  (resourceNode, isAnon, params) => hasPermission('edit', resourceNode) || !isAnon || (params && params['search_enabled'])
)

const isCurrentEntryOwner = createSelector(
  isAnon,
  currentEntry,
  (isAnon, currentEntry) => {
    return !isAnon && authenticatedUser && currentEntry && currentEntry.user && currentEntry.user.id === authenticatedUser.id
  }
)

const isCurrentEntryManager = createSelector(
  isAnon,
  currentEntry,
  (isAnon, currentEntry) => {
    let isManager = false

    if (!isAnon && authenticatedUser && currentEntry && currentEntry.categories) {
      currentEntry.categories.forEach(category => {
        if (!isManager && category.managers) {
          category.managers.forEach(manager => {
            if (manager.id === authenticatedUser.id) {
              isManager = true
            }
          })
        }
      })
    }

    return isManager
  }
)

const canManageCurrentEntry = createSelector(
  isAnon,
  resourceSelect.resourceNode,
  currentEntry,
  (isAnon, resourceNode, currentEntry) => {
    let canManage = hasPermission('edit', resourceNode)

    if (!canManage && !isAnon && authenticatedUser && currentEntry && currentEntry.categories) {
      currentEntry.categories.forEach(category => {
        if (!canManage && category.managers) {
          category.managers.forEach(manager => {
            if (manager.id === authenticatedUser.id) {
              canManage = true
            }
          })
        }
      })
    }

    return canManage
  }
)

const canEditCurrentEntry = createSelector(
  canAdministrate,
  params,
  isCurrentEntryOwner,
  canManageCurrentEntry,
  (canAdministrate, params, isCurrentEntryOwner, canManageCurrentEntry) => {
    return canAdministrate || (params && params['edition_enabled'] && isCurrentEntryOwner) || canManageCurrentEntry
  }
)

const canAddEntry = createSelector(
  resourceSelect.resourceNode,
  resourceSelect.managed,
  params,
  myEntriesCount,
  (resourceNode, managed, params, myEntriesCount) => {
    return managed
      || (hasPermission('add-entry', resourceNode) && (!params.max_entries || myEntriesCount < params.max_entries))
  }
)

const canOpenCurrentEntry = createSelector(
  canAdministrate,
  params,
  currentEntry,
  isCurrentEntryOwner,
  canManageCurrentEntry,
  (canAdministrate, params, currentEntry, isCurrentEntryOwner, canManageCurrentEntry) => {
    return canAdministrate || (
      currentEntry && (
        (params && params['search_enabled'] && currentEntry.status === 1) ||
        isCurrentEntryOwner ||
        canManageCurrentEntry
      )
    )
  }
)

const isCategoryManager = createSelector(
  categories,
  (categories) => {
    return authenticatedUser && categories.filter(c => c.managers.find(m => m.id === authenticatedUser.id)).length > 0
  }
)

const canViewMetadata = createSelector(
  [canEdit, params, isCategoryManager],
  (canEdit, params, isCategoryManager) => canEdit
  || 'all' === params.display_metadata
  || ('manager' === params.display_metadata && isCategoryManager)
)

const canComment = createSelector(
  params,
  myRoles,
  (params, myRoles) => {
    if (params.comments_enabled) {
      const commentsRoles = params.comments_roles || []
      const intersection = commentsRoles.filter(cr => myRoles.indexOf(cr) > -1)

      return intersection.length > 0
    }

    return false
  }
)

const canViewComments = createSelector(
  params,
  myRoles,
  (params, myRoles) => {
    if (params.display_comments) {
      const commentsDisplayRoles = params.comments_display_roles || []
      const intersection = commentsDisplayRoles.filter(cr => myRoles.indexOf(cr) > -1)

      return intersection.length > 0
    }

    return false
  }
)

const canGeneratePdf = createSelector(
  [resource],
  (resource) => resource.canGeneratePdf
)

const message = createSelector(
  [resource],
  (resource) => resource.message
)

const showEntryNav = createSelector(
  [clacoForm],
  (clacoForm) => get(clacoForm, 'display.showEntryNav')
)

export const selectors = {
  STORE_NAME,
  resource,
  clacoForm,
  isAnon,
  params,
  canSearchEntry,
  fields,
  visibleFields,
  template,
  useTemplate,
  entries,
  isCurrentEntryOwner,
  isCurrentEntryManager,
  canManageCurrentEntry,
  canEditCurrentEntry,
  canViewMetadata,
  canAddEntry,
  canEdit,
  canOpenCurrentEntry,
  canAdministrate,
  isCategoryManager,
  canComment,
  canViewComments,
  categories,
  keywords,
  roles,
  myRoles,
  entryUser,
  usedCountries,
  canGeneratePdf,
  message,
  listConfiguration,
  showEntryNav
}