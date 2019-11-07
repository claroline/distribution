<?php

/*
 * This file is part of the Claroline Connect package.
 *
 * (c) Claroline Consortium <consortium@claroline.net>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace Claroline\ForumBundle\Listener;

use Claroline\AppBundle\Event\Crud\CreateEvent;
use Claroline\AppBundle\Event\Crud\DeleteEvent;
use Claroline\AppBundle\Event\Crud\UpdateEvent;
use Claroline\AppBundle\Event\StrictDispatcher;
use Claroline\CoreBundle\API\Finder\User\UserFinder;
use Claroline\ForumBundle\Entity\Message;
use Claroline\ForumBundle\Entity\Subject;
use Claroline\ForumBundle\Event\LogMessageEvent;
use Claroline\ForumBundle\Event\LogSubjectEvent;

class CrudListener
{
    public function __construct(StrictDispatcher $dispatcher, UserFinder $userFinder)
    {
        $this->dispatcher = $dispatcher;
        $this->userFinder = $userFinder;
    }

    public function onPostCreate(CreateEvent $event)
    {
        $message = $event->getObject();

        $this->dispatchMessageEvent($message, 'forum_message-create');
    }

    public function onPostUpdate(UpdateEvent $event)
    {
        //c'est ici aussi qu'on catch le flag d'un message
        $message = $event->getObject();

        $this->dispatchMessageEvent($message, 'forum_message-update');
    }

    public function onPostDelete(DeleteEvent $event)
    {
        $message = $event->getObject();

        $this->dispatchMessageEvent($message, 'forum_message-delete');
    }

    public function onSubjectCreate(CreateEvent $event)
    {
        $subject = $event->getObject();

        $this->dispatchSubjectEvent($subject, 'forum_subject-create');
    }

    public function onSubjectUpdate(UpdateEvent $event)
    {
        //c'est ici aussi qu'on catch le flag d'un sujet
        $subject = $event->getObject();

        $this->dispatchSubjectEvent($subject, 'forum_subject-update');
    }

    public function onSubjectDelete(DeleteEvent $event)
    {
        $subject = $event->getObject();

        $this->dispatchSubjectEvent($subject, 'forum_subject-delete');
    }

    private function dispatchMessageEvent(Message $message, $action)
    {
        $forum = $this->getSubject($message)->getForum();

        $usersToNotify = $this->userFinder->find(['workspace' => $forum->getResourceNode()->getWorkspace()->getUuid()]);
        $this->dispatcher->dispatch('log', LogMessageEvent::class, [$message, $usersToNotify, $action]);
    }

    private function dispatchSubjectEvent(Subject $subject, $action)
    {
        $forum = $subject->getForum();

        $usersToNotify = $this->userFinder->find(['workspace' => $forum->getResourceNode()->getWorkspace()->getUuid()]);
        $this->dispatcher->dispatch('log', LogSubjectEvent::class, [$subject, $usersToNotify, $action]);
    }

    private function getSubject(Message $message)
    {
        if (!$message->getSubject()) {
            $parent = $message->getParent();

            return $this->getSubject($parent);
        }

        return $message->getSubject();
    }
}
