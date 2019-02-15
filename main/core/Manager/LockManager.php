<?php

/*
 * This file is part of the Claroline Connect package.
 *
 * (c) Claroline Consortium <consortium@claroline.net>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace Claroline\CoreBundle\Manager;

use Claroline\AppBundle\Persistence\ObjectManager;
use Claroline\CoreBundle\Entity\ObjectLock;
use JMS\DiExtraBundle\Annotation as DI;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

/**
 * @DI\Service("claroline.manager.lock_manager")
 */
class LockManager
{
    /**
     * @DI\InjectParams({
     *     "om"           = @DI\Inject("claroline.persistence.object_manager"),
     *     "tokenStorage" = @DI\Inject("security.token_storage")
     * })
     */
    public function __construct(ObjectManager $om, TokenStorageInterface $tokenStorage)
    {
        $this->om = $om;
        $this->tokenStorage = $tokenStorage;
    }

    public function lock($class, $uuid)
    {
        $lock = $this->getLock($class, $uuid);
        $lock->setLocked(true);
        $lock->setUser($this->tokenStorage->getToken()->getUser());
        $this->om->persist($lock);
        $this->om->flush();
    }

    public function unlock($class, $uuid)
    {
        $lock = $this->getLock($object);
        $lock->setLocked(false);
        $this->om->persist($lock);
        $this->om->flush();
    }

    public function getLock($class, $uuid)
    {
        $lock = $this->om->getRepository(ObjectLock::class)->findOneBy([
          'objectClass' => $class,
          'objectUuid' => $uuid,
        ]);

        if (!$lock) {
            $lock = $this->create($class, $uuid);
        }

        return $lock;
    }

    public function isLocked($class, $uuid)
    {
        $lock = $this->getLock();

        return $lock && $lock->isLocked();
    }

    public function create($class, $uuid)
    {
        $lock = new ObjectLock();
        $lock->setObjectUuid($uuid);
        $lock->setObjectClass($class);
        $lock->setUser($this->tokenStorage->getToken()->getUser());
        $this->om->persist($lock);
        $this->om->flush();

        return $lock;
    }
}
