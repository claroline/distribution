import editor from './editor'
import {TextContentPlayer} from './player.jsx'
import {TextContentThumbnail} from './thumbnail.jsx'

export default {
  type: 'text',
  mimeType: 'text/html',
  icon: 'fa fa-align-left',
  altIcon: 'fa fa-align-left',
  player: TextContentPlayer,
  thumbnail: TextContentThumbnail,
  editable: true,
  editor
}
