import {createSelector} from 'reselect'
import get from 'lodash/get'

// path
const path = state => state.path

const steps = createSelector(
  [path],
  (path) => path.steps || []
)

const empty = createSelector(
  [steps],
  (steps) => 0 === steps.length
)

const showOverview = createSelector(
  [path],
  (path) => get(path, 'display.showOverview') || false
)

// summary
const summary = state => state.summary

const summaryPinned = createSelector(
  [summary],
  (summary) => summary.pinned
)

const summaryOpened = createSelector(
  [summary],
  (summary) => summary.opened
)

// is the current step rendered full width (without opened pinned summary) ?
const fullWidth = createSelector(
  [summaryPinned, summaryOpened],
  (summaryPinned, summaryOpened) => !summaryOpened || !summaryPinned
)

// is step navigation enabled ?
const navigationEnabled = state => state.navigationEnabled

export const select = {
  path,
  steps,
  empty,
  summaryPinned,
  summaryOpened,
  fullWidth,
  navigationEnabled,
  showOverview
}
