<?php

/*
 * This file is part of the Claroline Connect package.
 *
 * (c) Claroline Consortium <consortium@claroline.net>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace Claroline\ScormBundle\Entity;

use Claroline\CoreBundle\Entity\Model\UuidTrait;
use Claroline\CoreBundle\Entity\Resource\AbstractResource;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass="Claroline\ScormBundle\Repository\ScormRepository")
 * @ORM\Table(name="claro_scorm")
 */
class Scorm extends AbstractResource
{
    use UuidTrait;

    const SCORM_12 = 'scorm_12';
    const SCORM_2004 = 'scorm_2004';

    /**
     * @ORM\Id
     * @ORM\Column(type="integer")
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    protected $id;

    /**
     * @ORM\Column()
     */
    protected $version;

    /**
     * @ORM\Column(name="hash_name")
     */
    protected $hashName;

    /**
     * @ORM\OneToMany(
     *     targetEntity="Claroline\ScormBundle\Entity\Sco",
     *     mappedBy="scorm"
     * )
     */
    protected $scos;

    public function __construct()
    {
        $this->refreshUuid();
        $this->scos = new ArrayCollection();
    }

    /**
     * @return int
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * @param int $id
     */
    public function setId($id)
    {
        $this->id = $id;
    }

    /**
     * @return string
     */
    public function getVersion()
    {
        return $this->version;
    }

    /**
     * @param string $version
     */
    public function setVersion($version)
    {
        $this->version = $version;
    }

    /**
     * @return string
     */
    public function getHashName()
    {
        return $this->hashName;
    }

    /**
     * @param string $hashName
     */
    public function setHashName($hashName)
    {
        $this->hashName = $hashName;
    }

    /**
     * @return Sco[]
     */
    public function getScos()
    {
        return $this->scos;
    }

    /**
     * @return Sco[]
     */
    public function getRootScos()
    {
        $roots = [];

        if (!empty($this->scos)) {
            foreach ($this->scos as $sco) {
                if (is_null($sco->getScoParent())) {
                    // Root sco found
                    $roots[] = $sco;
                }
            }
        }

        return $roots;
    }
}
