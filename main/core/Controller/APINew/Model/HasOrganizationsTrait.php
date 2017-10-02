<?php

namespace Claroline\CoreBundle\Controller\APINew\Model;

use Claroline\CoreBundle\API\Crud;

trait HasOrganizationsTrait
{
    public function addOrganizations($uuid, $class, Request $request, $env)
    {
        try {
            $object = $this->find($class, $uuid);
            $organizations = $this->decodeIdsString($request, $class);
            $this->crud->patch($object, 'organizations', Crud::ADD_ARRAY_ELEMENT, $organizations);

            return new JsonResponse(
              $this->serializer->serialize($object)
          );
        } catch (\Exception $e) {
            $this->handleException($e, $env);
        }
    }

    public function removeOrganizations($uuid, $class, Request $request, $env)
    {
        try {
            $object = $this->find($class, $uuid);
            $organizations = $this->decodeIdsString($request, $class);
            $this->crud->patch($object, 'organizations', Crud::REMOVE_ARRAY_ELEMENT, $organizations);

            return new JsonResponse(
            $this->serializer->serialize($object)
        );
        } catch (\Exception $e) {
            $this->handleException($e, $env);
        }
    }
}
