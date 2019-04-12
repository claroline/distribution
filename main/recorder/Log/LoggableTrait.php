<?php

namespace Claroline\BundleRecorder\Log;

use Psr\Log\LoggerInterface;
use Psr\Log\LogLevel;

trait LoggableTrait
{
    protected $logger;

    public function log($message, $logLevel = null)
    {
        if ($this->logger) {
            $time = date('m-d-y h:i:s').': ';
            if (!$logLevel) {
                $logLevel = LogLevel::INFO;
            }
            $this->logger->log($logLevel, $time.$message);
        }
    }

    /**
     * Sets a logger.
     *
     * @param LoggerInterface $logger
     */
    public function setLogger(LoggerInterface $logger = null)
    {
        $this->logger = $logger;
    }
}
