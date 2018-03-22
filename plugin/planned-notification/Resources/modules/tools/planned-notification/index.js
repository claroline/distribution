import {bootstrap} from '#/main/core/scaffolding/bootstrap'

import {reducer} from '#/plugin/planned-notification/tools/planned-notification/reducer'
import {PlannedNotificationTool} from '#/plugin/planned-notification/tools/planned-notification/components/tool.jsx'

// mount the react application
bootstrap(
  // app DOM container (also holds initial app data as data attributes)
  '.planned-notification-tool-container',

  // app main component (accepts either a `routedApp` or a `ReactComponent`)
  PlannedNotificationTool,

  // app store configuration
  reducer
)