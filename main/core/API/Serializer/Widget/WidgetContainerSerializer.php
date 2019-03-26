<?php

namespace Claroline\CoreBundle\API\Serializer\Widget;

use Claroline\AppBundle\API\Serializer\SerializerTrait;
use Claroline\AppBundle\Persistence\ObjectManager;
use Claroline\CoreBundle\API\Finder\Home\WidgetInstanceFinder;
use Claroline\CoreBundle\API\Serializer\File\PublicFileSerializer;
use Claroline\CoreBundle\Entity\File\PublicFile;
use Claroline\CoreBundle\Entity\Widget\WidgetContainer;
use Claroline\CoreBundle\Entity\Widget\WidgetContainerConfig;
use Claroline\CoreBundle\Entity\Widget\WidgetInstance;
use JMS\DiExtraBundle\Annotation as DI;

/**
 * @DI\Service("claroline.serializer.widget_container")
 * @DI\Tag("claroline.serializer")
 */
class WidgetContainerSerializer
{
    use SerializerTrait;

    /** @var ObjectManager */
    private $om;

    /** @var WidgetInstanceFinder */
    private $widgetInstanceFinder;

    /** @var WidgetInstanceSerializer */
    private $widgetInstanceSerializer;

    /**
     * WidgetContainerSerializer constructor.
     *
     * @DI\InjectParams({
     *     "om"                       = @DI\Inject("claroline.persistence.object_manager"),
     *     "widgetInstanceFinder"     = @DI\Inject("claroline.api.finder.widget_instance"),
     *     "widgetInstanceSerializer" = @DI\Inject("claroline.serializer.widget_instance"),
     *     "publicFileSerializer"     = @DI\Inject("claroline.serializer.public_file")
     * })
     *
     * @param ObjectManager            $om
     * @param WidgetInstanceSerializer $widgetInstanceSerializer
     * @param WidgetInstanceFinder     $widgetInstanceFinder
     */
    public function __construct(
        ObjectManager $om,
        WidgetInstanceFinder $widgetInstanceFinder,
        WidgetInstanceSerializer $widgetInstanceSerializer,
        PublicFileSerializer $publicFileSerializer
    ) {
        $this->om = $om;
        $this->widgetInstanceFinder = $widgetInstanceFinder;
        $this->widgetInstanceSerializer = $widgetInstanceSerializer;
        $this->publicFileSerializer = $publicFileSerializer;
    }

    public function getClass()
    {
        return WidgetContainer::class;
    }

    public function serialize(WidgetContainer $widgetContainer, array $options = []): array
    {
        $widgetContainerConfig = $widgetContainer->getWidgetContainerConfigs()[0];

        $contents = [];
        $arraySize = count($widgetContainerConfig->getLayout());

        for ($i = 0; $i < $arraySize; ++$i) {
            $contents[$i] = null;
        }

        foreach ($widgetContainer->getInstances() as $widgetInstance) {
            $config = $widgetInstance->getWidgetInstanceConfigs()[0];

            if ($config) {
                $contents[$config->getPosition()] = $this->widgetInstanceSerializer->serialize($widgetInstance, $options);
            }
        }

        return [
            'id' => $this->getUuid($widgetContainer, $options),
            'name' => $widgetContainerConfig->getName(),
            'visible' => $widgetContainerConfig->isVisible(),
            'display' => $this->serializeDisplay($widgetContainerConfig),
            'contents' => $contents,
        ];
    }

    public function serializeDisplay(WidgetContainerConfig $widgetContainerConfig)
    {
        $display = [
            'layout' => $widgetContainerConfig->getLayout(),
            'alignName' => $widgetContainerConfig->getAlignName(),
            'color' => $widgetContainerConfig->getColor(),
            'borderColor' => $widgetContainerConfig->getBorderColor(),
            'backgroundType' => $widgetContainerConfig->getBackgroundType(),
            'background' => $widgetContainerConfig->getBackground(),
        ];

        if ('image' === $widgetContainerConfig->getBackgroundType() && $widgetContainerConfig->getBackground()) {
            $file = $this->om
              ->getRepository(PublicFile::class)
              ->findOneBy(['url' => $widgetContainerConfig->getBackground()]);

            if ($file) {
                $display['background'] = $this->publicFileSerializer->serialize($file);
            }
        } else {
            $display['background'] = $widgetContainerConfig->getBackground();
        }

        return $display;
    }

    public function deserialize($data, WidgetContainer $widgetContainer, array $options): WidgetContainer
    {
        $widgetContainerConfig = $this->om->getRepository(WidgetContainerConfig::class)
          ->findOneBy(['widgetContainer' => $widgetContainer]);

        if (!$widgetContainerConfig) {
            $widgetContainerConfig = new WidgetContainerConfig();
            $widgetContainerConfig->setWidgetContainer($widgetContainer);
            $this->om->persist($widgetContainerConfig);
            $this->om->persist($widgetContainer);
        }

        $this->sipe('id', 'setUuid', $data, $widgetContainer);
        $this->sipe('name', 'setName', $data, $widgetContainerConfig);
        $this->sipe('visible', 'setVisible', $data, $widgetContainerConfig);
        $this->sipe('display.layout', 'setLayout', $data, $widgetContainerConfig);
        $this->sipe('display.alignName', 'setAlignName', $data, $widgetContainerConfig);
        $this->sipe('display.color', 'setColor', $data, $widgetContainerConfig);
        $this->sipe('display.borderColor', 'setBorderColor', $data, $widgetContainerConfig);
        $this->sipe('display.backgroundType', 'setBackgroundType', $data, $widgetContainerConfig);

        $display = $data['display'];

        if (isset($display['background']) && isset($display['background']['url'])) {
            $this->sipe('display.background.url', 'setBackground', $data, $widgetContainerConfig);
        } else {
            $this->sipe('display.background', 'setBackground', $data, $widgetContainerConfig);
        }

        $instanceIds = [];

        if (isset($data['contents'])) {
            foreach ($data['contents'] as $index => $content) {
                if ($content) {
                    /** @var WidgetInstance $widgetInstance */
                    $widgetInstance = $this->findInCollection($widgetContainer, 'getInstances', $content['id'], WidgetInstance::class) ?? new WidgetInstance();
                    $this->widgetInstanceSerializer->deserialize($content, $widgetInstance, $options);
                    $widgetInstanceConfig = $widgetInstance->getWidgetInstanceConfigs()[0];
                    $widgetInstanceConfig->setPosition($index);
                    $widgetInstance->setContainer($widgetContainer);

                    // We either do this or cascade persist ¯\_(ツ)_/¯
                    $this->om->persist($widgetInstance);
                    $this->om->persist($widgetInstanceConfig);

                    $instanceIds[] = $widgetInstance->getUuid();
                }
            }
        }

        return $widgetContainer;
    }
}
