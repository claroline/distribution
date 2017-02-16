import React, {PropTypes as T} from 'react'
import {Metadata as ItemMetadata} from './../../../items/components/metadata.jsx'

const ContentItemPlayer = props =>
  <div className="item-player">
    {props.item.title &&
      <h3 className="item-title">{props.item.title}</h3>
    }
    <ItemMetadata item={props.item} isContentItem={true} />
    <hr/>
    {props.children}
  </div>

ContentItemPlayer.propTypes = {
  item: T.shape({
    id: T.string.isRequired,
    title: T.string,
    description: T.string.isRequired,
  }).isRequired,
  children: T.node.isRequired
}

export {ContentItemPlayer}
