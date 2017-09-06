<?php
/**
 * This file is part of the Claroline Connect package.
 *
 * (c) Claroline Consortium <consortium@claroline.net>
 *
 * Author: Panagiotis TSAVDARIS
 *
 * Date: 2/20/15
 */

namespace Inwicast\ClarolinePluginBundle\Form;

use JMS\DiExtraBundle\Annotation as DI;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolverInterface;

/**
 * Class MediacenterType.
 *
 * @DI\FormType;
 */
class MediacenterType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('url', 'url', ['required' => true])
            ->add('driver', 'text', ['required' => true])
            ->add('host', 'text', ['required' => true])
            ->add('port', 'text', ['required' => true])
            ->add('dbname', 'text', ['required' => true])
            ->add('user', 'text', ['required' => true])
            ->add('password', 'password', ['required' => true]);
    }

    /**
     * Returns the name of this type.
     *
     * @return string The name of this type
     */
    public function getName()
    {
        return 'inwicast_plugin_type_mediacenter';
    }

    public function setDefaultOptions(OptionsResolverInterface $resolver)
    {
        $resolver->setDefaults(
            [
                'translation_domain' => 'widget',
                'data_class' => 'Inwicast\ClarolinePluginBundle\Entity\Mediacenter',
                'csrf_protection' => true,
            ]
        );
    }
}
