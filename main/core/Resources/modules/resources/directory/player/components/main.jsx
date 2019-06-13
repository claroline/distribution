import React from 'react'
import {PropTypes as T} from 'prop-types'
import merge from 'lodash/merge'

import {trans} from '#/main/app/intl/translation'
import {LINK_BUTTON} from '#/main/app/buttons'
import {getActions, getDefaultAction} from '#/main/core/resource/utils'
import {ListSource} from '#/main/app/content/list/containers/source'
import {ListParameters as ListParametersTypes} from '#/main/app/content/list/parameters/prop-types'
import resourcesSource from '#/main/core/data/sources/resources'

const PlayerMain = props =>
  <ListSource
    name={props.listName}
    fetch={{
      url: ['apiv2_resource_list', {parent: props.id}],
      autoload: true
    }}
    source={merge({}, resourcesSource, {
      // adds actions to source
      parameters: {
        primaryAction: (resourceNode) => getDefaultAction(resourceNode, {
          update: props.updateNodes,
          delete: props.deleteNodes
        }, props.path),
        actions: (resourceNodes) => getActions(resourceNodes, {
          update: props.updateNodes,
          delete: props.deleteNodes
        }, props.path)
      }
    })}
    parameters={props.listConfiguration}
  />

PlayerMain.propTypes = {
  path: T.string,
  id: T.string,
  listName: T.string.isRequired,
  listConfiguration: T.shape(
    ListParametersTypes.propTypes
  ),

  updateNodes: T.func.isRequired,
  deleteNodes: T.func.isRequired
}

export {
  PlayerMain
}
