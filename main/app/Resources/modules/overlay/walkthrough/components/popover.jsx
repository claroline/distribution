import React from 'react'
import {PropTypes as T} from 'prop-types'
import classes from 'classnames'

import {trans} from '#/main/core/translation'
import {toKey} from '#/main/core/scaffolding/text/utils'
import {CallbackButton} from '#/main/app/buttons/callback/components/button'
import {Popover} from '#/main/app/overlay/popover/components/popover'
import {ProgressBar} from '#/main/core/layout/components/progress-bar'

// todo : manage icon components

const WalkThroughPopover = props =>
  <Popover
    id={toKey(props.title || props.message)}
    placement={props.placement}
    className={classes('walkthrough-popover', props.className)}
    positionLeft={props.positionLeft}
    positionTop={props.positionTop}
  >
    <ProgressBar value={props.progression} size="xs" />

    {props.icon &&
      <span className={classes('walkthrough-icon', props.icon)} />
    }

    <div className="walkthrough-content">
      {props.title &&
        <h3 className="walkthrough-title">{props.title}</h3>
      }

      {props.message}

      {props.link &&
        <a className="walkthrough-link pull-right" href={props.link}>{trans('learn-more', {}, 'actions')}</a>
      }
    </div>

    {props.requiredInteraction &&
      <div className="walkthrough-interaction">
        <span className="fa fa-fw fa-hand-pointer icon-with-text-right" />
        {props.requiredInteraction.message}
      </div>
    }

    <div className="walkthrough-actions">
      {props.hasNext &&
        <CallbackButton
          className="btn-link btn-skip"
          callback={props.skip}
          primary={true}
          size="sm"
        >
          {trans('skip', {}, 'actions')}
        </CallbackButton>
      }

      {!props.hasNext &&
        <CallbackButton
          className="btn-link btn-restart"
          callback={props.restart}
          primary={true}
          size="sm"
        >
          {trans('restart', {}, 'actions')}
        </CallbackButton>
      }

      <CallbackButton
        className="btn-link btn-previous"
        callback={props.previous}
        disabled={!props.hasPrevious}
        size="sm"
      >
        <span className="fa fa-angle-double-left" />
        <span className="sr-only">{trans('previous')}</span>
      </CallbackButton>

      <CallbackButton
        className="btn btn-next"
        callback={props.next}
        primary={true}
        size="sm"
      >
        {props.hasNext ? trans('next') : trans('finish', {}, 'actions')}

        {props.hasNext &&
          <span className="fa fa-angle-double-right icon-with-text-left"/>
        }
      </CallbackButton>
    </div>
  </Popover>

WalkThroughPopover.propTypes = {
  className: T.string,
  progression: T.number,

  // position
  placement: T.oneOf(['left', 'top', 'right', 'bottom']),
  positionLeft: T.number,
  positionTop: T.number,

  // content
  icon: T.oneOfType([T.string, T.element]),
  title: T.string,
  message: T.string.isRequired,
  link: T.string,

  // interaction
  requiredInteraction: T.shape({
    type: T.oneOf(['click']),
    target: T.string.isRequired,
    message: T.string.isRequired
  }),

  // navigation
  hasPrevious: T.bool.isRequired,
  hasNext: T.bool.isRequired,
  skip: T.func.isRequired,
  previous: T.func.isRequired,
  next: T.func.isRequired,
  restart: T.func.isRequired
}

WalkThroughPopover.defaultProps = {
  progression: 0,
  placement: 'bottom'
}

export {
  WalkThroughPopover
}
