import React from 'react'

import {t} from '#/main/core/translation'

import {OrganizationCard} from '#/main/core/administration/user/organization/components/organization-card.jsx'

const OrganizationList = {
  open: {
    action: (row) => `#/organizations/${row.id}`
  },
  definition: [
    {
      name: 'name',
      type: 'string',
      label: t('name'),
      displayed: true,
      primary: true
    }, {
      name: 'meta.default',
      type: 'boolean',
      label: t('default')
    }, {
      name: 'meta.parent',
      type: 'organization',
      label: t('parent')
    }, {
      name: 'email',
      type: 'email',
      label: t('email')
    }, {
      name: 'code',
      type: 'string',
      label: t('code')
    }, { // find better
      name: 'parent',
      type: 'string',
      label: t('parent')
    }
  ],
  card: OrganizationCard
}

export {
  OrganizationList
}
