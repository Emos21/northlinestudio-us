<?php
// Render one PHP page of the original site to HTML on stdout.
// usage: php tools/render.php <source-dir> <page.php>
$src  = rtrim($argv[1], '/');
$page = $argv[2];
$_SERVER['SCRIPT_NAME']    = '/' . $page;
$_SERVER['REQUEST_METHOD'] = 'GET';
$_SERVER['SERVER_NAME']    = 'northlinestudio.us';
chdir($src);
ob_start();
include $src . '/' . $page;
echo ob_get_clean();
