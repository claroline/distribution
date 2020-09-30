import React from 'react'
import {PropTypes as T} from 'prop-types'
import isEmpty from 'lodash/isEmpty'

import {trans} from '#/main/app/intl/translation'
import {hasPermission} from '#/main/app/security'
import {LINK_BUTTON, URL_BUTTON} from '#/main/app/buttons'
import {ContentLoader} from '#/main/app/content/components/loader'
import {PageFull} from '#/main/app/page/components/full'
import {getToolBreadcrumb, showToolBreadcrumb} from '#/main/core/tool/utils'

import {route} from '#/plugin/cursus/routing'
import {Course as CourseTypes} from '#/plugin/cursus/prop-types'

const CoursePage = (props) => {
  if (isEmpty(props.course)) {
    return (
      <ContentLoader
        size="lg"
        description={trans('training_loading', {}, 'cursus')}
      />
    )
  }

  return (
    <PageFull
      showBreadcrumb={showToolBreadcrumb(props.currentContext.type, props.currentContext.data)}
      path={[].concat(getToolBreadcrumb('trainings', props.currentContext.type, props.currentContext.data), props.path)}
      title={props.course.name}
      subtitle={props.course.code}
      poster={props.course.poster ? props.course.poster.url : undefined}
      toolbar="edit | fullscreen more"
      actions={[
        {
          name: 'edit',
          type: LINK_BUTTON,
          icon: 'fa fa-fw fa-pencil',
          label: trans('edit', {}, 'actions'),
          target: route(props.course) + '/edit',
          displayed: hasPermission('edit', props.course),
          primary: true
        }, {
          name: 'export-pdf',
          type: URL_BUTTON,
          icon: 'fa fa-fw fa-file-pdf-o',
          label: trans('export-pdf', {}, 'actions'),
          displayed: hasPermission('open', props.course),
          group: trans('transfer'),
          target: ['apiv2_cursus_course_download_pdf', {id: props.course.id}]
        }
      ]}

      header={{
        title: `${trans('trainings', {}, 'tools')} - ${props.course.name}`,
        description: props.course.description
      }}
    >
      {props.children}
    </PageFull>
  )
}

CoursePage.propTypes = {
  path: T.array,
  currentContext: T.shape({
    type: T.oneOf(['administration', 'desktop', 'workspace']),
    data: T.object
  }).isRequired,
  primaryAction: T.string,
  actions: T.array,
  course: T.shape(
    CourseTypes.propTypes
  ),
  children: T.any
}

CoursePage.defaultProps = {
  path: []
}

export {
  CoursePage
}
