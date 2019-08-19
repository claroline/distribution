import React from 'react'
import {PropTypes as T} from 'prop-types'
import omit from 'lodash/omit'

import {trans} from '#/main/app/intl/translation'
import {LINK_BUTTON} from '#/main/app/buttons'
import {Toolbar} from '#/main/app/action/components/toolbar'
import {MenuSection} from '#/main/app/layout/menu/components/section'

import {isAdmin as userIsAdmin} from '#/main/app/security/permissions'

const BadgeMenu = (props) =>
  <MenuSection
    {...omit(props, 'path', 'creatable')}
    title={trans('badges', {}, 'tools')}
  >
    <Toolbar
      className="list-group"
      buttonName="list-group-item"
      actions={[
        {
          icon: 'fa fa-user',
          label: trans('my_badges'),
          target: props.path+'/my-badges',
          type: LINK_BUTTON,
          displayed: props.currentContext.type === 'desktop'
        }, {
          icon: 'fa fa-book',
          label: trans('badges'),
          target: props.path+'/badges',
          type: LINK_BUTTON,
          displayed: props.currentContext.type !== 'profile'
        }, {
          icon: 'fa fa-cog',
          label: trans('parameters'),
          type: LINK_BUTTON,
          target: props.path+'/parameters',
          onlyIcon: true,
          //only for admin
          displayed: userIsAdmin()
        }, {
          icon: 'fa fa-book',
          label: trans('profile'),
          type: LINK_BUTTON,
          target: props.path+'/profile/:id',
          displayed: props.currentContext.type === 'profile'
        }
      ]}
    />
  </MenuSection>

BadgeMenu.propTypes = {
  path: T.string,
  authenticated: T.bool.isRequired,
  creatable: T.bool.isRequired,
  currentContext: T.object.isRequired
}

export {
  BadgeMenu
}
