import {UsersTool} from '#/main/core/tools/users/components/tool'
import {UsersMenu} from '#/main/core/tools/users/components/menu'

import {reducer} from '#/main/core/tools/users/store'

/**
 * Workspaces tool application.
 */
export default {
  component: UsersTool,
  menu: UsersMenu,
  store: reducer
}
