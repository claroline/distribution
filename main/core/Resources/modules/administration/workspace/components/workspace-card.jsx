import React from 'react'

import {t} from '#/main/core/translation'
import {localeDate} from '#/main/core/date'
import {generateUrl} from '#/main/core/fos-js-router'

const WorkspaceCard = (row) => ({
  onClick: generateUrl('claro_workspace_open', {workspaceId: row.id}),
  poster: null,
  icon: 'fa fa-book',
  title: row.name,
  subtitle: row.code,
  contentText: row.meta.description,
  flags: [
    row.meta.personal                 && ['fa fa-user',         t('personal_workspace')],
    row.meta.model                    && ['fa fa-object-group', t('model')],
    row.display.displayable           && ['fa fa-eye',          t('displayable_in_workspace_list')],
    row.registration.selfRegistration && ['fa fa-globe',        t('public_registration')]
  ].filter(flag => !!flag),
  footer:
    <span>
      created by <b>{row.meta.creator ? row.meta.creator.name : t('unknown')}</b>
    </span>,
  footerLong:
    <span>
      created at <b>{localeDate(row.meta.created)}</b>,
      by <b>{row.meta.creator ? row.meta.creator.name: t('unknown')}</b>
    </span>
})

export {
  WorkspaceCard
}
