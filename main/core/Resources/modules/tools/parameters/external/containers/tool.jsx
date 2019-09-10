import {connect} from 'react-redux'

import {withReducer} from '#/main/app/store/components/withReducer'

import {ExternalTool as ExternalToolComponent} from '#/main/core/tools/parameters/external/components/tool'
import {actions, reducer, selectors} from '#/main/core/tools/parameters/external/store/actions'

const ExternalTool = withReducer(selectors.STORE_NAME, reducer)(
  connect(
    (state) => ({

    }),
    (dispatch) => ({

    })
  )(ExternalToolComponent)
)

export {
  ExternalTool
}
