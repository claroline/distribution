<?php

/*
 * This file is part of the Claroline Connect package.
 *
 * (c) Claroline Consortium <consortium@claroline.net>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace Claroline\CursusBundle\DataFixtures\PostInstall;

use Claroline\CoreBundle\Entity\Template\Template;
use Claroline\CoreBundle\Entity\Template\TemplateType;
use Claroline\CoreBundle\Library\Configuration\PlatformConfigurationHandler;
use Doctrine\Common\DataFixtures\AbstractFixture;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

class LoadTemplateData extends AbstractFixture implements ContainerAwareInterface
{
    private $container;
    private $om;
    private $translator;
    private $templateTypeRepo;
    private $templateRepo;
    private $availableLocales;

    public function setContainer(ContainerInterface $container = null)
    {
        $this->container = $container;
    }

    public function load(ObjectManager $om)
    {
        $this->om = $om;
        $this->templateTypeRepo = $om->getRepository(TemplateType::class);
        $this->templateRepo = $om->getRepository(Template::class);
        $this->translator = $this->container->get('translator');
        $this->availableLocales = $this->container->get(PlatformConfigurationHandler::class)->getParameter('locales.available');

        $this->createCourseTemplates();

        $sessionInvitationType = $this->templateTypeRepo->findOneBy(['name' => 'session_invitation']);
        $templates = $this->templateRepo->findBy(['name' => 'session_invitation']);
        if ($sessionInvitationType && empty($templates)) {
            foreach ($this->availableLocales as $locale) {
                $template = new Template();
                $template->setType($sessionInvitationType);
                $template->setName('session_invitation');
                $template->setLang($locale);
                $template->setTitle($this->translator->trans('session_invitation', [], 'template', $locale));
                $content = '%session_name%<br/>';
                $content .= '[%session_start% -> %session_end%]<br/>';
                $content .= '%session_description%';
                $template->setContent($content);
                $om->persist($template);
            }
            $sessionInvitationType->setDefaultTemplate('session_invitation');
            $om->persist($sessionInvitationType);
        }

        $eventInvitationType = $this->templateTypeRepo->findOneBy(['name' => 'session_event_invitation']);
        $templates = $this->templateRepo->findBy(['name' => 'session_event_invitation']);
        if ($eventInvitationType && empty($templates)) {
            foreach ($this->availableLocales as $locale) {
                $template = new Template();
                $template->setType($eventInvitationType);
                $template->setName('session_event_invitation');
                $template->setLang($locale);
                $template->setTitle($this->translator->trans('session_event_invitation', [], 'template', $locale));
                $content = '%event_name%<br/>';
                $content .= '[%event_start% -> %event_end%]<br/>';
                $content .= '%event_description%<br/><br/>';
                $content .= '%event_location_address%<br/>';
                $content .= '%event_location_extra%';
                $template->setContent($content);
                $om->persist($template);
            }
            $eventInvitationType->setDefaultTemplate('session_event_invitation');
            $om->persist($eventInvitationType);
        }

        $om->flush();
    }

    private function createCourseTemplates()
    {
        /** @var TemplateType $templateType */
        $templateType = $this->templateTypeRepo->findOneBy(['name' => 'training_course']);
        $templates = $this->templateRepo->findBy(['name' => 'training_course']);

        if ($templateType && empty($templates)) {
            foreach ($this->availableLocales as $locale) {
                $template = new Template();
                $template->setType($templateType);
                $template->setName('training_course');
                $template->setLang($locale);
                $template->setTitle($this->translator->trans('training_course', [], 'template', $locale));

                $content = "
                    <img src='%poster_url%' style='max-width: 100%' alt='training poster'/>
                    <h1>%name% <small>%code%</small></h1>
                    
                    <h2>{$this->translator->trans('description', [], 'platform')}</h2>
                    <p>%description%</p>
                    <h2>{$this->translator->trans('information', [], 'platform')}</h2>
                    <ul>
                        <li><b>{$this->translator->trans('public_registration', [], 'platform')} : </b> %public_registration%</li>
                        <li><b>{$this->translator->trans('duration', [], 'platform')} : </b> %default_duration%</li>
                        <li><b>{$this->translator->trans('max_participants', [], 'cursus')} : </b> %max_users%</li>
                    </ul>
                ";
                $template->setContent($content);

                $this->om->persist($template);
            }

            $templateType->setDefaultTemplate('training_course');
            $this->om->persist($templateType);
        }
    }
}
