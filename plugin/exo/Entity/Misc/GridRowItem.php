<?php

namespace UJM\ExoBundle\Entity\Misc;

use Doctrine\ORM\Mapping as ORM;
use Claroline\AppBundle\Entity\Meta\Order;

/**
 * GridRowItem.
 *
 * @ORM\Entity()
 * @ORM\Table("ujm_grid_row_item")
 */
class GridRowItem
{
    use Order;

    /**
     * @ORM\Id
     * @ORM\ManyToOne(targetEntity="UJM\ExoBundle\Entity\Misc\GridRow", inversedBy="stepQuestions")
     * @ORM\JoinColumn(onDelete="CASCADE")
     *
     * @var GridRow
     */
    private $row;

    /**
     * @ORM\Id
     * @ORM\ManyToOne(targetEntity="UJM\ExoBundle\Entity\Misc\GridItem", cascade={"persist"})
     * @ORM\JoinColumn(onDelete="CASCADE")
     *
     * @var GridItem
     */
    private $item;

    /**
     * Get row.
     *
     * @return GridRow
     */
    public function getRow()
    {
        return $this->row;
    }

    /**
     * Set row.
     *
     * @param GridRow $row
     */
    public function setRow(GridRow $row)
    {
        $this->row = $row;
    }

    /**
     * Get item.
     *
     * @return GridItem
     */
    public function getItem()
    {
        return $this->item;
    }

    /**
     * Set item.
     *
     * @param GridItem $item
     */
    public function setItem(GridItem $item)
    {
        $this->item = $item;
    }
}
