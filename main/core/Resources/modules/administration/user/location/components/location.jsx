import React from 'react'

import {t} from '#/main/core/translation'
import {PageActions, PageAction} from '#/main/core/layout/page/components/page-actions.jsx'
import {makeSaveAction} from '#/main/core/layout/form/containers/form-save.jsx'
import {FormContainer as Form} from '#/main/core/layout/form/containers/form.jsx'

const LocationSaveAction = makeSaveAction('locations.current')(PageAction)

const LocationActions = props =>
  <PageActions>
    <LocationSaveAction />

    <PageAction
      id="location-list"
      icon="fa fa-list"
      title={t('cancel')}
      action="#/locations"
    />
  </PageActions>

const Location = props =>
  <Form
    level={3}
    name="locations.current"
    sections={[
      {
        id: 'general',
        title: t('general'),
        primary: true,
        fields: [
          {
            name: 'name',
            type: 'string',
            label: t('name')
          }
        ]
      }
    ]}
  />

Location.propTypes = {

}

export {
  LocationActions,
  Location
}
