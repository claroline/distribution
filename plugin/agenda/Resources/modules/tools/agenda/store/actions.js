import {makeActionCreator} from '#/main/app/store/actions'

import {API_REQUEST, url} from '#/main/app/api'
import {getApiFormat} from '#/main/app/intl/date'

export const AGENDA_CHANGE_VIEW      = 'AGENDA_CHANGE_VIEW'
export const AGENDA_CHANGE_REFERENCE = 'AGENDA_CHANGE_REFERENCE'
export const AGENDA_LOAD_EVENTS      = 'AGENDA_LOAD_EVENTS'

export const actions = {}

actions.changeView = makeActionCreator(AGENDA_CHANGE_VIEW, 'view')
actions.changeReference = makeActionCreator(AGENDA_CHANGE_REFERENCE, 'referenceDate')

actions.loadEvents = makeActionCreator(AGENDA_LOAD_EVENTS, 'events')
actions.fetchEvents = (rangeDates) => ({
  [API_REQUEST]: {
    url: url(['apiv2_event_list'], {
      start: rangeDates[0].format(getApiFormat()),
      end: rangeDates[1].format(getApiFormat())
    }),
    success: (response, dispatch) => dispatch(actions.loadEvents(response))
  }
})












export const AGENDA_UPDATE_FILTER_TYPE = 'AGENDA_UPDATE_FILTER_TYPE'
export const AGENDA_UPDATE_FILTER_WORKSPACE = 'AGENDA_UPDATE_FILTER_WORKSPACE'

actions.updateFilterType = makeActionCreator(AGENDA_UPDATE_FILTER_TYPE, 'filters')
actions.updateFilterWorkspace = makeActionCreator(AGENDA_UPDATE_FILTER_WORKSPACE, 'filters')

//calendarElement is required to refresh the calendar since it's outside react
actions.create = (event, workspace, calendarRef) => ({
  [API_REQUEST]: {
    url: ['apiv2_event_create'],
    request: {
      body: JSON.stringify(Object.assign({}, event, {workspace})),
      method: 'POST'
    },
    success: (data) => {
      calendarRef.fullCalendar('renderEvent', data)
    }
  }
})

actions.update = (event, calendarRef) => ({
  [API_REQUEST]: {
    url: ['apiv2_event_update', {id: event.id}],
    request: {
      body: JSON.stringify(event),
      method: 'PUT'
    },
    success: (data) => {
      calendarRef.fullCalendar('removeEvents', data.id)
      calendarRef.fullCalendar('renderEvent', data)
    }
  }
})

actions.delete = (event, calendarRef) => ({
  [API_REQUEST]: {
    url: ['apiv2_event_delete_bulk', {ids: [event.id]}],
    request: {
      method: 'DELETE'
    },
    success: () => {
      calendarRef.fullCalendar('removeEvents', event.id)
    }
  }
})

actions.import = (data, workspace = null, calendarRef) => ({
  [API_REQUEST]: {
    url: ['apiv2_event_import'],
    request: {
      body :JSON.stringify({
        file: { id: data.file.id },
        workspace: { id: workspace.id || null }
      }),
      method: 'POST'
    },
    success: (events) => {
      calendarRef.fullCalendar('addEventSource', events)
      calendarRef.fullCalendar('refetchEvents')
    }
  }
})
