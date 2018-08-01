import React from 'react'
import {PropTypes as T} from 'prop-types'
import {connect} from 'react-redux'
import merge from 'lodash/merge'
import isEmpty from 'lodash/isEmpty'

import {trans} from '#/main/core/translation'
import {makeId} from '#/main/core/scaffolding/id'
import {withRouter} from '#/main/app/router'
import {currentUser} from '#/main/core/user/current'
import {
  PageContainer,
  PageHeader,
  PageContent,
  PageActions,
  PageAction,
  PageGroupActions
} from '#/main/core/layout/page'
import {FormContainer} from '#/main/core/data/form/containers/form'
import {actions as formActions} from '#/main/core/data/form/actions'
import {WidgetGridEditor} from '#/main/core/widget/editor/components/grid'
import {WidgetContainer as WidgetContainerTypes} from '#/main/core/widget/prop-types'

import {Tab as TabTypes} from '#/main/core/tools/home/prop-types'
import {selectors} from '#/main/core/tools/home/selectors'
import {selectors as editorSelectors} from '#/main/core/tools/home/editor/selectors'
import {actions as editorActions} from '#/main/core/tools/home/editor/actions'
import {Tabs} from '#/main/core/tools/home/components/tabs'

const EditorComponent = props =>
  <PageContainer>
    <Tabs
      prefix="/edit"
      tabs={props.tabs}
      create={() => props.createTab(props.context, props.tabs.length, props.history.push)}
    />

    <PageHeader
      alignTitle={true === props.currentTab.centerTitle ? 'center' : 'left'}
      title={props.currentTab ? props.currentTab.longTitle : ('desktop' === props.context.type ? trans('desktop') : props.context.data.name)}
      poster={props.currentTab.poster ? props.currentTab.poster.url: undefined}
    >
      <PageActions>
        {1 < props.tabs.length &&
          <PageGroupActions>
            <PageAction
              type="callback"
              label={trans('delete')}
              icon="fa fa-fw fa-trash-o"
              dangerous={true}
              confirm={{
                title: trans('home_tab_delete_confirm_title'),
                message: trans('home_tab_delete_confirm_message')
              }}
              callback={() => props.deleteTab(props.tabs, props.currentTab, props.history.push)}
            />
          </PageGroupActions>
        }

        <PageGroupActions>
          <PageAction
            type="link"
            label={trans('configure', {}, 'actions')}
            icon="fa fa-fw fa-cog"
            target="/edit"
            primary={true}
          />
        </PageGroupActions>
      </PageActions>
    </PageHeader>

    <PageContent>
      <FormContainer
        name="editor"
        dataPart={`[${props.currentTabIndex}]`}
        buttons={true}
        target={['apiv2_home_update', {
          context: props.context.type,
          contextId: props.context.data ? props.context.data.uuid : currentUser().id
        }]}
        cancel={{
          type: 'link',
          target: '/',
          exact: true
        }}
        sections={[
          {
            icon: 'fa fa-fw fa-plus',
            title: trans('general'),
            primary: true,
            fields: [
              {
                name: 'longTitle',
                type: 'string',
                label: trans('title'),
                required: true,
                onChange: (title) => props.updateTitle(props.currentTabIndex, 'title', title.substring(0, 20))
              }, {
                name: 'locked',
                type: 'boolean',
                label: trans('lock_tab', {}, 'widget'),
                help : trans('lock_tab_help', {}, 'widget'),
                displayed: props.context.type === 'administration'
              }
            ]
          }, {
            icon: 'fa fa-fw fa-desktop',
            title: trans('display_parameters'),
            fields: [
              {
                name: 'centerTitle',
                type: 'boolean',
                label: trans('center_title')
              }, {
                name: 'position',
                type: 'number',
                label: trans('position'),
                options : {
                  min : 1,
                  max : props.tabs.length + 1
                },
                required: true,
                onChange: (newPosition) => props.moveTab(props.tabs, props.currentTab, newPosition)
              }, {
                name: 'title',
                type: 'string',
                label: trans('menu_title'),
                help: trans('menu_title_help'),
                options: {
                  maxLength: 20
                },
                onChange: (value) => {
                  if (isEmpty(value) && 0 === props.currentTab.icon.length) {
                    props.setErrors({
                      [props.currentTabIndex]: {title: 'Ce champ ne peux pas être vide si l\'onglet n\'a pas d\'icône'}
                    })
                  }
                }
              }, {
                name: 'icon',
                type: 'string',
                label: trans('icon'),
                help: trans('icon_tab_help'),
                onChange: (icon) => {
                  if (0 === icon.length && 0 === props.currentTab.title.length) {
                    props.setErrors({
                      [props.currentTabIndex]: {icon: 'Ce champ ne peux pas être vide si l\'onglet n\'a pas de titre.'}
                    })
                  }
                }
              }, {
                name: 'poster',
                label: trans('poster'),
                type: 'file',
                options: {
                  ratio: '3:1'
                }
              }
            ]
          }, {
            icon: 'fa fa-fw fa-key',
            title: trans('access_restrictions'),
            displayed: props.context.type === 'workspace' || props.context.type === 'administration',
            fields: [
              {
                name: 'roles',
                label: trans('role'),
                help: trans('home_tab_roles_explanation'),
                type: 'choice',
                options:{
                  multiple : true,
                  choices: props.context.type === 'workspace' || props.context.type === 'administration' ?
                    props.context.data.roles.reduce((acc, role) => {
                      acc[role.id] = role.translationKey
                      return acc
                    }, {})
                    : ''
                }
              }
            ]
          }
        ]}
      >
        <WidgetGridEditor
          context={props.context}
          widgets={props.widgets}
          update={(widgets) => props.updateWidgets(props.currentTabIndex, widgets)}
        />
      </FormContainer>
    </PageContent>
  </PageContainer>


