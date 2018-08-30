import React from 'react'
import {connect} from 'react-redux'
import classes from 'classnames'
import omit from 'lodash/omit'

import {PropTypes as T, implementPropTypes} from '#/main/app/prop-types'
import {
  NavLink,
  withRouter,
  matchPath} from '#/main/app/router'

import {Button as ButtonTypes} from '#/main/app/buttons/prop-types'

// todo implement confirm behavior

/**
 * Link button.
 * Renders a component that will navigate user in the current app on click.
 *
 * @param props
 * @constructor
 */
const LinkButton = withRouter(props => {
  // disable button if location is target
  let disableLink = false
  if (matchPath(props.location.pathname, {path: props.target, exact: true})) {
    disableLink = true
  } else {
    disableLink = false
  }

  return(
    <NavLink
      {...omit(props, 'displayed', 'primary', 'dangerous', 'size', 'target', 'confirm', 'history', 'match', 'staticContext')}
      tabIndex={props.tabIndex}
      to={props.target}
      exact={props.exact}
      disabled={props.disabled || disableLink}
      className={classes(
        props.className,
        props.size && `btn-${props.size}`,
        {
          disabled: props.disabled,
          default: !props.primary && !props.dangerous,
          primary: props.primary,
          danger: props.dangerous,
          active: props.active
        }
      )}
    >
      {props.children}
    </NavLink>
  )
})

implementPropTypes(LinkButton, ButtonTypes, {
  target: T.string,
  exact: T.bool
}, {
  exact: false
})

export {
  LinkButton
}
