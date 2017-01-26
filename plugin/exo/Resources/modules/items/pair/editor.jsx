import React, {Component, PropTypes as T} from 'react'
import get from 'lodash/get'
import classes from 'classnames'
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger'
import Tooltip from 'react-bootstrap/lib/Tooltip'
import {tex, t} from './../../utils/translate'
import {Textarea} from './../../components/form/textarea.jsx'
import {ErrorBlock} from './../../components/form/error-block.jsx'
import {makeDraggable, makeDroppable} from './../../utils/dragAndDrop'
import {TooltipButton} from './../../components/form/tooltip-button.jsx'
import {actions} from './editor'
import {utils} from './utils/utils'


let DropBox = props => {
  return props.connectDropTarget (
     <div className={classes(
       'pair-item-drop-container',
       {'on-hover': props.isOver}
     )}>
       {tex('set_drop_item')}
     </div>
   )
}

DropBox.propTypes = {
  connectDropTarget: T.func.isRequired,
  isOver: T.bool.isRequired,
  onDrop: T.func.isRequired,
  canDrop: T.bool.isRequired,
  object: T.object.isRequired
}

DropBox = makeDroppable(DropBox, 'ITEM')

class Pair extends Component {
  constructor(props) {
    super(props)
    this.state = {
      showFeedback: false
    }
  }

  render() {
    return (
      <div className="pair">
        <label>{`${tex('pair_pair')} ${this.props.index + 1}`}</label>
        <hr/>
        <div className="first-row">
          {this.props.pair.itemIds[0] === -1 ?
            <DropBox object={{pair:this.props.pair, position:0, index:this.props.index}} onDrop={this.props.onDrop} />
            :
            <div className="pair-item">
              <div className="pair-data" dangerouslySetInnerHTML={{__html: utils.getPairItemData(this.props.pair.itemIds[0], this.props.items)}} />
              {this.props.showPins &&
                <TooltipButton
                  id={`pair-${this.props.index}-${this.props.pair.itemIds[0]}-pin-me`}
                  className="fa fa-thumb-tack"
                  title={tex('pair_pin_this_item')}
                  onClick={() => this.setState({showFeedback: !this.state.showFeedback})}
                  />
              }
            </div>
          }

          {this.props.pair.itemIds[1] === -1 ?
            <DropBox object={{pair:this.props.pair, position:1, index:this.props.index}} onDrop={this.props.onDrop} />
            :
            <div className="pair-item">
              <div className="pair-data" dangerouslySetInnerHTML={{__html: utils.getPairItemData(this.props.pair.itemIds[1], this.props.items)}} />

              {this.props.showPins &&
                <TooltipButton
                  id={`pair-${this.props.index}-${this.props.pair.itemIds[1]}-pin-me`}
                  className="fa fa-thumb-tack"
                  title={tex('pair_pin_this_item')}
                  onClick={() => this.setState({showFeedback: !this.state.showFeedback})}
                  />
              }
            </div>
          }
          <div className="right-controls">
            <input
              title={tex('score')}
              type="number"
              className="form-control association-score"
              value={this.props.pair.score}
              onChange={e => this.props.onChange(
                actions.updateAssociation(this.props.pair.itemIds[0], this.props.pair.itemIds[1], 'score', e.target.value)
              )}
            />
            <TooltipButton
              id={`ass-${this.props.pair.itemIds[0]}-${this.props.pair.itemIds[1]}-feedback-toggle`}
              className="fa fa-comments-o"
              title={tex('feedback_answer_check')}
              onClick={() => this.setState({showFeedback: !this.state.showFeedback})}
            />
            <TooltipButton
              id={`ass-${this.props.pair.itemIds[0]}-${this.props.pair.itemIds[1]}-delete`}
              className="fa fa-trash-o"
              title={t('delete')}
              onClick={() => this.props.onChange(
                actions.removeAssociation(this.props.pair.itemIds[0], this.props.pair.itemIds[1]))
              }
            />
          </div>
        </div>
        {this.state.showFeedback &&
          <div className="feedback-container">
            <Textarea
              onChange={(value) => this.props.onChange(
                actions.updateAssociation(this.props.pair.itemIds[0], this.props.pair.itemIds[1], 'feedback', value)
              )}
              id={`${this.props.pair.itemIds[0]}-${this.props.pair.itemIds[1]}-feedback`}
              content={'this.props.association.feedback'}
            />
          </div>
        }
        <div className="pair-option">
          <div className="checkbox">
            <label>
              <input
                type="checkbox"
                checked={this.props.pair.ordered}
                onChange={() => {}}
              />
            {tex('pair_is_ordered')}
            </label>
          </div>
        </div>
      </div>
    )
  }
}

