import React, {Component} from 'react'
import {PropTypes as T, implementPropTypes} from '#/main/app/prop-types'
import get from 'lodash/get'


import {FormData} from '#/main/app/content/form/containers/data'
import {ItemEditor as ItemEditorTypes} from '#/plugin/exo/items/prop-types'

import {resizeArea} from '#/plugin/exo/items/graphic/resize'
import {makeId} from '#/plugin/exo/utils/utils'
import {asset} from '#/main/app/config/asset'
import {trans} from '#/main/app/intl/translation'
import {makeDroppable} from '#/plugin/exo//utils/dragAndDrop'
import {ContentError} from '#/main/app/content/components/error'
import {ImageInput} from '#/plugin/exo/items/graphic/components/image-input.jsx'
import {ModeSelector} from '#/plugin/exo/items/graphic/components/mode-selector.jsx'
import {AreaPopover} from '#/plugin/exo/items/graphic/components/area-popover.jsx'
import {ResizeDragLayer} from '#/plugin/exo/items/graphic/components/resize-drag-layer.jsx'
import {AnswerAreaDraggable} from '#/plugin/exo/items/graphic/components/answer-area.jsx'
import {GraphicItem as GraphicItemTypes} from '#/plugin/exo/items/graphic/prop-types'

import {
  MODE_SELECT,
  MAX_IMG_SIZE,
  SHAPE_RECT,
  TYPE_ANSWER_AREA,
  TYPE_AREA_RESIZER,
  MODE_RECT,
  SHAPE_CIRCLE,
  AREA_DEFAULT_SIZE
} from '#/plugin/exo/items/graphic/enums'

let AnswerDropZone = props => props.connectDropTarget(props.children)

AnswerDropZone.propTypes = {
  connectDropTarget: T.func.isRequired,
  children: T.element.isRequired
}

AnswerDropZone = makeDroppable(AnswerDropZone, [
  TYPE_ANSWER_AREA,
  TYPE_AREA_RESIZER
])

const blankImage = () => {
  return {
    id: makeId(),
    type: '',
    data: '',
    width: 0,
    height: 0
  }
}

const toAbs = (length, imgProps) => {
  const sizeRatio = imgProps.width / imgProps._clientWidth
  return Math.round(length * sizeRatio)
}

const deleteArea = (item, areaId) => {

}

const selectImage = (item, image) => {
  return Object.assign({}, item, {
    image: Object.assign(
      blankImage(),
      {id: item.image.id},
      image
    ),
    solutions: [],
    pointers: 0,
    _popover: Object.assign({}, item._popover, {open: false})
  })
}

class GraphicElement extends Component {
  constructor(props) {
    super(props)

    this.onSelectImage = this.onSelectImage.bind(this)
    this.onClickImage = this.onClickImage.bind(this)
    this.onResize = this.onResize.bind(this)
  }

  componentDidMount() {
    // because we need to access various DOM-related APIs to deal with the image
    // and because letting React compare the data/src attribute (which can be a
    // a very long string if the image is large) could be too heavy, the img tag
    // is rendered outside the React pipeline and just attached to a leaf node
    // of the component.
    if (this.props.item.image.data || this.props.item.image.url) {
      const img = this.createImage(this.props.item.image.data, this.props.item.image.url)
      img.onload = () => this.props.onChange(actions.resizeImage(img.width, img.height))
    } else {
      this.imgContainer.innerHTML = trans('graphic_pick', {}, 'quiz')
    }

    window.addEventListener('resize', this.onResize)

    this.imgContainer.addEventListener('click', () => {
      this.props.onChange(actions.blurAreas())
    })
  }

