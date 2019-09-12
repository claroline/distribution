<?php

/*
 * This file is part of the Claroline Connect package.
 *
 * (c) Claroline Consortium <consortium@claroline.net>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace Claroline\CoreBundle\Twig;

use Claroline\CoreBundle\API\Serializer\Platform\ClientSerializer;
use Twig_Extension;

/**
 * Exposes Platform configuration to Twig templates.
 */
class PlatformConfigurationExtension extends Twig_Extension
{
    /** @var ClientSerializer */
    private $serializer;

    /**
     * PlatformConfigurationExtension constructor.
     *
     * @param ClientSerializer $serializer
     */
    public function __construct(
        ClientSerializer $serializer
    ) {
        $this->serializer = $serializer;
    }

    public function getName()
    {
        return 'claro_platform_configuration';
    }

    public function getFunctions()
    {
        return [
            'platform_config' => new \Twig_SimpleFunction('platform_config', [$this, 'getPlatformConfig']),
        ];
    }

    public function getPlatformConfig()
    {
        return $this->serializer->serialize();
    }
}
