import React, {Component} from 'react'
import {PropTypes as T} from 'prop-types'
import classes from 'classnames'
import merge from 'lodash/merge'

import {trans} from '#/main/app/intl/translation'
import {Heading} from '#/main/core/layout/components/heading'

import {FormActions} from '#/main/app/content/form/components/actions'

// todo : allow submit with enter

const FormWrapper = props => props.embedded ?
  <fieldset id={props.id} className={classes('form data-form', props.className)}>
    {props.children}
  </fieldset>
  :
  <form id={props.id} className={classes('form data-form', props.className)} action="#">
    {props.children}
  </form>

FormWrapper.propTypes = {
  id: T.string,
  className: T.string,
  embedded: T.bool,
  children: T.node.isRequired
}

FormWrapper.defaultProps = {
  embedded: false
}

// TODO : maybe manage ContentMeta display here

class Form extends Component {
  constructor(props) {
    super(props)

    this.warnPendingChanges = this.warnPendingChanges.bind(this)
  }

  warnPendingChanges(e) {
    if (this.props.pendingChanges) {
      // note: this is supposed to be the text displayed in the browser built-in
      // popup (see https://developer.mozilla.org/en-US/docs/Web/API/WindowEventHandlers/onbeforeunload#Example)
      // but it doesn't seem to be actually used in modern browsers. We use it
      // here because a string is needed anyway.
      e.returnValue = trans('unsaved_changes_warning')

      return e.returnValue
    }
  }

  componentDidMount() {
    //check lock
    window.addEventListener('beforeunload', this.warnPendingChanges)
    console.log(this.props.lock)

    if (this.props.lock && this.props.lock.id && this.props.lock.className) {
      this.props.getLock(this.props.lock.className, this.props.lock.id)
    }
  }

  componentWillUnmount() {
    // todo warn also here
    // if client route has changed, it will not trigger before unload
    window.removeEventListener('beforeunload', this.warnPendingChanges)
    //check unlock
  }

  componentDidUpdate() {
    //check lock
    console.log('update')
  }

  render() {
    return (
      <FormWrapper id={this.props.id} embedded={this.props.embedded} className={this.props.className}>
        {this.props.title &&
          <Heading level={this.props.level} displayLevel={this.props.displayLevel}>
            {this.props.title}
          </Heading>
        }

        {this.props.children}

        {(this.props.save || this.props.cancel) &&
          <FormActions
            save={this.props.save ? merge({}, this.props.save, {
              disabled: this.props.disabled || this.props.save.disabled || !(this.props.pendingChanges && (!this.props.validating || this.props.errors))
            }) : undefined}
            cancel={this.props.cancel}
          />
        }
      </FormWrapper>
    )
  }
}

Form.propTypes = {
  id: T.string,
  className: T.string,
  /**
   * Is the form embed into another ?
   *
   * Permits to know if we use a <form> or a <fieldset> tag.
   */
  embedded: T.bool,
  disabled: T.bool,
  level: T.number,
  displayLevel: T.number,
  title: T.string,
  errors: T.bool,
  validating: T.bool,
  pendingChanges: T.bool,
  children: T.node.isRequired,
  lock: T.shape({
    id: T.string.isRequired,
    className: T.string.isRequired
  }),

  getLock: T.func.isRequired,
  setLock: T.func.isRequired,
  unlock: T.func.isRequired,

  /**
   * The save action of the form (if provided, form toolbar will be displayed).
   */
  save: T.shape({
    type: T.string.isRequired,
    disabled: T.bool
    // todo find a way to document custom action type props
  }),

  /**
   * The cancel action of the form (if provided, form toolbar will be displayed).
   */
  cancel: T.shape({
    type: T.string.isRequired,
    disabled: T.bool
    // todo find a way to document custom action type props
  })
}

Form.defaultProps = {
  disabled: false,
  level: 2,
  errors: false,
  validating: false,
  pendingChanges: false
}

export {
  Form
}
