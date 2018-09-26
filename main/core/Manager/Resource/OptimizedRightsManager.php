<?php

/*
 * This file is part of the Claroline Connect package.
 *
 * (c) Claroline Consortium <consortium@claroline.net>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace Claroline\CoreBundle\Manager\Resource;

use Claroline\AppBundle\Event\StrictDispatcher;
use Claroline\BundleRecorder\Log\LoggableTrait;
use Claroline\CoreBundle\Entity\Resource\ResourceNode;
use Claroline\CoreBundle\Entity\Role;
use Doctrine\DBAL\Connection;
use JMS\DiExtraBundle\Annotation as DI;

/**
 * Right manager optimizations.
 *
 * @DI\Service("claroline.manager.optimized_rights_manager")
 */
class OptimizedRightsManager
{
    use LoggableTrait;

    /**
     * @DI\InjectParams({
     *     "conn" = @DI\Inject("doctrine.dbal.default_connection")
     * })
     *
     * @param StrictDispatcher $dispatcher
     */
    public function __construct(Connection $conn)
    {
        $this->conn = $conn;
    }

    public function update(ResourceNode $node, Role $role, $mask = 1, $types = [], $recursive = false)
    {
        $recursive ?
            $this->recursiveUpdate($node, $role, $mask, $types) :
            $this->singleUpdate($node, $role, $mask, $types);
    }

    //todo: use prepared statements instead
    private function singleUpdate(ResourceNode $node, Role $role, $mask = 1, $types = [])
    {
        $sql =
          "
            INSERT INTO claro_resource_rights (role_id, mask, resourceNode_id)
            VALUES ({$role->getId()}, {$mask}, {$node->getId()})
            ON DUPLICATE KEY UPDATE mask = {$mask};
          ";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute();

        //then update the ResourceRightsList
        $sql = "
            DELETE list FROM claro_list_type_creation list
            JOIN claro_resource_rights rights ON list.resource_rights_id = rights.id
            JOIN claro_role role ON rights.role_id = role.id
            JOIN claro_resource_node node ON rights.resourceNode_id = node.id
            WHERE node.id = {$node->getId()}
            AND role.id = {$role->getId()}
        ";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute();

        if (0 === count($types)) {
            return;
        }

        $typeList = implode(',', array_map(function ($type) {
            return "'{$type->getName()}'";
        }, $types));

        $sql = "
          INSERT INTO claro_list_type_creation (resource_rights_id, resource_type_id)
          SELECT r.id as rid, t.id as tid FROM (
            SELECT rights.id
            FROM claro_resource_rights rights
            JOIN claro_resource_node node ON rights.resourceNode_id = node.id
            JOIN claro_role role ON rights.role_id = role.id
            WHERE node.id = {$node->getId()}
            AND role.id = {$role->getId()}
          ) as r, (
            SELECT id
            FROM claro_resource_type
            WHERE name IN
            ({$typeList})
          ) as t GROUP BY tid
        ";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute();
    }

    //todo: use prepared statements instead
    private function recursiveUpdate(ResourceNode $node, Role $role, $mask = 1, $types = [])
    {
        $sql =
          "
            INSERT INTO claro_resource_rights (role_id, mask, resourceNode_id)
            SELECT ({$role->getId()}, {$mask}, node.id) FROM claro_resource_node node
            WHERE node.materializedPath LIKE CONCAT('".\mysql_real_escape_string($node->getPath())."', '%')
            ON DUPLICATE KEY UPDATE mask = {$mask};
          ";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute();

        return;
        //then update the ResourceRightsList
        $sql = "
          DELETE list FROM claro_list_type_creation list
          JOIN claro_resource_rights rights ON list.resource_rights_id = rights.id
          JOIN claro_role role ON rights.role_id = role.id
          JOIN claro_resource_node node ON rights.resourceNode_id = node.id
          WHERE node.id = {$node->getId()}
          AND role.id = {$role->getId()}
      ";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute();

        if (0 === count($types)) {
            return;
        }

        $typeList = implode(',', array_map(function ($type) {
            return "'{$type->getName()}'";
        }, $types));

        $sql = "
        INSERT INTO claro_list_type_creation (resource_rights_id, resource_type_id)
        SELECT r.id as rid, t.id as tid FROM (
          SELECT rights.id
          FROM claro_resource_rights rights
          JOIN claro_resource_node node ON rights.resourceNode_id = node.id
          JOIN claro_role role ON rights.role_id = role.id
          WHERE node.id = {$node->getId()}
          AND role.id = {$role->getId()}
        ) as r, (
          SELECT id
          FROM claro_resource_type
          WHERE name IN
          ({$typeList})
        ) as t GROUP BY tid
      ";

        $stmt = $this->conn->prepare($sql);
        $stmt->execute();
    }
}
