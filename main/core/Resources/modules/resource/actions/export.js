import {trans} from '#/main/core/translation'
import {ASYNC_BUTTON} from '#/main/app/buttons'
import {url} from '#/main/app/api'

const action = (resourceNodes) => ({ // todo collection
  name: 'export',
  type: ASYNC_BUTTON,
  icon: 'fa fa-fw fa-download',
  label: trans('export', {}, 'actions'),
  request: {
    url: url(
      ['claro_resource_download'],
      {ids: resourceNodes.map(resourceNode => resourceNode.id)}
    )
  }
})

export {
  action
}