Pair.propTypes = {
  onChange: T.func.isRequired,
  pair: T.object.isRequired,
  onDrop: T.func.isRequired,
  index: T.number.isRequired,
  showPins: T.bool.isRequired,
  items: T.arrayOf(T.object).isRequired
}


class PairList extends Component {

  constructor(props) {
    super(props)
    this.state = {
      pinIsAllowed: false
    }
  }

  /**
   * handle item drop
   * @var {source} source (source.item is the object that has been dropped)
   * @var {target} target (target.object is the pair and the position where the item has been dropped  (0 / 1) and the solution index)
   */
  onItemDrop(source, target){
    // target.object is the pair and the position where the item has been dropped  (0 / 1) and the solution index
    // source.item is the object that has been dropped
    if(utils.canAddSolution(this.props.solutions, target.object, source.item)) {
      this.props.onChange(actions.updatePairItem(target.object, source.item))
    }
  }

  render(){
    return (
      <div className="pairs">
        <div className="checkbox">
          <label>
            <input
              type="checkbox"
              checked={this.state.pinIsAllowed}
              onChange={() => this.setState({pinIsAllowed: !this.state.pinIsAllowed})}
            />
          {tex('pair_allow_pin_function')}
          </label>
        </div>
        <hr/>
        <ul>
          {utils.getRealSolutionList(this.props.solutions).map((pair, index) =>
            <li key={`pair-${index}`}>
              <Pair
                pair={pair}
                onDrop={(source, target) => this.onItemDrop(source, target)}
                onChange={this.props.onChange}
                index={index}
                showPins={this.state.pinIsAllowed}
                items={this.props.items}
              />
            </li>
          )}
        </ul>
        <div className="footer text-center">
          <button
            type="button"
            className="btn btn-default"
            onClick={() => this.props.onChange(actions.addPair())}
          >
            <span className="fa fa-plus"/>
            {tex('pair_add_pair')}
          </button>
        </div>
      </div>
    )
  }
}

PairList.propTypes = {
  onChange: T.func.isRequired,
  items: T.arrayOf(T.object).isRequired,
  solutions: T.arrayOf(T.object).isRequired
}

class Odd extends Component {

  constructor(props) {
    super(props)
    this.state = {
      showFeedback: false
    }
  }

  render(){
    return (
      <div className="item negative-score">
        <div className="text-fields">
          <Textarea
            onChange={(value) => this.props.onChange(
              actions.updateItem(this.props.odd.id, 'data', value, true)
            )}
            id={`odd-${this.props.odd.id}-data`}
            content={this.props.odd.data}
          />
          {this.state.showFeedback &&
            <div className="feedback-container">
              <Textarea
                onChange={ (value) => this.props.onChange(
                  actions.updateItem(this.props.odd.id, 'feedback', value, true)
                )}
                id={`odd-${this.props.odd.id}-feedback`}
                content={this.props.solution.feedback}
              />
            </div>
          }
        </div>
        <div className="right-controls">
          <input
            title={tex('score')}
            type="number"
            max="0"
            className="form-control odd-score"
            value={this.props.solution.score}
            onChange={e => this.props.onChange(
              actions.updateItem(this.props.odd.id, 'score', e.target.value, true)
            )}
          />
          <TooltipButton
            id={`odd-${this.props.odd.id}-feedback-toggle`}
            className="fa fa-comments-o"
            title={tex('feedback_answer_check')}
            onClick={() => this.setState({showFeedback: !this.state.showFeedback})}
          />
          <TooltipButton
            id={`odd-${this.props.odd.id}-delete`}
            className="fa fa-trash-o"
            title={t('delete')}
            onClick={() => this.props.onChange(actions.removeItem(this.props.odd.id, true))}
          />
        </div>
      </div>
    )
  }
}

Odd.propTypes = {
  onChange: T.func.isRequired,
  odd: T.object.isRequired,
  solution: T.object.isRequired
}

const OddList= props => {

  return (
    <div className="odd-list">
      <ul>
        { utils.getOddlist(props.items, props.solutions).map((oddItem, index) =>
          <li key={`odd-${index}-${oddItem.id}`}>
            <Odd onChange={props.onChange} odd={oddItem} solution={utils.getOddSolution(oddItem, props.solutions)}/>
          </li>
        )}
      </ul>
      <div className="footer text-center">
        <button
          type="button"
          className="btn btn-default"
          onClick={() => props.onChange(actions.addItem(true))}
        >
          <span className="fa fa-plus"/>
          {tex('set_add_odd')}
        </button>
      </div>
    </div>
  )
}

