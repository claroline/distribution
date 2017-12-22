import {generateUrl} from '#/main/core/fos-js-router'
import {API_REQUEST} from '#/main/core/api/actions'
import {actions as listActions} from '#/main/core/data/list/actions'

export const actions = {}

actions.createContacts = (users) => ({
  [API_REQUEST]: {
    url: generateUrl('apiv2_contacts_create') +'?'+ users.map(u => 'ids[]='+u.autoId).join('&'),
    request: {
      method: 'PATCH'
    },
    success: (data, dispatch) => {
      dispatch(listActions.invalidateData('contacts'))
    }
  }
})
