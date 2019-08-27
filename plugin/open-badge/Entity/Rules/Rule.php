<?php

/*
 * This file is part of the Claroline Connect package.
 *
 * (c) Claroline Consortium <consortium@claroline.net>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace Claroline\OpenBadgeBundle\Entity\Rules;

use Claroline\CoreBundle\Entity\Model\UuidTrait;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity
 * @ORM\Table(name="claro__open_badge_rule")
 */
class Rule
{
    //[parcours/exo/dropzone]
    const RULE_RESOURCE_PASSED = 'resource_passed';
    //tag [evaluation]
    const RULE_RESOURCE_SCORE_ABOVE = 'resource_score_above';
    //tlm //exclure les répertoires
    const RULE_RESOURCE_COMPLETED_ABOVE = 'resource_completed_above';

    const RULE_WORKSPACE_PASSED = 'workspace_passed';
    const RULE_WORKSPACE_SCORE_ABOVE = 'workspace_score_above';
    const RULE_WORKSPACE_COMPLETED_ABOVE = 'workspace_completed_above';
    const RULE_RESOURCE_PARTICIPATED = 'resource_participated';

    const IN_GROUP = 'in_group';
    const IN_ROLE = 'in_role';
    const RULE_PROFILE_COMPLETED = 'profile_completed';

    use UuidTrait;

    /**
     * @var int
     *
     * @ORM\Column(name="id", type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    protected $id;

    /**
     * @var string
     *
     * @ORM\Column(type="string", nullable=false)
     */
    protected $action;

    /**
     * @ORM\ManyToOne(targetEntity="Claroline\OpenBadgeBundle\Entity\BadgeClass", inversedBy="rules")
     *
     * @var BadgeClass
     */
    private $badge;

    /**
     * @ORM\Column(type="json_array")
     *
     * @var array
     */
    private $data = [];

    /**
     * @ORM\ManyToOne(targetEntity="Claroline\CoreBundle\Entity\Resource\ResourceNode")
     */
    private $node;

    /**
     * @ORM\ManyToOne(targetEntity="Claroline\CoreBundle\Entity\Workspace\Workspace")
     */
    private $workspace;

    /**
     * @ORM\ManyToOne(targetEntity="Claroline\CoreBundle\Entity\Role")
     */
    private $role;

    /**
     * @ORM\ManyToOne(targetEntity="Claroline\CoreBundle\Entity\Group")
     */
    private $group;

    public function __construct()
    {
        $this->refreshUuid();
    }

    public function setAction($action)
    {
        $this->action = $action;
    }

    public function getAction()
    {
        return $this->action;
    }

    public function getId()
    {
        return $this->id;
    }

    public function setData(array $data = [])
    {
        $this->data = $data;
    }

    public function getData()
    {
        return $this->data;
    }

    public function setBadge($badge)
    {
        $this->badge = $badge;
    }

    public function getBadge()
    {
        return $this->badge;
    }

    public function setResourceNode($node)
    {
        $this->node = $node;
    }

    public function getResourceNode()
    {
        return $this->node;
    }

    public function setWorkspace($workspace)
    {
        $this->workspace = $workspace;
    }

    public function getWorkspace()
    {
        return $this->workspace;
    }

    public function setGroup($group)
    {
        $this->group = $group;
    }

    public function getGroup()
    {
        return $this->group;
    }

    public function setRole($role)
    {
        $this->role = $role;
    }

    public function getRole()
    {
        return $this->role;
    }
}