EditorComponent.propTypes = {
  context: T.object.isRequired,
  tabs: T.arrayOf(T.shape(
    TabTypes.propTypes
  )),
  currentTab: T.shape(TabTypes.propTypes),
  currentTabIndex: T.number.isRequired,
  widgets: T.arrayOf(T.shape(
    WidgetContainerTypes.propTypes
  )).isRequired,
  history: T.shape({
    push: T.func.isRequired
  }).isRequired,
  createTab: T.func.isRequired,
  updateWidgets: T.func.isRequired,
  updateTitle: T.func.isRequired,
  setErrors: T.func.isRequired,
  deleteTab: T.func.isRequired,
  moveTab: T.func.isRequired
}

const Editor = withRouter(connect(
  state => ({
    context: selectors.context(state),
    tabs: editorSelectors.editorTabs(state),
    widgets: editorSelectors.widgets(state),
    currentTabIndex: editorSelectors.currentTabIndex(state),
    currentTab: editorSelectors.currentTab(state)
  }),
  dispatch => ({
    updateTitle(currentTabIndex, field, value) {
      dispatch(formActions.updateProp('editor', `[${currentTabIndex}].${field}`, value))
    },
    setErrors(errors) {
      dispatch(formActions.setErrors('editor', errors))
    },
    createTab(context, position, navigate){
      const newTabId = makeId()

      dispatch(formActions.updateProp('editor', `[${position}]`, merge({}, TabTypes.defaultProps, {
        id: newTabId,
        title: trans('tab'),
        longTitle: trans('tab'),
        position: position + 1,
        type: context.type,
        user: context.type === 'desktop' ? currentUser() : null,
        workspace: context.type === 'workspace' ? {uuid: context.data.uuid} : null
      })))

      // open new tab
      navigate(`/edit/tab/${newTabId}`)
    },
    moveTab(tabs, currentTab, newPosition) {
      dispatch(editorActions.moveTab(tabs, currentTab, newPosition))
    },
    deleteTab(tabs, currentTab, navigate) {
      dispatch(editorActions.deleteTab(tabs, currentTab))

      // redirect
      navigate('/edit')
    },
    updateWidgets(currentTabIndex, widgets) {
      dispatch(formActions.updateProp('editor', `[${currentTabIndex}].widgets`, widgets))
    }
  })
)(EditorComponent))

export {
  Editor
}
