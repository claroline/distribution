<?php

/*
 * This file is part of the Claroline Connect package.
 *
 * (c) Claroline Consortium <consortium@claroline.net>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace Claroline\HomeBundle\Entity;

use Claroline\AppBundle\Entity\Identifier\Id;
use Claroline\AppBundle\Entity\Identifier\Uuid;
use Claroline\AppBundle\Entity\Meta\Poster;
use Claroline\CoreBundle\Entity\User;
use Claroline\CoreBundle\Entity\Workspace\Workspace;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity
 * @ORM\Table(name="claro_home_tab")
 */
class HomeTab
{
    use Id;
    use Poster;
    use Uuid;

    const TYPE_WORKSPACE = 'workspace';
    const TYPE_DESKTOP = 'desktop';
    const TYPE_ADMIN_DESKTOP = 'administration';
    const TYPE_HOME = 'home';
    const TYPE_ADMIN = 'admin';

    /**
     * @ORM\Column(nullable=false)
     *
     * @var string
     */
    private $context;

    /**
     * @ORM\Column(nullable=false)
     *
     * @var string
     */
    private $type;

    /**
     * The class that holds the tab custom configuration if any.
     *
     * @ORM\Column(nullable=true)
     *
     * @var string
     */
    private $class = null;

    /**
     * @ORM\ManyToOne(targetEntity="Claroline\CoreBundle\Entity\User")
     * @ORM\JoinColumn(name="user_id", nullable=true, onDelete="CASCADE")
     *
     * @var User
     */
    private $user = null;

    /**
     * @ORM\ManyToOne(targetEntity="Claroline\CoreBundle\Entity\Workspace\Workspace")
     * @ORM\JoinColumn(name="workspace_id", nullable=true, onDelete="CASCADE")
     *
     * @var Workspace
     */
    private $workspace = null;

    /**
     * @ORM\OneToMany(
     *     targetEntity="Claroline\HomeBundle\Entity\HomeTabConfig",
     *     mappedBy="homeTab",
     *     cascade={"persist", "remove"}
     * )
     *
     * @var HomeTabConfig[]|ArrayCollection
     */
    private $homeTabConfigs;

    public function __construct()
    {
        $this->refreshUuid();

        $this->homeTabConfigs = new ArrayCollection();
    }

    public function getContext(): string
    {
        return $this->context;
    }

    public function setContext(string $context)
    {
        $this->context = $context;
    }

    public function getType()
    {
        return $this->type;
    }

    public function setType($type)
    {
        $this->type = $type;
    }

    public function getClass(): ?string
    {
        return $this->class;
    }

    public function setClass(string $class = null)
    {
        $this->class = $class;
    }

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(User $user)
    {
        $this->user = $user;
    }

    public function getWorkspace(): ?Workspace
    {
        return $this->workspace;
    }

    public function setWorkspace(Workspace $workspace)
    {
        $this->workspace = $workspace;
    }

    public function getHomeTabConfigs(): ArrayCollection
    {
        return $this->homeTabConfigs;
    }

    public function addHomeTabConfig(HomeTabConfig $config)
    {
        if (!$this->homeTabConfigs->contains($config)) {
            $this->homeTabConfigs->add($config);
        }
    }

    public function removeHomeTabConfig(HomeTabConfig $config)
    {
        if ($this->homeTabConfigs->contains($config)) {
            $this->homeTabConfigs->removeElement($config);
        }
    }
}
