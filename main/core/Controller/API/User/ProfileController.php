<?php

/*
 * This file is part of the Claroline Connect package.
 *
 * (c) Claroline Consortium <consortium@claroline.net>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace Claroline\CoreBundle\Controller\API\User;

use Claroline\CoreBundle\Entity\User;
use Claroline\CoreBundle\Event\Profile\ProfileLinksEvent;
use Claroline\CoreBundle\Library\Security\Collection\FieldFacetCollection;
use Claroline\CoreBundle\Manager\FacetManager;
use FOS\RestBundle\Controller\Annotations\Get;
use FOS\RestBundle\Controller\Annotations\NamePrefix;
use FOS\RestBundle\Controller\Annotations\View;
use FOS\RestBundle\Controller\FOSRestController;
use JMS\DiExtraBundle\Annotation as DI;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

/**
 * @NamePrefix("api_")
 */
class ProfileController extends FOSRestController
{
    /**
     * @DI\InjectParams({
     *     "facetManager" = @DI\Inject("claroline.manager.facet_manager"),
     *     "tokenStorage" = @DI\Inject("security.token_storage"),
     *     "request"      = @DI\Inject("request")
     * })
     */
    public function __construct(
        FacetManager $facetManager,
        TokenStorageInterface $tokenStorage,
        Request $request
    ) {
        $this->facetManager = $facetManager;
        $this->tokenStorage = $tokenStorage;
        $this->request = $request;
    }

    /**
     * @Get("/profile/{user}/facets", name="get_profile_facets", options={ "method_prefix" = false })
     * @View(serializerGroups={"api_profile"})
     */
    public function getFacetsAction(User $user)
    {
        $facets = $this->facetManager->getFacetsByUser($user);
        $ffvs = $this->facetManager->getFieldValuesByUser($user);

        foreach ($facets as $facet) {
            foreach ($facet->getPanelFacets() as $panelFacet) {
                if (!$this->isGranted('VIEW', $panelFacet)) {
                    //remove the panel because it's not supposed to be shown
                    $facet->removePanelFacet($panelFacet);
                } else {
                    foreach ($panelFacet->getFieldsFacet() as $field) {
                        foreach ($ffvs as $ffv) {
                            if ($ffv->getFieldFacet()->getId() === $field->getId()) {
                                //for serialization
                                $field->setUserFieldValue($ffv);
                            }
                        }

                        $field->setIsEditable($this->isGranted('EDIT', new FieldFacetCollection([$field], $user)));
                    }
                }
            }
        }

        return $facets;
    }

    /**
     * @Get("/profile/{user}/links", name="get_profile_links", options={ "method_prefix" = false })
     */
    public function getProfileLinksAction(User $user)
    {
        //add check access

        $request = $this->get('request');
        $profileLinksEvent = new ProfileLinksEvent($user, $request->getLocale());
        $this->get('event_dispatcher')->dispatch(
            'profile_link_event',
            $profileLinksEvent
        );

        return $profileLinksEvent->getLinks();
    }
}
