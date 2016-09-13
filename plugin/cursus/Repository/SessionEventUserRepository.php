<?php

/*
 * This file is part of the Claroline Connect package.
 *
 * (c) Claroline Consortium <consortium@claroline.net>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace Claroline\CursusBundle\Repository;

use Claroline\CursusBundle\Entity\SessionEvent;
use Doctrine\ORM\EntityRepository;

class SessionEventUserRepository extends EntityRepository
{
    public function findUnregisteredUsersFromListBySessionEvent(SessionEvent $sessionEvent, array $users)
    {
        $dql = "
            SELECT u
            FROM Claroline\CoreBundle\Entity\User u
            WHERE u.isEnabled = true
            AND u IN (:users)
            AND NOT EXISTS (
                SELECT seu
                FROM Claroline\CursusBundle\Entity\SessionEventUser seu
                JOIN seu.sessionEvent se
                JOIN seu.user uu
                WHERE se = :sessionEvent
                AND uu = u
            )
            ORDER BY u.lastName, u.firstName
        ";
        $query = $this->_em->createQuery($dql);
        $query->setParameter('sessionEvent', $sessionEvent);
        $query->setParameter('users', $users);

        return $query->getResult();
    }

    public function findSessionEventUsersFromListBySessionEventAndStatus(SessionEvent $sessionEvent, array $users, $status)
    {
        $dql = "
            SELECT seu
            FROM Claroline\CursusBundle\Entity\SessionEventUser seu
            JOIN seu.sessionEvent se
            JOIN seu.user u
            WHERE se = :sessionEvent
            AND seu.registrationStatus = :status
            AND u IN (:users)
        ";
        $query = $this->_em->createQuery($dql);
        $query->setParameter('sessionEvent', $sessionEvent);
        $query->setParameter('status', $status);
        $query->setParameter('users', $users);

        return $query->getResult();
    }
}
