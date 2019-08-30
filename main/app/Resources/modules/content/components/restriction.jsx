import React, {Component, Fragment}from 'react'
import {PropTypes as T} from 'prop-types'
import classes from 'classnames'

import {trans} from '#/main/app/intl/translation'
import {Button} from '#/main/app/action'
import {CALLBACK_BUTTON} from '#/main/app/buttons'
import {PasswordInput} from '#/main/app/data/types/password/components/input'
import {ContentHelp} from '#/main/app/content/components/help'
import {EmptyPlaceholder} from '#/main/core/layout/components/placeholder'

const ContentRestriction = props => {
  let title, help
  if (props.failed) {
    title = props.fail.title
    help = props.fail.help
  } else {
    title = props.success.title
    help = props.success.help
  }

  return (
    <div className={classes('access-restriction alert alert-detailed', {
      'alert-success': !props.failed,
      'alert-warning': props.failed && props.onlyWarn,
      'alert-danger': props.failed && !props.onlyWarn
    })}>
      <span className={classes('alert-icon', props.icon)} />

      <div className="alert-content">
        <h5 className="alert-title h4">{title}</h5>

        {help &&
        <p className="alert-text">{help}</p>
        }

        {props.failed && props.children}
      </div>
    </div>
  )
}

ContentRestriction.propTypes = {
  icon: T.string.isRequired,
  success: T.shape({
    title: T.string.isRequired,
    help: T.string
  }).isRequired,
  fail: T.shape({
    title: T.string.isRequired,
    help: T.string
  }).isRequired,
  failed: T.bool.isRequired,
  onlyWarn: T.bool, // we only warn for restrictions that can be fixed
  children: T.node
}

ContentRestriction.defaultProps = {
  validated: false,
  onlyWarn: false
}

export {
  ContentRestriction
}
