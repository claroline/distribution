import get from 'lodash/get'

import {number} from '#/main/app/intl'
import {trans} from '#/main/core/translation'

const action = (resourceNodes, nodesRefresher) => ({ // todo collection
  name: 'publish',
  type: 'async',
  icon: 'fa fa-fw fa-eye',
  label: trans('publish', {}, 'actions'),
  displayed: -1 !== resourceNodes.findIndex(node => !get(node, 'meta.published')),
  subscript: 1 === resourceNodes.length ? {
    type: 'label',
    status: 'default',
    value: number(get(resourceNodes[0], 'meta.views') || 0, true)
  } : undefined,
  request: {
    type: 'publish',
    url: ['claro_resource_action', {
      resourceType: resourceNodes[0].meta.type,
      action: 'publish',
      id: resourceNodes[0].id
    }],
    request: {
      method: 'PUT'
    },
    success: (response) => nodesRefresher.update([response])
  }
})

export {
  action
}