  componentDidUpdate(prevProps) {
    const img = this.imgContainer.querySelector('img')

    if (img) {
      img.className = this.props.item._mode !== MODE_SELECT ? 'point-mode' : ''

      if (prevProps.item.image.data !== this.props.item.image.data) {
        if (!this.props.item.image.data) {
          this.imgContainer.innerHTML = tex('graphic_pick', {}, 'quiz')
        } else {
          img.src = this.props.item.image.data
        }
      }

      setTimeout(() => {
        if (
          this.props.item.image._clientWidth !== img.width &&
          this.props.item.image._clientHeigth !== img.height
        ) {
          this.onResize()
        }
      }, 100)
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onResize)
  }

  onSelectImage(file) {
    if (file.type.indexOf('image') !== 0) {
      const newItem = selectImage(this.props.item, {_type: file.type})
      this.props.update('image', newItem.image)
      this.props.update('solutions', newItem.solutions)
      this.props.update('pointers', newItem.solutions)
    }

    if (file.size > MAX_IMG_SIZE) {
      const newItem = selectImage(this.props.item, {_size: file.size})
      this.props.update('image', newItem.image)
      this.props.update('solutions', newItem.solutions)
      this.props.update('pointers', newItem.solutions)
    }

    const reader = new window.FileReader()
    reader.onload = e => {
      const img = this.createImage(e.target.result)
      img.onload = () => {
        const newItem = selectImage(this.props.item, {
          type: file.type,
          data: e.target.result,
          width: img.naturalWidth,
          height: img.naturalHeight,
          _clientWidth: img.width,
          _clientHeight: img.height,
          _size: file.size
        })
        this.props.update('image', newItem.image)
        this.props.update('solutions', newItem.solutions)
        this.props.update('pointers', newItem.solutions)
      }
    }
    reader.readAsDataURL(file)
  }

  createImage(encodedString, url) {
    const img = document.createElement('img')
    img.src = encodedString || asset(url)
    img.className = this.props.item._mode !== MODE_SELECT ? 'point-mode' : ''
    img.addEventListener('click', this.onClickImage)
    this.imgContainer.innerHTML = ''
    this.imgContainer.appendChild(img)

    return img
  }

  onClickImage(e) {
    if (this.props.item._mode !== MODE_SELECT) {
      e.stopPropagation()
      const imgRect = e.target.getBoundingClientRect()

      const clientX = e.clientX - imgRect.left
      const clientY = e.clientY - imgRect.top
      const clientHalfSize = AREA_DEFAULT_SIZE / 2
      const absX = toAbs(clientX, this.props.item.image)
      const absY = toAbs(clientY, this.props.item.image)
      const absHalfSize = toAbs(clientHalfSize, this.props.item.image)
      const area = {
        id: makeId(),
        shape: this.props.item._mode === MODE_RECT ? SHAPE_RECT : SHAPE_CIRCLE,
        color: this.props.item._currentColor
      }

      if (area.shape === SHAPE_CIRCLE) {
        area.center = {
          x: absX,
          y: absY,
          _clientX: clientX,
          _clientY: clientY
        }
        area.radius = absHalfSize
        area._clientRadius = clientHalfSize
      } else {
        area.coords = [
          {
            x: absX - absHalfSize,
            y: absY - absHalfSize,
            _clientX: clientX - clientHalfSize,
            _clientY: clientY - clientHalfSize
          },
          {
            x: absX + absHalfSize,
            y: absY + absHalfSize,
            _clientX: clientX + clientHalfSize,
            _clientY: clientY + clientHalfSize
          }
        ]
      }

      const newItem = Object.assign({}, this.props.item, {
        pointers: this.props.item.pointers + 1,
        solutions: [
          ...this.props.item.solutions.map(solution => Object.assign({}, solution, {
            _selected: false
          })),
          {
            score: 1,
            feedback: '',
            _selected: true,
            area
          }
        ],
        _mode: MODE_SELECT,
        _popover: Object.assign({}, this.props.item._popover, {open: false})
      })

      this.props.update('solutions', newItem.solutions)
      this.props.update('pointers', newItem.pointers)
      this.props.update('_mode', newItem._mode)
      this.props.update('_popover', newItem._popover)
    }
  }

