<?php

namespace Claroline\CoreBundle\Form;

use Symfony\Component\Form\FormBuilderInterface;
use Claroline\CoreBundle\Entity\Role;
use Symfony\Component\OptionsResolver\OptionsResolverInterface;
use Doctrine\Common\Collections\ArrayCollection;
use Symfony\Component\Form\AbstractType;

class ProfileType extends AbstractType
{
    private $platformRoles;

    public function __construct($platformRoles)
    {
        $this->platformRoles = new ArrayCollection($platformRoles);

    }

    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        parent::buildForm($builder, $options);
        
        $builder->add('firstName', 'text', array('disabled' => true))
            ->add('lastName', 'text', array('disabled' => true))
            ->add('username', 'text', array('disabled' => true))
            ->add('administrativeCode', 'text', array('required' => false, 'disabled' => true))
            ->add('plainPassword', 'repeated', array('type' => 'password'))
            ->add('mail', 'email', array('required' => false))
            ->add('phone', 'text', array('required' => false));
        $builder->add(
            'platformRoles',
            'entity',
            array(
                'mapped' => false,
                'data' => $this->platformRoles,
                'class' => 'Claroline\CoreBundle\Entity\Role',
                'expanded' => false,
                'multiple' => true,
                'property' => 'translationKey',
                'disabled' => true,
                'query_builder' => function (\Doctrine\ORM\EntityRepository $er) {
                    return $er->createQueryBuilder('r')
                            ->where("r.type != " . Role::WS_ROLE)
                            ->andWhere("r.name != 'ROLE_ANONYMOUS'");
                }
            )
        );
        
    }

    public function getName()
    {
        return 'profile_form';
    }

    public function setDefaultOptions(OptionsResolverInterface $resolver)
    {
        $resolver
        ->setDefaults(
            array(
                'translation_domain' => 'platform'
                )
        );
    }
}
