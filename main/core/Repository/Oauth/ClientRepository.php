<?php

/*
 * This file is part of the Claroline Connect package.
 *
 * (c) Claroline Consortium <consortium@claroline.net>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace Claroline\CoreBundle\Repository\Oauth;

use Claroline\CoreBundle\Entity\Oauth\Client;
use Claroline\CoreBundle\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\ORM\Query;
use Symfony\Bridge\Doctrine\RegistryInterface;

class ClientRepository extends ServiceEntityRepository
{
    public function __construct(RegistryInterface $registry)
    {
        parent::__construct($registry, Client::class);
    }

    /**
     * @param User $user
     * @param bool $executeQuery
     *
     * @return Query|array
     */
    public function findByUserWithAccessToken(User $user, $executeQuery = true)
    {
        $query = $this->getEntityManager()
            ->createQuery(
                'SELECT c, at
                FROM ClarolineCoreBundle:Oauth\Client c
                JOIN c.accessTokens at
                WHERE at.user = :userId'
            )
            ->setParameter('userId', $user->getId());

        return $executeQuery ? $query->getResult() : $query;
    }
}
