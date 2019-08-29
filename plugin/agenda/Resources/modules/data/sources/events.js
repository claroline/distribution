import {URL_BUTTON} from '#/main/app/buttons'

import {trans} from '#/main/app/intl/translation'

import {route} from '#/main/core/workspace/routing'
import {EventCard} from '#/plugin/agenda/data/components/event-card'

export default {
  name: 'events',
  parameters: {
    primaryAction: (event) => ({
      type: URL_BUTTON,
      target: `#${route(event.workspace, 'agenda_')}`
    }),
    definition: [
      {
        name: 'title',
        type: 'string',
        label: trans('title'),
        displayed: true,
        primary: true
      }, {
        name: 'description',
        type: 'html',
        label: trans('description'),
        displayed: true
      }, {
        name: 'allDay',
        type: 'boolean',
        label: trans('all_day', {}, 'agenda'),
        displayed: true
      }, {
        name: 'start',
        type: 'date',
        label: trans('start_date'),
        displayed: true
      }, {
        name: 'notDoneYet',
        type: 'boolean',
        label: trans('not_done_yet'),
        displayed: false,
        displayable: false,
        filterable: true,
        sortable: false
      }, {
        name: 'workspace.code',
        type: 'string',
        label: trans('workspace'),
        displayed: true,
        filterable: false,
        sortable: false
      }
    ],
    card: EventCard
  }
}
