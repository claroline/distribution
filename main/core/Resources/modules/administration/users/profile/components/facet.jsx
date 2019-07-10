import React from 'react'
import {PropTypes as T} from 'prop-types'
import {connect} from 'react-redux'
import omit from 'lodash/omit'

import {trans} from '#/main/app/intl/translation'
import {Button} from '#/main/app/action/components/button'
import {CALLBACK_BUTTON} from '#/main/app/buttons'
import {FormData} from '#/main/app/content/form/containers/data'
import {FormSections, FormSection} from '#/main/app/content/form/components/sections'

import {selectors as baseSelectors} from '#/main/core/administration/users/store'
import {ProfileFacet as ProfileFacetTypes} from '#/main/core/tools/users/components/profile/prop-types'
import {actions, selectors} from '#/main/core/administration/users/profile/store'

const FacetSection = props =>
  <FormSection
    {...omit(props, ['parentIndex', 'index', 'remove'])}
    title={props.title || trans('profile_facet_section')}
    className="embedded-form-section"
    actions={[
      {
        type: CALLBACK_BUTTON,
        icon: 'fa fa-fw fa-trash-o',
        label: trans('delete'),
        callback: props.remove,
        dangerous: true,
        confirm: {
          title: trans('profile_remove_section'),
          message: trans('profile_remove_section_question')
        }
      }
    ]}
  >
    <FormData
      embedded={true}
      level={3}
      name={`${baseSelectors.STORE_NAME}.profile`}
      dataPart={`[${props.parentIndex}].sections[${props.index}]`}
      sections={[
        {
          icon: 'fa fa-fw fa-cog',
          title: trans('general'),
          primary: true,
          fields: [
            {
              name: 'title',
              type: 'string',
              label: trans('title'),
              required: true
            }, {
              name: 'fields',
              type: 'fields',
              label: trans('fields_list'),
              required: true,
              options: {
                placeholder: trans('profile_section_no_field'),
                min: 1
              }
            }
          ]
        }
      ]}
    />
  </FormSection>

FacetSection.propTypes = {
  index: T.number.isRequired,
  parentIndex: T.number.isRequired,
  title: T.string,
  remove: T.func.isRequired
}

const ProfileFacetComponent = props =>
  <FormData
    level={2}
    name={`${baseSelectors.STORE_NAME}.profile`}
    className="profile-facet"
    dataPart={`[${props.index}]`}
    buttons={true}
    target={['apiv2_profile_update']}
    sections={[
      {
        icon: 'fa fa-fw fa-cog',
        title: trans('parameters'),
        fields: [
          {
            name: 'title',
            type: 'string',
            label: trans('title'),
            required: true
          }, {
            name: 'display.creation',
            type: 'boolean',
            label: trans('display_on_create'),
            displayed: !props.facet.meta.main
          }
        ]
      }
    ]}
  >
    {0 < props.facet.sections.length &&
      <FormSections level={2}>
        {props.facet.sections.map((section, sectionIndex) =>
          <FacetSection
            id={section.id}
            key={section.id}
            index={sectionIndex}
            parentIndex={props.index}
            title={section.title}
            remove={() => props.removeSection(props.facet.id, section.id)}
          />
        )}
      </FormSections>
    }

    {0 === props.facet.sections.length &&
      <div className="no-section-info">{trans('profile_facet_no_section')}</div>
    }

    <Button
      type={CALLBACK_BUTTON}
      className="btn btn-block btn-emphasis"
      label={trans('profile_facet_section_add')}
      callback={() => props.addSection(props.facet.id)}
      primary={true}
    />
  </FormData>

ProfileFacetComponent.propTypes = {
  index: T.number.isRequired,
  facet: T.shape(
    ProfileFacetTypes.propTypes
  ).isRequired,
  addSection: T.func.isRequired,
  removeSection: T.func.isRequired
}

ProfileFacetComponent.defaultProps = {
  facet: ProfileFacetTypes.defaultProps
}

const ProfileFacet = connect(
  (state) => ({
    index: selectors.currentFacetIndex(state),
    facet: selectors.currentFacet(state)
  }),
  (dispatch) => ({
    addSection(facetId) {
      dispatch(actions.addSection(facetId))
    },
    removeSection(facetId, sectionId) {
      dispatch(actions.removeSection(facetId, sectionId))
    }
  })
)(ProfileFacetComponent)

export {
  ProfileFacet
}
