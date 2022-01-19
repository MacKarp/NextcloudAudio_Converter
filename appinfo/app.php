<?php
/**
 * Load Javascript
 */
use OCP\Util;
$eventDispatcher = \OC::$server->getEventDispatcher();
$eventDispatcher->addListener('OCA\Files::loadAdditionalScripts', function(){
    Util::addScript('audio_converter', 'conversion' );
    Util::addStyle('audio_converter', 'style' );
});
