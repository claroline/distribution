<?php

/*
 * This file is part of the Claroline Connect package.
 *
 * (c) Claroline Consortium <consortium@claroline.net>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace UJM\ExoBundle\API\Finder;

use Claroline\AppBundle\API\Finder\AbstractFinder;
use Doctrine\ORM\QueryBuilder;
use JMS\DiExtraBundle\Annotation as DI;

/**
 * Quiz papers finder.
 *
 * @DI\Service("ujm_exo.api.finder.paper")
 * @DI\Tag("claroline.finder")
 */
class PaperFinder extends AbstractFinder
{
    public function getClass()
    {
        return 'UJM\ExoBundle\Entity\Attempt\Paper';
    }

    public function configureQueryBuilder(QueryBuilder $qb, array $searches = [], array $sortBy = null, array $options = ['count' => false, 'page' => 0, 'limit' => -1])
    {
        $qb->join('obj.exercise', 'e');
        $qb->andWhere('e.id = :exerciseId');
        $qb->setParameter('exerciseId', $searches['exercise']);

        foreach ($searches as $filterName => $filterValue) {
            switch ($filterName) {
                case 'user':
                    $qb->join('obj.user', 'u');
                    $qb->andWhere("
                        UPPER(u.firstName) LIKE :name
                        OR UPPER(u.lastName) LIKE :name
                        OR UPPER(u.username) LIKE :name
                        OR CONCAT(UPPER(u.firstName), CONCAT(' ', UPPER(u.lastName))) LIKE :name
                        OR CONCAT(UPPER(u.lastName), CONCAT(' ', UPPER(u.firstName))) LIKE :name
                    ");
                    $qb->setParameter('name', '%'.strtoupper($filterValue).'%');
                    break;
                case 'finished':
                    $qb->andWhere("obj.interrupted != :{$filterName}");
                    $qb->setParameter($filterName, $filterValue);
                    break;
                default:
                    if (is_string($filterValue)) {
                        $qb->andWhere("UPPER(obj.{$filterName}) LIKE :{$filterName}");
                        $qb->setParameter($filterName, '%'.strtoupper($filterValue).'%');
                    } else {
                        $qb->andWhere("obj.{$filterName} = :{$filterName}");
                        $qb->setParameter($filterName, $filterValue);
                    }
            }
        }
        if (!is_null($sortBy) && isset($sortBy['property']) && isset($sortBy['direction'])) {
            $sortByProperty = $sortBy['property'];
            $sortByDirection = 1 === $sortBy['direction'] ? 'ASC' : 'DESC';

            switch ($sortByProperty) {
                case 'finished':
                    $qb->orderBy('obj.interrupted', $sortByDirection);
                    break;
            }
        }

        return $qb;
    }
}
