<?php

/*******************************************************************************
 * This script is a config file for PHP-CS-Fixer designed for travis builds.
 * It reads a list of targets (supposably files changed by the push/PR) from
 * a file located in the root directory and passed them to the CS config (with
 * default fixer level: Symfony).
 ******************************************************************************/

$pkgDir = realpath(__DIR__.'/../../../..');
$targetFile = "{$pkgDir}/git_diff_files.txt";

if (!file_exists($targetFile)) {
    die("Cannot find file listing CS targets (looked for {$targetFile})\n");
    exit(1);
}

$targets = array_filter(file($targetFile), function ($line) {
    return !empty($line);
});

$files = array_map(function ($filePath) use ($pkgDir) {
    return "{$pkgDir}/".trim($filePath);
}, $targets);

$finder = Symfony\CS\Finder\DefaultFinder::create()->append($files);

return Symfony\CS\Config\Config::create()->finder($finder);
