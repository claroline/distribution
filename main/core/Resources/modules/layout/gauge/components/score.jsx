import React from 'react'
import classes from 'classnames'

import {PropTypes as T, implementPropTypes} from '#/main/app/prop-types'

import {constants} from '#/main/core/layout/gauge/constants'
import {Gauge as GaugeTypes} from '#/main/core/layout/gauge/prop-types'
import {
  GaugeContainer,
  GaugeBorder,
  GaugeText
} from '#/main/core/layout/gauge/components/gauge'

const ScoreGauge = props => {
  const radius = Math.min(parseInt(props.width), parseInt(props.height)) / 2
  const fillPercent = props.total ? (props.value / props.total) * 100 : 100

  const circleThickness = constants.GAUGE_BORDER_THICKNESS * radius
  const circleFillGap = constants.GAUGE_BORDER_GAP * radius
  const fillCircleMargin = circleThickness + circleFillGap

  return (
    <GaugeContainer
      className={classes('score-gauge', props.className)}
      type={props.type}
      width={parseInt(props.width)}
      height={parseInt(props.height)}
      radius={radius}
    >
      <GaugeBorder
        radius={radius}
        thickness={circleThickness}
        filling={fillPercent}
        preFilled={props.preFilled || !props.total}
      />

      <GaugeText
        className="gauge-text"
        value={props.value}
        displayValue={props.displayValue}
        margin={fillCircleMargin}
        radius={radius}
        preFilled={props.preFilled}
      />

      <GaugeText
        className="gauge-text"
        value={props.total}
        displayValue={props.displayValue}
        margin={fillCircleMargin}
        radius={radius}
        preFilled={props.preFilled}
      />

    </GaugeContainer>
  )
}

implementPropTypes(ScoreGauge, GaugeTypes, {
  total: T.number.isRequired
})

export {
  ScoreGauge
}
