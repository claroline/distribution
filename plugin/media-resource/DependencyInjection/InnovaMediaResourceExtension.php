<?php

namespace Innova\MediaResourceBundle\DependencyInjection;

use Symfony\Component\Config\FileLocator;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Loader\YamlFileLoader;
use Symfony\Component\HttpKernel\DependencyInjection\Extension;

class InnovaMediaResourceExtension extends Extension
{
    /*
     * {@inheritdoc}
     */
    public function load(array $configs, ContainerBuilder $container)
    {
        //$locator = new FileLocator(__DIR__.'/../Resources/config');
        //$loader = new YamlFileLoader($container, $locator);
    }
}
