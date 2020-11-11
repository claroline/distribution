import React, {Fragment} from 'react'
import {PropTypes as T} from 'prop-types'

import {trans} from '#/main/app/intl/translation'
import {LINK_BUTTON} from '#/main/app/buttons'
import {ContentTitle} from '#/main/app/content/components/title'
import {FormData} from '#/main/app/content/form/containers/data'

import {Room as RoomTypes} from '#/plugin/booking/prop-types'
import {selectors} from '#/plugin/booking/tools/booking/room/store/selectors'

const RoomForm = (props) =>
  <Fragment>
    <ContentTitle
      backAction={{
        type: LINK_BUTTON,
        label: trans('back'),
        target: props.path+'/rooms',
        exact: true
      }}
      title={props.room && props.room.id ? props.room.name : trans('new_room', {}, 'booking')}
    />

    <FormData
      name={selectors.FORM_NAME}
      buttons={true}
      target={(data, isNew) => isNew ?
        ['apiv2_booking_room_create'] :
        ['apiv2_booking_room_update', {id: data.id}]
      }
      cancel={{
        type: LINK_BUTTON,
        target: props.path+'/rooms' + (props.room && props.room.id ? '/'+props.room.id : ''),
        exact: true
      }}
      sections={[
        {
          title: trans('general'),
          primary: true,
          fields: [
            {
              name: 'name',
              type: 'string',
              label: trans('name'),
              required: true
            }, {
              name: 'code',
              type: 'string',
              label: trans('code'),
              required: true
            }, {
              name: 'capacity',
              type: 'number',
              label: trans('capacity'),
              required: true,
              options: {
                min: 0
              }
            }
          ]
        }, {
          icon: 'fa fa-fw fa-info',
          title: trans('information'),
          fields: [
            {
              name: 'description',
              type: 'html',
              label: trans('description')
            }, {
              name: 'organizations',
              type: 'organizations',
              label: trans('organizations')
            }
          ]
        }, {
          icon: 'fa fa-fw fa-desktop',
          title: trans('display_parameters'),
          fields: [
            {
              name: 'poster',
              type: 'image',
              label: trans('poster')
            }, {
              name: 'thumbnail',
              type: 'image',
              label: trans('thumbnail')
            }
          ]
        }
      ]}
    />
  </Fragment>

RoomForm.propTypes = {
  path: T.string.isRequired,
  room: T.shape(
    RoomTypes.propTypes
  )
}

export {
  RoomForm
}
