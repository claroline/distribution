import {createSelector} from 'reselect'

import {constants} from '#/main/core/layout/alert/constants'

const alerts = state => state.alerts

const sortedAlerts = createSelector(
  [alerts],
  (alerts) => alerts.slice(0).sort((alertA, alertB) => {
    const orderA = constants.ALERT_STATUS[alertA.status].order
    const orderB = constants.ALERT_STATUS[alertB.status].order

    if (orderA < orderB) {
      return -1
    } else if (orderA > orderB) {
      return 1
    }
    return 0
  })
)

export const select = {
  alerts,
  sortedAlerts
}
