import React, {PropTypes as T} from 'react'

import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger'
import Tooltip from 'react-bootstrap/lib/Tooltip'

const TooltipElement = props =>
  <OverlayTrigger
    placement={props.position}
    overlay={
      <Tooltip id={props.id}>{props.title}</Tooltip>
    }
  >
    {props.children}
  </OverlayTrigger>

TooltipElement.propTypes = {
  id: T.string.isRequired,
  title: T.string.isRequired,
  children: T.node.isRequired,
  position: T.oneOf(['top', 'right', 'bottom', 'left'])
}

TooltipElement.defaultProps = {
  position: 'top'
}

export {
  TooltipElement
}
