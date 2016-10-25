import React, {Component, PropTypes as T} from 'react'
import get from 'lodash/get'
import {t, tex} from './../lib/translate'
import {notBlank} from './../lib/validate'
import {makeId} from './../util'
import {HINT_ADD, HINT_CHANGE, HINT_REMOVE} from './../actions'
import {FormGroup} from './form/form-group.jsx'
import {Textarea} from './form/textarea.jsx'
import {SubSection} from './form/sub-section.jsx'

// TODO: add categories, objects, resources, define-as-model

const Metadata = props =>
  <fieldset>
    <FormGroup
      controlId={`item-${props.item.id}-title`}
      label={t('title')}
    >
      <input
        id={`item-${props.item.id}-title`}
        type="text"
        value={props.item.title || ''}
        className="form-control"
        onChange={e => props.onChange({title: e.target.value})}
      />
    </FormGroup>
    <FormGroup
      controlId={`item-${props.item.id}-description`}
      label={t('description')}
    >
      <Textarea
        id={`item-${props.item.id}-description`}
        content={props.item.description || ''}
        onChange={description => props.onChange({description})}
      />
    </FormGroup>
    <FormGroup
      controlId={`item-${props.item.id}-instruction`}
      label={tex('instruction')}
    >
      <Textarea
        id={`item-${props.item.id}-instruction`}
        content={props.item.instruction || ''}
        onChange={instruction => props.onChange({instruction})}
      />
    </FormGroup>
    <FormGroup
      controlId={`item-${props.item.id}-info`}
      label={tex('additional_info')}
    >
      <Textarea
        id={`item-${props.item.id}-info`}
        content={props.item.info || ''}
        onChange={info => props.onChange({info})}
      />
    </FormGroup>
  </fieldset>

Metadata.propTypes = {
  item: T.shape({
    id: T.string.isRequired,
    title: T.string.isRequired,
    description: T.string.isRequired,
    instruction: T.string.isRequired,
    info: T.string.isRequired
  }).isRequired,
  onChange: T.func.isRequired
}

const Hint = props =>
  <div className="hint-item">
    <div className="hint-value">
      <Textarea
        id={`hint-${props.id}`}
        title={tex('hint')}
        content={props.data}
        onChange={data => props.onChange(HINT_CHANGE, {id: props.id, data})}
      />
    </div>
    <input
      id={`hint-${props.id}-penalty`}
      title={tex('penalty')}
      type="number"
      min="0"
      value={props.penalty}
      className="form-control hint-penalty"
      title={tex('penalty')}
      aria-label={tex('penalty')}
      onChange={e => props.onChange(
        HINT_CHANGE,
        {id: props.id, penalty: e.target.value}
      )}
    />
    <span
      role="button"
      title={t('delete')}
      aria-label={t('delete')}
      className="fa fa-trash-o"
      onClick={props.onRemove}
    />
  </div>

Hint.propTypes = {
  id: T.string.isRequired,
  data: T.string.isRequired,
  penalty: T.number.isRequired,
  onChange: T.func.isRequired,
  onRemove: T.func.isRequired
}

const Hints = props =>
  <div className="hint-items">
    <label className="control-label" htmlFor="hint-list">
      {tex('hints')}
    </label>
    {props.hints.length === 0 &&
      <div className="no-hint-info">{tex('no_hint_info')}</div>
    }
    <ul id="hint-list">
      {props.hints.map((hint, index) =>
        <li key={hint.id}>
          <Hint
            {...hint}
            onChange={props.onChange}
            onRemove={() => props.onChange(HINT_REMOVE, {id: hint.id})}
          />
        </li>
      )}
      <div className="footer">
        <button
          type="button"
          className="btn btn-default"
          onClick={() => props.onChange(HINT_ADD, {})}
        >
          <span className="fa fa-plus"/>
          {tex('add_hint')}
        </button>
      </div>
    </ul>
  </div>

Hints.propTypes = {
  hints: T.arrayOf(T.shape({
    id: T.string.isRequired
  })).isRequired,
  onChange: T.func.isRequired
}

export class ItemForm extends Component {
  constructor(props) {
    super(props)
    this.state = {
      metaHidden: true,
      feedbackHidden: true
    }
  }

  render() {
    return (
      <form>
        <FormGroup
          controlId={`item-${this.props.id}-content`}
          label={tex('question')}
          error={get(this.props.item, '_errors.content')}
        >
          <Textarea
            id={`item-${this.props.id}-content`}
            content={this.props.item.content}
            onChange={content => this.props.onChange({content})}
          />
        </FormGroup>
        <SubSection
          hidden={this.state.metaHidden}
          showText={tex('show_metadata_fields')}
          hideText={tex('hide_metadata_fields')}
          toggle={() => this.setState({metaHidden: !this.state.metaHidden})}
        >
          <Metadata item={this.props.item} onChange={this.props.onChange}/>
        </SubSection>
        <hr/>
        {this.props.children}
        <hr/>
        <SubSection
          hidden={this.state.feedbackHidden}
          showText={tex('show_interact_fields')}
          hideText={tex('hide_interact_fields')}
          toggle={() => this.setState({feedbackHidden: !this.state.feedbackHidden})}
        >
          <fieldset>
            <Hints
              hints={this.props.item.hints}
              onChange={this.props.onHintsChange}
            />
            <hr/>
            <FormGroup
              controlId={`item-${this.props.item.id}-feedback`}
              label={tex('feedback')}
            >
              <Textarea
                id={`item-${this.props.item.id}-feedback`}
                content={this.props.item.feedback}
                onChange={feedback => this.props.onChange({feedback})}
              />
            </FormGroup>
          </fieldset>
        </SubSection>
      </form>
    )
  }
}

ItemForm.propTypes = {
  item: T.shape({
    id: T.string.isRequired,
    content: T.string.isRequired,
    hints: T.arrayOf(T.object).isRequired,
    feedback: T.string.isRequired,
    _errors: T.object
  }).isRequired,
  children: T.oneOfType([T.object, T.array]).isRequired,
  onChange: T.func.isRequired,
  onHintsChange: T.func.isRequired
}
