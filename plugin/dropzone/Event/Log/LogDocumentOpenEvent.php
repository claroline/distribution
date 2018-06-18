<?php

namespace Icap\DropzoneBundle\Event\Log;

use Claroline\CoreBundle\Event\Log\AbstractLogResourceEvent;
use Claroline\CoreBundle\Event\Log\LogGenericEvent;
use Icap\DropzoneBundle\Entity\Document;
use Icap\DropzoneBundle\Entity\Drop;
use Icap\DropzoneBundle\Entity\Dropzone;

class LogDocumentOpenEvent extends AbstractLogResourceEvent
{
    const ACTION = 'resource-icap_dropzone-document_open';

    /**
     * @param Dropzone $dropzone
     * @param Drop     $drop
     * @param Document $document
     */
    public function __construct(Dropzone $dropzone, Drop $drop, Document $document)
    {
        $details = [
            'dropzone' => [
                'id' => $dropzone->getId(),
            ],
            'drop' => [
                'id' => $drop->getId(),
                'owner' => [
                    'id' => $drop->getUser()->getId(),
                    'lastName' => $drop->getUser()->getLastName(),
                    'firstName' => $drop->getUser()->getFirstName(),
                    'username' => $drop->getUser()->getUsername(),
                ],
            ],
            'document' => $document->toArray(),
        ];

        parent::__construct($dropzone->getResourceNode(), $details);
    }

    /**
     * @return array
     */
    public static function getRestriction()
    {
        return [LogGenericEvent::DISPLAYED_WORKSPACE];
    }
}
