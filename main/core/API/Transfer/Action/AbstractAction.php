<?php

namespace Claroline\CoreBundle\API\Transfer\Action;

use Claroline\CoreBundle\Persistence\ObjectManager;
use Claroline\BundleRecorder\Log\LoggableTrait;

abstract class AbstractAction
{
    use LoggableTrait;

    abstract public function execute($data);

    /**
     * return an array with the following element:
     * - section
     * - action
     * - action name
     */
    abstract public function getAction();

    public function getBatchSize()
    {
        return 100;
    }

    public function clear(ObjectManager $om)
    {
        return;
    }

    public function setLogger($logger)
    {
        $this->logger = $logger;
    }

    public function export()
    {
        throw new \Exception("I don't plan to implements you anytime soon");
    }
}
