<?php

namespace Claroline\CoreBundle\API\Serializer\Facet;

use Claroline\AppBundle\API\Options;
use Claroline\AppBundle\API\Serializer\SerializerTrait;
use Claroline\AppBundle\API\SerializerProvider;
use Claroline\CoreBundle\API\Serializer\User\RoleSerializer;
use Claroline\CoreBundle\Entity\Facet\Facet;
use Claroline\CoreBundle\Entity\Facet\PanelFacet;
use Claroline\CoreBundle\Entity\Role;
use JMS\DiExtraBundle\Annotation as DI;

/**
 * @DI\Service("claroline.serializer.facet")
 * @DI\Tag("claroline.serializer")
 */
class FacetSerializer
{
    use SerializerTrait;

    /**
     * @DI\InjectParams({
     *     "roleSerializer" = @DI\Inject("claroline.serializer.role"),
     *     "pfSerializer"   = @DI\Inject("claroline.serializer.panel_facet")
     * })
     *
     * @param SerializerProvider $serializer
     */
    public function __construct(RoleSerializer $roleSerializer, PanelFacetSerializer $pfSerializer)
    {
        $this->roleSerializer = $roleSerializer;
        $this->pfSerializer = $pfSerializer;
    }

    /**
     * @return string
     */
    public function getSchema()
    {
        return '#/main/core/facet.json';
    }

    /**
     * @param Facet $facet
     * @param array $options
     *
     * @return array
     */
    public function serialize(Facet $facet, array $options = [])
    {
        return [
          'id' => $facet->getUuid(),
          'title' => $facet->getName(),
          'position' => $facet->getPosition(),
          'display' => [
            'creation' => $facet->getForceCreationForm(),
          ],
          'roles' => array_map(function (Role $role) {
              return $this->roleSerializer->serialize($role, [Options::SERIALIZE_MINIMAL]);
          }, $facet->getRoles()->toArray()),
          'meta' => [
              'main' => $facet->isMain(),
          ],
          'sections' => array_map(function ($panel) use ($options) { // todo check user rights
              return $this->pfSerializer->serialize($panel, $options);
          }, $facet->getPanelFacets()->toArray()),
        ];
    }

    /**
     * @param array $data
     * @param Facet $facet
     * @param array $options
     */
    public function deserialize(array $data, Facet $facet = null, array $options = [])
    {
        $this->sipe('id', 'setUuid', $data, $facet);
        $this->sipe('title', 'setName', $data, $facet);
        $this->sipe('position', 'setPosition', $data, $facet);
        $this->sipe('meta.main', 'setMain', $data, $facet);
        $this->sipe('display.creation', 'setForceCreationForm', $data, $facet);

        if (isset($data['sections']) && in_array(Options::DEEP_DESERIALIZE, $options)) {
            $facet->resetPanelFacets();

            foreach ($data['sections'] as $section) {
                //check if section exists first
                $panelFacet = $this->_om->getObject($section, PanelFacet::class) ?? new PanelFacet();
                $this->pfSerializer->deserialize($section, $panelFacet);
                $panelFacet->setFacet($facet);
            }
        }
    }
}
