<?php

/*
 * This file is part of the Claroline Connect package.
 *
 * (c) Claroline Consortium <consortium@claroline.net>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace Claroline\CoreBundle\Form\Administration;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class InternationalizationType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $availables = [];
        foreach ($options['availableLocales'] as $available) {
            $availables[$available] = $available;
        }

        $builder->add(
            'locales',
            ChoiceType::class, [
                'choices' => $availables,
                'label' => 'languages',
                'expanded' => true,
                'multiple' => true,
                'data' => $options['activatedLocales'],
            ]
        );
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'translation_domain' => 'platform',
            'activatedLocales' => [],
            'availableLocales' => [],
        ]);
    }
}
