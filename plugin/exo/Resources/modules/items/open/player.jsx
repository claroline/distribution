import React, {PropTypes as T} from 'react'
import {Textarea} from './../../components/form/textarea.jsx'

export const Open = (props) =>
  <div>
    <Textarea
      id={`open-${props.item.id}-data`}
      content={props.answer}
      onChange={(value) => props.onChange(value)}
    />
  </div>

Open.propTypes = {
  item: T.shape({
    id: T.string.isRequired,
    contentType: T.string.isRequired,
    maxLength: T.number.isRequired
  }).isRequired,
  answer: T.string,
  onChange: T.func.isRequired
}

Open.defaultProps = {
  answer: ''
}
