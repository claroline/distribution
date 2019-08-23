<?php

/*
 * This file is part of the Claroline Connect package.
 *
 * (c) Claroline Consortium <consortium@claroline.net>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace Claroline\CoreBundle\Repository\ConnectionMessage;

use Claroline\CoreBundle\Entity\ConnectionMessage\ConnectionMessage;
use Claroline\CoreBundle\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Symfony\Bridge\Doctrine\RegistryInterface;

class ConnectionMessageRepository extends ServiceEntityRepository
{
    public function __construct(RegistryInterface $registry)
    {
        parent::__construct($registry, ConnectionMessage::class);
    }

    public function findConnectionMessageByUser(User $user)
    {
        $dql = '
            SELECT DISTINCT m
            FROM Claroline\CoreBundle\Entity\ConnectionMessage\ConnectionMessage m
            LEFT JOIN m.roles r
            WHERE (m.accessibleFrom IS NULL OR m.accessibleFrom <= :now)
            AND (m.accessibleUntil IS NULL OR m.accessibleUntil >= :now)
            AND (r IS NULL OR r.name IN (:roles))
            AND (m.type = :type OR NOT EXISTS (
                SELECT cm
                FROM Claroline\CoreBundle\Entity\ConnectionMessage\ConnectionMessage cm
                JOIN cm.users cmu
                WHERE m = cm
                AND cmu = :user
            ))
        ';
        $query = $this->_em->createQuery($dql);
        $query->setParameter('type', ConnectionMessage::TYPE_ALWAYS);
        $query->setParameter('now', new \DateTime());
        $query->setParameter('user', $user);
        $query->setParameter('roles', $user->getRoles());

        return $query->getResult();
    }
}
