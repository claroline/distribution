import {connect} from 'react-redux'

import {withRouter} from '#/main/app/router'
import {makeId} from '#/main/core/scaffolding/id'

import {selectors as resourceSelectors} from '#/main/core/resource/store'
import {EditorMenu as EditorMenuComponent} from '#/plugin/path/resources/path/editor/components/menu'
import {actions, selectors} from '#/plugin/path/resources/path/editor/store'

const EditorMenu = withRouter(
  connect(
    (state) => ({
      path: resourceSelectors.path(state),
      steps: selectors.steps(state)
    }),
    (dispatch, ownProps) => ({
      addStep() {
        // generate id now to be able to redirect to new step
        const stepId = makeId()

        dispatch(actions.addStep({id: stepId}, null))

        ownProps.history.push(`${ownProps.path}/edit/${stepId}`)
      }
    })
  )(EditorMenuComponent)
)

export {
  EditorMenu
}