OddList.propTypes = {
  onChange: T.func.isRequired,
  items: T.arrayOf(T.object).isRequired,
  solutions: T.arrayOf(T.object).isRequired
}

let Item = props => {
  return props.connectDragPreview (
    <div className="item">
      <div className="text-fields">
        <Textarea
          onChange={(value) => props.onChange(
            actions.updateItem(props.item.id, 'data', value, false)
          )}
          id={`${props.item.id}-data`}
          content={props.item.data}
        />
      </div>
      <div className="right-controls">
        <TooltipButton
          id={`set-item-${props.item.id}-delete`}
          className="fa fa-trash-o"
          title={t('delete')}
          enabled={props.item._deletable}
          onClick={() => props.onChange(
             actions.removeItem(props.item.id, false)
          )}
        />
        {props.connectDragSource(
          <div>
            <OverlayTrigger
              placement="top"
              overlay={
                <Tooltip id={`item-${props.item.id}-drag`}>{t('move')}</Tooltip>
              }>
              <span
                title={t('move')}
                draggable="true"
                className={classes(
                  'tooltiped-button',
                  'btn',
                  'fa',
                  'fa-bars',
                  'drag-handle'
                )}
              />
            </OverlayTrigger>
          </div>
        )}
      </div>
    </div>
  )
}

Item.propTypes = {
  onChange: T.func.isRequired,
  connectDragSource: T.func.isRequired,
  connectDragPreview: T.func.isRequired,
  item: T.object.isRequired
}

Item = makeDraggable(Item, 'ITEM')

const ItemList = props => {
  return (
    <div className="item-list">
      <ul>
        { utils.getRealItemlist(props.items, props.solutions).map((item) =>
          <li key={item.id}>
            <Item onChange={props.onChange} item={item}/>
          </li>
        )}
      </ul>
      <div className="footer text-center">
        <button
          type="button"
          className="btn btn-default"
          onClick={() => props.onChange(actions.addItem(false))}
        >
          <span className="fa fa-plus"/>
          {tex('set_add_item')}
        </button>
      </div>
    </div>
  )
}

ItemList.propTypes = {
  items:  T.arrayOf(T.object).isRequired,
  onChange: T.func.isRequired,
  solutions: T.arrayOf(T.object).isRequired
}

const PairForm = (props) => {
  return(
    <div className="pair-editor">
      {get(props.item, '_errors.item') &&
        <ErrorBlock text={props.item._errors.item} warnOnly={!props.validating}/>
      }
      {get(props.item, '_errors.items') &&
        <ErrorBlock text={props.item._errors.items} warnOnly={!props.validating}/>
      }
      {get(props.item, '_errors.solutions') &&
        <ErrorBlock text={props.item._errors.solutions} warnOnly={!props.validating}/>
      }
      {get(props.item, '_errors.odd') &&
        <ErrorBlock text={props.item._errors.odd} warnOnly={!props.validating}/>
      }
      <div className="form-group">
        <label htmlFor="pair-penalty">{tex('pair_penalty_label')}</label>
        <input
          id="pair-penalty"
          className="form-control"
          value={props.item.penalty}
          type="number"
          min="0"
          onChange={e => props.onChange(
             actions.updateProperty('penalty', e.target.value)
          )}
        />
      </div>
      <div className="checkbox">
        <label>
          <input
            type="checkbox"
            checked={props.item.random}
            onChange={e => props.onChange(
              actions.updateProperty('random', e.target.checked)
            )}
          />
        {tex('pair_shuffle_pairs')}
        </label>
      </div>
      <hr/>
      <div className="row pair-builder-container">
        <div className="col-md-5 items-col">
          <ItemList onChange={props.onChange} solutions={props.item.solutions} items={props.item.items}/>
          <hr/>
          <OddList onChange={props.onChange} solutions={props.item.solutions} items={props.item.items}/>
        </div>
        <div className="col-md-7 pairs-col">
          <PairList solutions={props.item.solutions} items={props.item.items} onChange={props.onChange}/>
        </div>
      </div>
    </div>
  )
}

PairForm.propTypes = {
  item: T.shape({
    id: T.string.isRequired,
    random: T.bool.isRequired,
    penalty: T.number.isRequired,
    items: T.arrayOf(T.object).isRequired,
    solutions: T.arrayOf(T.object).isRequired,
    _errors: T.object
  }).isRequired,
  validating: T.bool.isRequired,
  onChange: T.func.isRequired
}

export {PairForm}
