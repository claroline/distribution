<?php

/*
 * This file is part of the Claroline Connect package.
 *
 * (c) Claroline Consortium <consortium@claroline.net>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace Claroline\CursusBundle\Finder;

use Claroline\AppBundle\API\Finder\AbstractFinder;
use Claroline\CursusBundle\Entity\CourseSession;
use Doctrine\ORM\QueryBuilder;

class SessionFinder extends AbstractFinder
{
    public function getClass()
    {
        return CourseSession::class;
    }

    public function configureQueryBuilder(QueryBuilder $qb, array $searches = [], array $sortBy = null, array $options = ['count' => false, 'page' => 0, 'limit' => -1])
    {
        $qb->join('obj.course', 'c');

        foreach ($searches as $filterName => $filterValue) {
            switch ($filterName) {
                case 'organizations':
                    $qb->join('c.organizations', 'o');
                    $qb->andWhere("o.uuid IN (:{$filterName})");
                    $qb->setParameter($filterName, $filterValue);
                    break;

                case 'course':
                    $qb->andWhere("c.uuid = :{$filterName}");
                    $qb->setParameter($filterName, $filterValue);
                    break;

                case 'workspace':
                    $qb->join('obj.workspace', 'w');
                    $qb->andWhere("w.uuid = :{$filterName}");
                    $qb->setParameter($filterName, $filterValue);
                    break;

                case 'active':
                    $qb->andWhere('obj.startDate > :now');
                    $qb->andWhere('obj.endDate > :now');
                    $qb->setParameter('now', new \DateTime());
                    break;

                case 'terminated':
                    if ($filterValue) {
                        $qb->andWhere('obj.endDate < :endDate');
                    } else {
                        $qb->andWhere($qb->expr()->orX(
                            $qb->expr()->isNull('obj.endDate'),
                            $qb->expr()->gte('obj.endDate', ':endDate')
                        ));
                    }
                    $qb->setParameter('endDate', new \DateTime());
                    break;

                case 'user':
                    $qb->leftJoin('obj.sessionUsers', 'su');
                    $qb->leftJoin('su.user', 'u');
                    $qb->leftJoin('obj.sessionGroups', 'sg');
                    $qb->leftJoin('sg.group', 'g');
                    $qb->leftJoin('g.users', 'gu');
                    $qb->andWhere($qb->expr()->orX(
                        $qb->expr()->eq('u.uuid', ':userId'),
                        $qb->expr()->eq('gu.uuid', ':userId')
                    ));
                    $qb->setParameter('userId', $filterValue);
                    break;

                default:
                    $this->setDefaults($qb, $filterName, $filterValue);
            }
        }

        return $qb;
    }
}
