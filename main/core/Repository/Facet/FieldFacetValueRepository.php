<?php

/*
 * This file is part of the Claroline Connect package.
 *
 * (c) Claroline Consortium <consortium@claroline.net>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace Claroline\CoreBundle\Repository\Facet;

use Claroline\CoreBundle\Entity\Facet\FieldFacetValue;
use Claroline\CoreBundle\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Symfony\Bridge\Doctrine\RegistryInterface;

class FieldFacetValueRepository extends ServiceEntityRepository
{
    public function __construct(RegistryInterface $registry)
    {
        parent::__construct($registry, FieldFacetValue::class);
    }

    public function findPlatformValuesByUser(User $user)
    {
        return $this->_em
            ->createQuery('
                SELECT fv
                FROM Claroline\CoreBundle\Entity\Facet\FieldFacetValue fv
                JOIN fv.fieldFacet ff
                WHERE ff.resourceNode IS NULL
                  AND fv.user = :user
            ')
            ->setParameter('user', $user)
            ->getResult();
    }
}
