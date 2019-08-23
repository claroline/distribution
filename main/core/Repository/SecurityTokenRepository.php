<?php

/*
 * This file is part of the Claroline Connect package.
 *
 * (c) Claroline Consortium <consortium@claroline.net>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace Claroline\CoreBundle\Repository;

use Claroline\CoreBundle\Entity\SecurityToken;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Symfony\Bridge\Doctrine\RegistryInterface;

class SecurityTokenRepository extends ServiceEntityRepository
{
    public function __construct(RegistryInterface $registry)
    {
        parent::__construct($registry, SecurityToken::class);
    }

    public function findAllTokens($order = 'clientName', $direction = 'ASC')
    {
        $dql = "
            SELECT st
            FROM Claroline\CoreBundle\Entity\SecurityToken st
            ORDER BY st.{$order} {$direction}
        ";

        $query = $this->_em->createQuery($dql);

        return $query->getResult();
    }

    public function findSecurityTokenByClientNameAndTokenAndIp(
        $clientName,
        $token,
        $ip
    ) {
        $dql = "
            SELECT st
            FROM Claroline\CoreBundle\Entity\SecurityToken st
            WHERE st.clientName = :clientName
            AND st.token = :token
            AND st.clientIp = :ip
        ";

        $query = $this->_em->createQuery($dql);
        $query->setParameter('clientName', $clientName);
        $query->setParameter('token', $token);
        $query->setParameter('ip', $ip);

        return $query->getOneOrNullResult();
    }
}
