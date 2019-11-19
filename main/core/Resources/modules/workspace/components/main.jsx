import React, {Component} from 'react'
import {PropTypes as T} from 'prop-types'
import isEmpty from 'lodash/isEmpty'

import {trans} from '#/main/app/intl/translation'
import {Routes} from '#/main/app/router'
import {Button} from '#/main/app/action/components/button'
import {LINK_BUTTON} from '#/main/app/buttons'
import {ContentLoader} from '#/main/app/content/components/loader'
import {ContentNotFound} from '#/main/app/content/components/not-found'

import {ToolMain} from '#/main/core/tool/containers/main'
import {route as toolRoute} from '#/main/core/tool/routing'
import {Workspace as WorkspaceTypes} from '#/main/core/workspace/prop-types'
import {WorkspaceRestrictions} from '#/main/core/workspace/components/restrictions'
import {route as workspaceRoute} from '#/main/core/workspace/routing'

class WorkspaceMain extends Component {
  componentDidUpdate(prevProps) {
    if (!this.props.notFound && prevProps.workspace && this.props.workspace && this.props.workspace.slug !== prevProps.workspace.slug) {
      this.props.close(prevProps.workspace.slug)
    }
  }

  componentWillUnmount() {
    if (!this.props.notFound) {
      this.props.close(this.props.workspace.slug)
    }
  }

  render() {
    if (!this.props.loaded) {
      return (
        <ContentLoader
          size="lg"
          description={trans('loading', {}, 'workspace')}
        />
      )
    }

    if (this.props.notFound) {
      return (
        <ContentNotFound
          size="lg"
          title={trans('not_found', {}, 'workspace')}
          description={trans('not_found_desc', {}, 'workspace')}
        >
          <Button
            className="btn btn-emphasis"
            type={LINK_BUTTON}
            label={trans('browse-workspaces', {}, 'actions')}
            target={toolRoute('workspaces')}
            exact={true}
            primary={true}
          />
        </ContentNotFound>
      )
    }

    if (!isEmpty(this.props.accessErrors)) {
      return (
        <WorkspaceRestrictions
          errors={this.props.accessErrors}
          dismiss={this.props.dismissRestrictions}
          authenticated={this.props.authenticated}
          managed={this.props.managed}
          workspace={this.props.workspace}
          checkAccessCode={(code) => this.props.checkAccessCode(this.props.workspace, code)}
          selfRegister={() => this.props.selfRegister(this.props.workspace)}
        />
      )
    }

    if (!isEmpty(this.props.workspace)) {
      return (
        <Routes
          path={workspaceRoute(this.props.workspace)}
          routes={[
            {
              path: '/:toolName',
              onEnter: (params = {}) => {
                if (-1 !== this.props.tools.findIndex(tool => tool.name === params.toolName)) {
                  // tool is enabled for the desktop
                  this.props.openTool(params.toolName, this.props.workspace)
                } else {
                  // tool is disabled (or does not exist) for the desktop
                  // let's go to the default opening of the desktop
                  if (this.props.workspace.opening.type === 'tool') {
                    this.props.openTool(this.props.workspace.opening.target)
                  }
                }
              },
              component: ToolMain
            }
          ]}
          redirect={[
            {from: '/', exact: true, to: `/${this.props.defaultOpening}`, disabled: !this.props.defaultOpening}
          ]}
        />
      )
    }

    return null
  }
}

WorkspaceMain.propTypes = {
  history: T.shape({
    replace: T.func.isRequired
  }).isRequired,
  loaded: T.bool.isRequired,
  notFound: T.bool.isRequired,
  authenticated: T.bool.isRequired,
  managed: T.bool.isRequired,
  workspace: T.shape(
    WorkspaceTypes.propTypes
  ),
  defaultOpening: T.string,
  tools: T.arrayOf(T.shape({

  })),
  openTool: T.func.isRequired,
  accessErrors: T.object,
  dismissRestrictions: T.func.isRequired,
  checkAccessCode: T.func,
  selfRegister: T.func,
  close: T.func
}

WorkspaceMain.defaultProps = {
  tools: []
}

export {
  WorkspaceMain
}
