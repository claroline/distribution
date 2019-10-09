<?php

/*
 * This file is part of the Claroline Connect package.
 *
 * (c) Claroline Consortium <consortium@claroline.net>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace Claroline\RemoteUserSynchronizationBundle\Manager;

use Claroline\AppBundle\Persistence\ObjectManager;
use Claroline\CoreBundle\Entity\User;
use Claroline\CoreBundle\Library\Configuration\PlatformConfigurationHandler;
use Claroline\RemoteUserSynchronizationBundle\Entity\RemoteUserToken;

class RemoteUserTokenManager
{
    const DEFAULT_DURATION = 10;

    private $configHandler;
    private $om;
    private $remoteUserTokenRepo;

    public function __construct(PlatformConfigurationHandler $configHandler, ObjectManager $om)
    {
        $this->configHandler = $configHandler;
        $this->om = $om;
        $this->remoteUserTokenRepo = $om->getRepository('ClarolineRemoteUserSynchronizationBundle:RemoteUserToken');
    }

    public function createRemoteUserToken(User $user)
    {
        $remoteUserToken = $this->getRemoteUserToken($user);

        if (is_null($remoteUserToken)) {
            $remoteUserToken = new RemoteUserToken();
            $remoteUserToken->setUser($user);
        }
        $token = md5(uniqid(mt_rand(), true));
        $lifetime = $this->configHandler->hasParameter('remote_user_token_lifetime') ?
            intval($this->configHandler->getParameter('remote_user_token_lifetime')) :
            self::DEFAULT_DURATION;
        $interval = new \DateInterval('PT'.$lifetime.'M');
        $expirationDate = new \DateTime();
        $expirationDate->add($interval);

        $remoteUserToken->setToken($token);
        $remoteUserToken->setActivated(true);
        $remoteUserToken->setExpirationDate($expirationDate);
        $this->om->persist($remoteUserToken);
        $this->om->flush();

        return $remoteUserToken;
    }

    public function deactivateRemoteUserToken(RemoteUserToken $remoteUserToken)
    {
        $remoteUserToken->setActivated(false);
        $this->om->persist($remoteUserToken);
        $this->om->flush();
    }

    public function checkRemoteUserToken(User $user, $token)
    {
        $result = false;
        $now = new \DateTime();
        $remoteUserToken = $this->remoteUserTokenRepo->findActivatedRemoteUserTokenByUserAndToken($user, $token, $now);

        if (!is_null($remoteUserToken)) {
            $result = true;
            $this->deactivateRemoteUserToken($remoteUserToken);
        }

        return $result;
    }

    public function getRemoteUserToken(User $user)
    {
        return $this->remoteUserTokenRepo->findOneByUser($user);
    }

    /**
     * Find all content for a given user and the replace him by another.
     *
     * @param User $from
     * @param User $to
     *
     * @return int
     */
    public function replaceUser(User $from, User $to)
    {
        $remoteUserTokens = $this->remoteUserTokenRepo->findByUser($from);

        if (count($remoteUserTokens) > 0) {
            foreach ($remoteUserTokens as $remoteUserToken) {
                $remoteUserToken->setUser($to);
            }

            $this->om->flush();
        }

        return count($remoteUserTokens);
    }
}
