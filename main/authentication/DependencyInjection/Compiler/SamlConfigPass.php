<?php

/*
 * This file is part of the Claroline Connect package.
 *
 * (c) Claroline Consortium <consortium@claroline.net>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace Claroline\AuthenticationBundle\DependencyInjection\Compiler;

use Claroline\CoreBundle\Library\Configuration\PlatformConfigurationHandler;
use Symfony\Component\DependencyInjection\ChildDefinition;
use Symfony\Component\DependencyInjection\Compiler\CompilerPassInterface;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Definition;
use Symfony\Component\DependencyInjection\Reference;

class SamlConfigPass implements CompilerPassInterface
{
    public function process(ContainerBuilder $container)
    {
        /** @var PlatformConfigurationHandler $configHandler */
        $configHandler = $container->get(PlatformConfigurationHandler::class);

        $container->setParameter('entity_id', $configHandler->getParameter('external_authentication.saml.entity_id'));
        $container->setParameter('lightsaml.own.entity_id', $configHandler->getParameter('external_authentication.saml.entity_id'));
        $container->setParameter('credentials', $configHandler->getParameter('external_authentication.saml.credentials'));
        $container->setParameter('idp', $configHandler->getParameter('external_authentication.saml.idp'));

        // I need to reconfigure LightSaml to inject config form platform_options.json
        // There should be a better approach as I c/c code from base bundle and config in .yml is partially incorrect
        // maybe I should replace stores and make them handles it
        $this->configureOwnCredentials($container);

        $this->configureParty($container);
        $this->configureCredentialStore($container);
        $this->configureServiceCredentialResolver($container);
    }

    private function configureServiceCredentialResolver(ContainerBuilder $container)
    {
        $definition = $container->getDefinition('lightsaml.service.credential_resolver');
        $definition->setFactory([new Reference('lightsaml.service.credential_resolver_factory'), 'build']);
    }

    private function configureCredentialStore(ContainerBuilder $container)
    {
        $definition = $container->getDefinition('lightsaml.credential.credential_store');
        $definition->setFactory([new Reference('lightsaml.credential.credential_store_factory'), 'buildFromOwnCredentialStore']);
    }

    /**
     * Appends SP credentials declared in platform_options.json.
     *
     * @param ContainerBuilder $container
     */
    private function configureOwnCredentials(ContainerBuilder $container)
    {
        /** @var PlatformConfigurationHandler $configHandler */
        $configHandler = $container->get(PlatformConfigurationHandler::class);

        // adds credentials from platform_options.json
        $entityId = $configHandler->getParameter('external_authentication.saml.entity_id');
        $credentials = $configHandler->getParameter('external_authentication.saml.credentials');
        foreach ($credentials as $id => $data) {
            $definition = new Definition(
                'LightSaml\Store\Credential\X509FileCredentialStore',
                [
                    $entityId,
                    $data['certificate'],
                    $data['key'],
                    $data['password'],
                ]
            );
            $definition->addTag('lightsaml.own_credential_store');
            $container->setDefinition('lightsaml.own.credential_store.'.$entityId.'.'.$id, $definition);
        }
    }

    /**
     * Appends IDP metadata files declared in platform_options.json.
     *
     * @param ContainerBuilder $container
     */
    private function configureParty(ContainerBuilder $container)
    {
        /** @var PlatformConfigurationHandler $configHandler */
        $configHandler = $container->get(PlatformConfigurationHandler::class);

        $idpFiles = $configHandler->getParameter('external_authentication.saml.idp');
        if (isset($idpFiles)) {
            $store = $container->getDefinition('lightsaml.party.idp_entity_descriptor_store');
            foreach ($idpFiles as $id => $file) {
                $id = sprintf('lightsaml.party.idp_entity_descriptor_store.file.%s', $id);

                $container
                    ->setDefinition($id, new ChildDefinition('lightsaml.party.idp_entity_descriptor_store.file'))
                    ->replaceArgument(0, $file);

                $store->addMethodCall('add', [new Reference($id)]);
            }
        }
    }
}