  onResize() {
    const img = this.imgContainer.querySelector('img')

    if (img) {
      this.props.onChange(actions.resizeImage(img.width, img.height))
    }
  }

  getCurrentArea() {
    return this.props.item.solutions.find(
      solution => solution.area.id === this.props.item._popover.areaId
    )
  }

  getClientArea(area) {
    return Object.assign({}, area, area.shape === SHAPE_RECT ?
      {
        coords: area.coords.map(coords => ({
          x: coords._clientX,
          y: coords._clientY
        }))
      } :
      {
        radius: area._clientRadius,
        center: {
          x: area.center._clientX,
          y: area.center._clientY
        }
      }
    )
  }

  render() {
    return(
      <div>
        <div className="top-controls">
          <ImageInput onSelect={file => this.onSelectImage(file)}/>
        </div>

        {this.props.item._popover.open &&
          <AreaPopover
            left={this.props.item._popover.left}
            top={this.props.item._popover.top}
            score={this.getCurrentArea().score}
            feedback={this.getCurrentArea().feedback}
            color={this.getCurrentArea().area.color}
            onPickColor={color => {
              const newItem = Object.assign({}, this.props.item, {
                solutions: this.props.item.solutions.map(solution => {
                  if (solution.area.id === this.props.item._popover.areaId) {
                    return Object.assign({}, solution, {
                      area: Object.assign({}, solution.area, {
                        color
                      })
                    })
                  }
                  return solution
                }),
                _currentColor: color
              })

              this.props.update('solutions', newItem.solutions)
              this.props.update('_currentColor', newItem._currentColor)
            }}

            onChangeScore={score => {
              const newItem = Object.assign({}, this.props.item, {
                solutions: this.props.item.solutions.map(solution => {
                  if (solution.area.id === this.props.item._popover.areaId) {
                    return Object.assign({}, solution, {score})
                  }
                  return solution
                })
              })

              this.props.update('solutions', newItem.solutions)
            }}

            onChangeFeedback={feedback => {
              const newItem = Object.assign({}, this.props.item, {
                solutions: this.props.item.solutions.map(solution => {
                  if (solution.area.id === this.props.item._popover.areaId) {
                    return Object.assign({}, solution, {feedback})
                  }
                  return solution
                })
              })

              this.props.update('solutions', newItem.solutions)
            }}
            onClose={() => {
              this.props.update('_popover', {
                areaId: this.props.item._popover.areaId,
                open: false,
                left: 0,
                top: 0
              })
            }}
            onDelete={() => this.props.onChange(
              actions.deleteArea(this.props.item._popover.areaId)
            )}
          />
        }

        <div className="img-dropzone">
          <div className="img-widget">
            <AnswerDropZone onDrop={(item, props, offset) => {
              if (item.item.type === TYPE_AREA_RESIZER) {
                const newItem = Object.assign({}, this.props.item, {
                  solutions: this.props.item.solutions.map(solution => {
                    if (solution.area.id === item.item.areaId) {
                      const area = resizeArea(
                        this.getClientArea(solution.area),
                        item.item.position,
                        offset.x,
                        offset.y
                      )
                      if (solution.area.shape === SHAPE_CIRCLE) {
                        return Object.assign({}, solution, {
                          area: Object.assign({}, solution.area, {
                            center: {
                              x: toAbs(area.center.x, this.props.item.image),
                              y: toAbs(area.center.y, this.props.item.image),
                              _clientX: area.center.x,
                              _clientY: area.center.y
                            },
                            radius: toAbs(area.radius, this.props.item.image),
                            _clientRadius: area.radius
                          })
                        })
                      } else {
                        return Object.assign({}, solution, {
                          area: Object.assign({}, solution.area, {
                            coords: solution.area.coords.map((coords, index) => ({
                              x: toAbs(area.coords[index].x, this.props.item.image),
                              y: toAbs(area.coords[index].y, this.props.item.image),
                              _clientX: area.coords[index].x,
                              _clientY: area.coords[index].y
                            }))
                          })
                        })
                      }
                    }
                    return solution
                  })
                })
                this.props.update('solutions', newItem.solutions)
              } else {
                const newItem = Object.assign({}, this.props.item, {
                  solutions: this.props.item.solutions.map(solution => {
                    if (solution.area.id === item.id) {
                      // action coordinates are the offset resulting from the move
                      if (solution.area.shape === SHAPE_CIRCLE) {
                        return Object.assign({}, solution, {
                          area: Object.assign({}, solution.area, {
                            center: {
                              x: solution.area.center.x + toAbs(offset.x, this.props.item.image),
                              y: solution.area.center.y + toAbs(offset.y, this.props.item.image),
                              _clientX: solution.area.center._clientX + offset.x,
                              _clientY: solution.area.center._clientY + offset.y
                            }
                          })
                        })
                      } else {
                        return Object.assign({}, solution, {
                          area: Object.assign({}, solution.area, {
                            coords: solution.area.coords.map(coords => ({
                              x: coords.x + toAbs(offset.x, this.props.item.image),
                              y: coords.y + toAbs(offset.y, this.props.item.image),
                              _clientX: coords._clientX + offset.x,
                              _clientY: coords._clientY + offset.y
                            }))
                          })
                        })
                      }
                    }
                    return solution
                  }),
                  _popover: Object.assign({}, this.props.item._popover, {open: false})
                })

                this.props.update('solutions', newItem.solutions)
                this.props.update('_popover', newItem._popover)
              }
            }}>
              <div>
                <div className="img-container" ref={el => this.imgContainer = el}/>
                <ResizeDragLayer
                  canDrag={!this.props.item._popover.open}
                  areas={this.props.item.solutions.map(
                    solution => this.getClientArea(solution.area)
                  )}
                />
                {this.props.item.solutions.map(solution =>
                  <AnswerAreaDraggable
                    key={solution.area.id}
                    id={solution.area.id}
                    color={solution.area.color}
                    shape={solution.area.shape}
                    selected={this.props.item._mode === MODE_SELECT && solution._selected}
                    onSelect={id => {
                      const newItem = Object.assign({}, this.props.item, {
                        solutions: this.props.item.solutions.map(solution => Object.assign({}, solution, {
                          _selected: solution.area.id === id
                        })),
                        _mode: MODE_SELECT,
                        _popover: Object.assign({}, this.props.item._popover, {
                          open: this.props.item._popover.open && this.props.item._popover.areaId === id
                        })
                      })
                      this.props.update('solutions', newItem.solutions)
                      this.props.update('_mode', newItem._mode)
                      this.props.update('_popover', newItem._popover)
                    }}
                    onDelete={id => this.props.onChange(actions.deleteArea(id))}
                    canDrag={!this.props.item._popover.open
                      || this.props.item._popover.areaId !== solution.area.id}
                    togglePopover={(areaId, left, top) => {
                      const hasPopover = this.props.item._popover.open
                        && this.props.item._popover.areaId === solution.area.id

                      this.props.update('_popover', {
                        areaId,
                        open: !hasPopover,
                        left,
                        top
                      })
                    }}
                    geometry={this.getClientArea(solution.area)}
                  />
                )}
              </div>
            </AnswerDropZone>
          </div>
        </div>
      </div>
    )
  }
}

export const GraphicEditor = (props) =>
  <FormData
    className="graphic-editor"
    embedded={true}
    name={props.formName}
    dataPart={props.path}
    sections={[
      {
        title: trans('general'),
        primary: true,
        fields: [
          {
            name: '_mode',
            required: true,
            render: (item, errors) => <ModeSelector currentMode={props.item._mode} onChange={mode => props.update('_mode', mode)}/>
          },
          {
            name: 'data',
            required: true,
            render: (item, errors) => <GraphicElement {...props} item={item}/>
          }
        ]
      }
    ]}
  />

implementPropTypes(GraphicEditor, ItemEditorTypes, {
  item: T.shape(GraphicItemTypes.propTypes).isRequired
})
