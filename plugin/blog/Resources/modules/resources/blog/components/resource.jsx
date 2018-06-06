import React from 'react'
import {connect} from 'react-redux'
import {PropTypes as T} from 'prop-types'
import isEmpty from 'lodash/isEmpty'
import {
  PageActions,
  PageAction,
  PageContent,
  PageHeader,
  Page,
  PageContainer
} from '#/main/core/layout/page'
import {ResourcePageContainer} from '#/main/core/resource/containers/page.jsx'
import {RoutedPageContent} from '#/main/core/layout/router'
import {t, trans, transChoice} from '#/main/core/translation'
import {select as formSelect} from '#/main/core/data/form/selectors'
import {actions as formActions} from '#/main/core/data/form/actions'
import {Posts} from '#/plugin/blog/resources/blog/components/posts.jsx'
import {Post} from '#/plugin/blog/resources/blog/components/post.jsx'
import {PostForm} from '#/plugin/blog/resources/blog/components/post-form.jsx'
import {Tools} from '#/plugin/blog/resources/blog/components/toolbar/toolbar.jsx'
import {BlogOptions} from '#/plugin/blog/resources/blog/components/blog-options.jsx'
import {actions} from '#/plugin/blog/resources/blog/actions.js'
import {constants} from '#/plugin/blog/resources/blog/constants.js'
import {saveEnabled} from '#/plugin/blog/resources/blog/utils.js'
import {url} from '#/main/app/api'

import Grid from 'react-bootstrap/lib/Grid'
import Row from 'react-bootstrap/lib/Row'
import Col from 'react-bootstrap/lib/Col'
import Panel from 'react-bootstrap/lib/Panel'

const Blog = props =>
  <ResourcePageContainer
      editor={{
        icon: 'fa fa-pencil',
        label: trans('configure_blog', {}, 'icap_blog'),
        opened: true,
        path: '/edit',
        save: {
          disabled: !props.saveEnabled,
          action: () => props.save(props.blogId, props.mode, props.postId)
        }
      }}
      customActions={[
        {
          type: 'link',
          icon: 'fa fa-home',
          label: trans('show_overview'),
          target: '/',
          exact: true
        }, {
          type: 'link',
          icon: 'fa fa-plus',
          label: trans('new_post', {}, 'icap_blog'),
          target: '/new',
          exact: true
        }
      ]}
    >
    <PageContent>
      <Grid key="blog-grid" className="blog-page">
        <Row className="show-grid">
          <Col xs={13} md={9} className="blog-content">
            <RoutedPageContent routes={[
            {
              path: '/',
              component: Posts,
              exact: true,
              onEnter: () => props.switchMode(constants.LIST_POSTS)
            }, {
              path: '/author/:authorId',
              component: Posts,
              exact: true,
              onEnter: (params) => props.getPostByAuthor(props.blogId, params.authorId)
            }, {
              path: '/new',
              component: PostForm,
              exact: true,
              onEnter: () => props.createPost()
            }, {
              path: '/edit',
              component: BlogOptions,
              onEnter: (params) => props.editBlogOptions(props.blogId),
              exact: true,
            }, {
              path: '/:id',
              component: Post,
              exact: true,
              onEnter: (params) => props.getPost(props.blogId, params.id)
            }, {
              path: '/:id/edit',
              component: PostForm,
              exact: true,
              onEnter: (params) => props.editPost(props.blogId, params.id)
            }
            ]}/>
          </Col>
          <Col xs={5} md={3} className="blog-widgets">
            <Tools />
          </Col>
        </Row>
      </Grid>
    </PageContent>
  </ResourcePageContainer>

Blog.propTypes = {
  blogId: T.string.isRequired,
  postId: T.string,
  saveEnabled: T.bool.isRequired,
  save: T.func.isRequired
}
          
const BlogContainer = connect(
    state => ({
      blogId: state.blog.data.id,
      postId: !isEmpty(state.post_edit) ? state.post_edit.data.id : null,
      mode: state.mode,
      saveEnabled: saveEnabled(formSelect, state, state.mode),
      editorOpened: !isEmpty(formSelect.data(formSelect.form(state, 'blog.data.options'))),
    }),
    dispatch => ({
      getPost: (blogId, postId) => {
        dispatch(actions.getPost(blogId, postId))
      },
      createPost: () => {
        dispatch(actions.createPost(constants.POST_EDIT_FORM_NAME))
      },
      getPostByAuthor: (blogId, authorName) => {
        dispatch(actions.getPostByAuthor(blogId, authorName))
      },
      editPost: (blogId, postId) => {
        dispatch(actions.editPost(constants.POST_EDIT_FORM_NAME, blogId, postId))
      },
      editBlogOptions: (blogId) => {
        dispatch(actions.editBlogOptions('blog.data.options', blogId))
      },
      switchMode: (mode) => {
        dispatch(actions.switchMode(mode))
      },
      initDataList: () => {
        dispatch(actions.initDataList())
      },
      save: (blogId, mode, postId) => {
        if(mode === constants.CREATE_POST){
          dispatch(
            formActions.saveForm(constants.POST_EDIT_FORM_NAME, ['apiv2_blog_post_new', {blogId: blogId}])
          )
        }else if(mode === constants.EDIT_POST && postId !== null){
          dispatch(
            formActions.saveForm(constants.POST_EDIT_FORM_NAME, ['apiv2_blog_post_update', {blogId: blogId, postId: postId}])
          )
        }else if(mode === constants.EDIT_OPTIONS){
          dispatch(
            formActions.saveForm('blog.data.options', ['apiv2_blog_options', {blogId: blogId}])
          )
        }
      }
    })
)(Blog)
      
export {BlogContainer}
