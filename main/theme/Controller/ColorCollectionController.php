<?php

namespace Claroline\ThemeBundle\Controller;

use Claroline\AppBundle\Controller\AbstractCrudController;
use Symfony\Component\Routing\Annotation\Route;

/**
 * @Route("/color")
 */
class ColorCollectionController extends AbstractCrudController
{
    public function getName()
    {
        return 'color_collection';
    }
}
