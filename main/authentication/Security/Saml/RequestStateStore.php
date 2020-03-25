<?php

namespace Claroline\AuthenticationBundle\Security\Saml;

use Claroline\AuthenticationBundle\Entity\Saml\RequestStateEntry;
use Doctrine\Common\Persistence\ObjectManager;
use LightSaml\State\Request\RequestState;
use LightSaml\Store\Request\RequestStateStoreInterface;

class RequestStateStore implements RequestStateStoreInterface
{
    /** @var ObjectManager */
    private $om;

    /**
     * @param ObjectManager         $manager
     */
    public function __construct(ObjectManager $manager)
    {
        $this->om = $manager;
    }

    /**
     * @param RequestState $state
     *
     * @return RequestStateStoreInterface
     */
    public function set(RequestState $state)
    {
        $entry = new RequestStateEntry();
        $entry->setId($state->getId());
        $entry->setParameters($state->serialize());

        $this->om->persist($entry);
        $this->om->flush();

        return $this;
    }

    /**
     * @param string $id
     *
     * @return RequestState|null
     */
    public function get($id)
    {
        /** @var RequestStateEntry $entry */
        $entry = $this->om->getRepository(RequestStateEntry::class)->findOneBy(['id' => $id]);
        if ($entry) {
            $requestState = new RequestState();
            $requestState->setId($entry->getId());
            $requestState->unserialize($entry->getParameters());

            return $requestState;
        }

        return null;
    }

    /**
     * @param string $id
     *
     * @return bool
     */
    public function remove($id)
    {
        /** @var RequestStateEntry $entry */
        $entry = $this->om->getRepository(RequestStateEntry::class)->findOneBy(['id' => $id]);
        if ($entry) {
            $this->om->remove($entry);
            $this->om->flush();
        }

        return true;
    }

    /**
     * @return void
     */
    public function clear()
    {
        // I don't know what to do here
    }
}
