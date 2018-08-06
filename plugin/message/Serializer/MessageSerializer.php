<?php

namespace Claroline\MessageBundle\Serializer;

use Claroline\AppBundle\API\Options;
use Claroline\AppBundle\API\Serializer\SerializerTrait;
use Claroline\AppBundle\API\SerializerProvider;
use Claroline\AppBundle\Persistence\ObjectManager;
use Claroline\CoreBundle\API\Serializer\MessageSerializer as AbstractMessageSerializer;
use Claroline\CoreBundle\API\Serializer\User\UserSerializer;
use Claroline\CoreBundle\Library\Normalizer\DateNormalizer;
use Claroline\MessageBundle\Entity\Message;
use Claroline\MessageBundle\Entity\UserMessage;
use Claroline\MessageBundle\Manager\MessageManager;
use JMS\DiExtraBundle\Annotation as DI;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

/**
 * @DI\Service("claroline.serializer.messaging_message")
 * @DI\Tag("claroline.serializer")
 */
class MessageSerializer
{
    use SerializerTrait;

    /** @var AbstractMessageSerializer */
    private $messageSerializer;

    /**
     * ParametersSerializer constructor.
     *
     * @DI\InjectParams({
     *     "om"             = @DI\Inject("claroline.persistence.object_manager"),
     *     "tokenStorage"   = @DI\Inject("security.token_storage"),
     *     "manager"        = @DI\Inject("claroline.manager.message_manager"),
     *     "userSerializer" = @DI\Inject("claroline.serializer.user"),
     * })
     *
     * @param SerializerProvider        $serializer
     * @param AbstractMessageSerializer $messageSerializer
     */
    public function __construct(
        ObjectManager $om,
        MessageManager $manager,
        TokenStorageInterface $tokenStorage,
        UserSerializer $userSerializer
    ) {
        $this->om = $om;
        $this->tokenStorage = $tokenStorage;
        $this->manager = $manager;
        $this->userSerializer = $userSerializer;
    }

    public function getClass()
    {
        return Message::class;
    }

    /**
     * @return string
     */
    /*
    public function getSchema()
    {
       return '#/plugin/message/message.json';
    }*/

    /**
     * Serializes a Message entity.
     *
     * @param Message $message
     * @param array   $options
     *
     * @return array
     */
    public function serialize(Message $message, array $options = [])
    {
        $userMessage = $this->getUserMessage($message);

        $data = [
          'id' => $message->getId(),
          'object' => $message->getObject(),
          'content' => $message->getContent(),
          'to' => $message->getTo(),
          'from' => $this->userSerializer->serialize($message->getSender(), [Options::SERIALIZE_MINIMAL]),
          'meta' => [
            'date' => DateNormalizer::normalize($message->getDate()),
            'read' => $userMessage->isRead(),
            'removed' => $userMessage->isRemoved(),
            'sent' => $userMessage->isSent(),
          ],
        ];

        if (in_array(Options::IS_RECURSIVE, $options)) {
            $data['children'] = array_map(function (Message $child) {
                return $this->serialize($child);
            }, $message->getChildren()->toArray());
        }

        return $data;
    }

    /**
     * Deserializes data into a Message entity.
     *
     * @param array   $data
     * @param Message $message
     * @param array   $options
     *
     * @return Plugin
     */
    public function deserialize($data, Message $message, array $options = [])
    {
        $userMessage = $this->getUserMessage($message);

        $this->sipe('object', 'setObject', $data, $message);
        $this->sipe('content', 'setContent', $data, $message);
        $this->sipe('to', 'setTo', $data, $message);
        $currentUser = $this->tokenStorage->getToken()->getUser();

        if (isset($data['parent'])) {
            $parent = $this->om->getRepository(Message::class)->find($data['parent']['id']);
            $message->setParent($parent);
        }

        $message->setSender($currentUser);

        if (isset($data['meta'])) {
            if (isset($data['meta']['removed'])) {
                $userMessage->setIsRemoved($data['meta']['removed']);
            }

            if (isset($data['meta']['read'])) {
                $userMessage->setIsRead($data['meta']['removed']);
            }

            $this->om->persist($userMessage);
        }

        return $message;
    }

    private function getUserMessage(Message $message)
    {
        $currentUser = $this->tokenStorage->getToken()->getUser();

        return $this->om->getRepository(UserMessage::class)->findOneBy(['message' => $message, 'user' => $currentUser]);
    }
}
