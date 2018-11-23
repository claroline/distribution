<?php

/*
 * This file is part of the Claroline Connect package.
 *
 * (c) Claroline Consortium <consortium@claroline.net>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace Claroline\CoreBundle\Manager\Workspace\Transfer\Resources;

use Claroline\AppBundle\API\Crud;
use Claroline\AppBundle\API\FinderProvider;
use Claroline\AppBundle\API\SerializerProvider;
use Claroline\AppBundle\Event\StrictDispatcher;
use Claroline\AppBundle\Persistence\ObjectManager;
use Claroline\CoreBundle\Entity\Resource\ResourceNode;
use Claroline\CoreBundle\Event\ExportObjectEvent;
use JMS\DiExtraBundle\Annotation as DI;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorage;

/**
 * @DI\Service
 */
class Listener
{
    /**
     * ResourceNodeManager constructor.
     *
     * @DI\InjectParams({
     *     "filesDir" = @DI\Inject("%claroline.param.files_directory%"),
     *     "serializer"   = @DI\Inject("claroline.api.serializer"),
     *     "finder"       = @DI\Inject("claroline.api.finder"),
     *     "crud"         = @DI\Inject("claroline.api.crud"),
     *     "tokenStorage" = @DI\Inject("security.token_storage"),
     *     "dispatcher"   = @DI\Inject("claroline.event.event_dispatcher"),
     *     "om"           = @DI\Inject("claroline.persistence.object_manager")
     * })
     *
     * @param RouterInterface $router
     */
    public function __construct(
        $filesDir,
        SerializerProvider $serializer,
        FinderProvider $finder,
        Crud $crud,
        TokenStorage $tokenStorage,
        StrictDispatcher $dispatcher,
        ObjectManager $om
    ) {
        $this->filesDir = $filesDir;
        $this->serializer = $serializer;
        $this->om = $om;
        $this->finder = $finder;
        $this->crud = $crud;
        $this->tokenStorage = $tokenStorage;
        $this->dispatcher = $dispatcher;
    }

    /**
     * @DI\Observe("transfer_export_claroline_corebundle_entity_resource_resourcenode")
     */
    public function onExportResourceNode(ExportObjectEvent $event)
    {
        $data = $event->getData();

        $resourceNode = $this->om->getRepository(ResourceNode::class)->find($data['autoId']);
        $resource = $this->om->getRepository($resourceNode->getClass())->findOneBy(['resourceNode' => $resourceNode]);

        //use listener instead
        if (isset($data['resource'])) {
            $new = $this->dispatcher->dispatch(
                'transfer_export_'.$this->getUnderscoreClassName(get_class($resource)),
                'Claroline\\CoreBundle\\Event\\ExportObjectEvent',
                [$resource, $event->getFileBag(), $data['resource']]
            );

            $event->overwrite('resource', $new->getData());
        }

        if (isset($data['children'])) {
            foreach ($data['children'] as $key => $child) {
                $resourceNode = $this->om->getRepository(ResourceNode::class)->find($child['autoId']);
                $resource = $this->om->getRepository($resourceNode->getClass())->findOneBy(['resourceNode' => $resourceNode]);
                $recursive = new ExportObjectEvent($resource, $event->getFileBag(), $child);
                $this->onExportResourceNode($recursive);
                $event->overwrite('children.'.$key, $recursive->getData());
                /*
                $recursive = $this->dispatcher->dispatch(
                  'transfer_export_'.$this->getUnderscoreClassName(get_class($resource)),
                  'Claroline\\CoreBundle\\Event\\ExportObjectEvent',
                  [$resource, $event->getFileBag(), $child]
                );*/
                $event->overwrite('children.'.$key, $recursive->getData());
            }
        }
    }

    /**
     * @DI\Observe("transfer_export_claroline_corebundle_entity_resource_file")
     */
    public function onExportFile(ExportObjectEvent $exportEvent)
    {
        $file = $exportEvent->getObject();
        $path = $this->filesDir.DIRECTORY_SEPARATOR.$file->getHashName();
        $file = $exportEvent->getObject();
        $newPath = uniqid().'.'.pathinfo($file->getHashName(), PATHINFO_EXTENSION);
        //get the filePath
        $exportEvent->addFile($newPath, $path);
        $exportEvent->overwrite('_path', $newPath);
    }

    private function getUnderscoreClassName($className)
    {
        return strtolower(str_replace('\\', '_', $className));
    }
}
