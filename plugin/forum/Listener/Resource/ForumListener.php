<?php

/*
 * This file is part of the Claroline Connect package.
 *
 * (c) Claroline Consortium <consortium@claroline.net>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace Claroline\ForumBundle\Listener\Resource;

use Claroline\AppBundle\API\Crud;
use Claroline\AppBundle\API\Options;
use Claroline\AppBundle\API\SerializerProvider;
use Claroline\AppBundle\Persistence\ObjectManager;
use Claroline\CoreBundle\Entity\Resource\AbstractResourceEvaluation;
use Claroline\CoreBundle\Event\ExportObjectEvent;
use Claroline\CoreBundle\Event\GenericDataEvent;
use Claroline\CoreBundle\Event\ImportObjectEvent;
use Claroline\CoreBundle\Event\Resource\DeleteResourceEvent;
use Claroline\CoreBundle\Event\Resource\LoadResourceEvent;
use Claroline\CoreBundle\Manager\Resource\ResourceEvaluationManager;
use Claroline\ForumBundle\Entity\Subject;
use Claroline\ForumBundle\Manager\Manager;
use JMS\DiExtraBundle\Annotation as DI;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

/**
 * @DI\Service
 */
class ForumListener
{
    /** @var ObjectManager */
    private $om;

    /** @var SerializerProvider */
    private $serializer;

    /** @var Crud */
    private $crud;

    /** @var ResourceEvaluationManager */
    private $evaluationManager;

    /** @var Manager */
    private $manager;

    /** @var TokenStorageInterface */
    private $tokenStorage;

    /**
     * ForumListener constructor.
     *
     * @DI\InjectParams({
     *     "om"                = @DI\Inject("claroline.persistence.object_manager"),
     *     "serializer"        = @DI\Inject("claroline.api.serializer"),
     *     "crud"              = @DI\Inject("claroline.api.crud"),
     *     "evaluationManager" = @DI\Inject("claroline.manager.resource_evaluation_manager"),
     *     "manager"           = @DI\Inject("claroline.manager.forum_manager"),
     *     "tokenStorage"      = @DI\Inject("security.token_storage")
     * })
     *
     * @param ObjectManager             $om
     * @param SerializerProvider        $serializer
     * @param Crud                      $crud
     * @param ResourceEvaluationManager $evaluationManager
     * @param Manager                   $manager
     * @param TokenStorageInterface     $tokenStorage
     */
    public function __construct(
        ObjectManager $om,
        SerializerProvider $serializer,
        Crud $crud,
        ResourceEvaluationManager $evaluationManager,
        Manager $manager,
        TokenStorageInterface $tokenStorage
    ) {
        $this->om = $om;
        $this->serializer = $serializer;
        $this->crud = $crud;
        $this->evaluationManager = $evaluationManager;
        $this->manager = $manager;
        $this->tokenStorage = $tokenStorage;
    }

    /**
     * Loads a Forum resource.
     *
     * @DI\Observe("resource.claroline_forum.load")
     *
     * @param LoadResourceEvent $event
     */
    public function onOpen(LoadResourceEvent $event)
    {
        $forum = $event->getResource();
        $user = $this->tokenStorage->getToken()->getUser();
        $isValidatedUser = false;

        if ('anon.' !== $user) {
            $validationUser = $this->manager->getValidationUser($user, $forum);
            $isValidatedUser = $validationUser->getAccess();
        }

        $event->setData([
            'forum' => $this->serializer->serialize($forum),
            'isValidatedUser' => $isValidatedUser,
        ]);

        $event->stopPropagation();
    }

    /**
     * Deletes a forum resource.
     *
     * @DI\Observe("delete_claroline_forum")
     *
     * @param DeleteResourceEvent $event
     */
    public function onDelete(DeleteResourceEvent $event)
    {
        $event->stopPropagation();
    }

    /**
     * @DI\Observe("transfer.claroline_forum.export")
     */
    public function onExport(ExportObjectEvent $exportEvent)
    {
        $forum = $exportEvent->getObject();
        $data = [
          'subjects' => array_map(function (Subject $subject) {
              return $this->serializer->serialize($subject);
          }, $forum->getSubjects()->toArray()),
        ];
        $exportEvent->overwrite('_data', $data);
    }

    /**
     * @DI\Observe("transfer.claroline_forum.import.after")
     */
    public function onImport(ImportObjectEvent $event)
    {
        $data = $event->getData();
        $forum = $event->getObject();

        foreach ($data['_data']['subjects'] as $subjectsData) {
            unset($subjectsData['forum']);
            $subject = $this->serializer->deserialize($subjectsData, new Subject(), [Options::REFRESH_UUID]);
            $subject->setForum($forum);
            $this->om->persist($subject);
        }
    }

    /**
     * Creates evaluation for forum resource.
     *
     * @DI\Observe("generate_resource_user_evaluation_claroline_forum")
     *
     * @param GenericDataEvent $event
     */
    public function onGenerateResourceTracking(GenericDataEvent $event)
    {
        $data = $event->getData();
        $node = $data['resourceNode'];
        $user = $data['user'];
        $startDate = $data['startDate'];

        $logs = $this->evaluationManager->getLogsForResourceTracking(
            $node,
            $user,
            ['resource-read', 'resource-claroline_forum-create_message'],
            $startDate
        );

        if (count($logs) > 0) {
            $this->om->startFlushSuite();
            $tracking = $this->evaluationManager->getResourceUserEvaluation($node, $user);
            $tracking->setDate($logs[0]->getDateLog());
            $status = AbstractResourceEvaluation::STATUS_UNKNOWN;
            $nbAttempts = 0;
            $nbOpenings = 0;

            foreach ($logs as $log) {
                switch ($log->getAction()) {
                    case 'resource-read':
                        ++$nbOpenings;

                        if (AbstractResourceEvaluation::STATUS_UNKNOWN === $status) {
                            $status = AbstractResourceEvaluation::STATUS_OPENED;
                        }
                        break;
                    case 'resource-claroline_forum-create_message':
                        ++$nbAttempts;
                        $status = AbstractResourceEvaluation::STATUS_PARTICIPATED;
                        break;
                }
            }
            $tracking->setStatus($status);
            $tracking->setNbAttempts($nbAttempts);
            $tracking->setNbOpenings($nbOpenings);
            $this->om->persist($tracking);
            $this->om->endFlushSuite();
        }
        $event->stopPropagation();
    }
}
