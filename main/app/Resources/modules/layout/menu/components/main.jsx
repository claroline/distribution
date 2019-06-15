import React from 'react'
import {PropTypes as T} from 'prop-types'

import {trans} from '#/main/app/intl/translation'
import {Button} from '#/main/app/action/components/button'
import {Toolbar} from '#/main/app/action/components/toolbar'
import {Action as ActionTypes} from '#/main/app/action/prop-types'
import {LINK_BUTTON} from '#/main/app/buttons'

import {MenuSection} from '#/main/app/layout/menu/components/section'

const MenuMain = props =>
  <aside className="app-menu">
    <header className="app-menu-header">
      {props.backAction &&
        <Button
          {...props.backAction}
          className="app-menu-back"
          icon="fa fa-angle-double-left"
          tooltip="right"
        />
      }

      {props.title &&
        <h1 className="app-menu-title h5">{props.title}</h1>
      }
    </header>

    {props.children}

    {0 !== props.tools.length &&
      <MenuSection
        className="tools"
        icon="fa fa-fw fa-tools"
        title={trans('tools')}
        opened={'tools' === props.section}
        toggle={() => props.changeSection('tools')}
      >
        <Toolbar
          className="list-group"
          buttonName="list-group-item"
          actions={props.tools.map((tool) => ({
            name: tool.name,
            type: LINK_BUTTON,
            icon: `fa fa-fw fa-${tool.icon}`,
            label: trans(tool.name, {}, 'tools'),
            target: `/desktop/${tool.name}`
          }))}
        />
      </MenuSection>
    }

    {0 !== props.actions.length &&
      <MenuSection
        className="actions"
        icon="fa fa-fw fa-ellipsis-v"
        title={trans('more')}
        opened={'actions' === props.section}
        toggle={() => props.changeSection('actions')}
      >
        <Toolbar
          className="list-group"
          buttonName="list-group-item"
          actions={props.actions}
        />
      </MenuSection>
    }
  </aside>


MenuMain.propTypes = {
  title: T.string,
  backAction: T.shape(ActionTypes.propTypes),

  tools: T.arrayOf(T.shape({

  })),
  actions: T.arrayOf(T.shape({

  })),

  children: T.node,

  section: T.oneOf(['tool', 'history', 'tools', 'actions']),
  changeSection: T.func.isRequired
}

MenuMain.defaultProps = {
  tools: [],
  actions: []
}

export {
  MenuMain
}
