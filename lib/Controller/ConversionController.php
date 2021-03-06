<?php

namespace OCA\Audio_Converter\Controller;

use OCP\IRequest;
use OCP\AppFramework\Http\TemplateResponse;
use OCP\AppFramework\Http\DataResponse;
use OCP\AppFramework\Controller;
use \OCP\IConfig;
use OCP\EventDispatcher\IEventDispatcher;
use OC\Files\Filesystem;


class ConversionController extends Controller
{

	private $userId;

	/**
	 * @NoAdminRequired
	 */
	public function __construct($AppName, IRequest $request, $UserId)
	{
		parent::__construct($AppName, $request);
		$this->userId = $UserId;
	}

	public function getFile($directory, $fileName)
	{
		\OC_Util::tearDownFS();
		\OC_Util::setupFS($this->userId);
		return Filesystem::getLocalFile($directory . '/' . $fileName);
	}
	/**
	 * @NoAdminRequired
	 */
	public function convertHere($nameOfFile, $directory, $external, $type, $shareOwner = null, $mtime = 0)
	{
		$file = $this->getFile($directory, $nameOfFile);
		$dir = dirname($file);
		$response = array();
		if (file_exists($file)) {
			$cmd = $this->createCmd($file, $type);
			exec($cmd, $output, $return);
			// if the file is in external storage, and also check if encryption is enabled
			if ($external || \OC::$server->getEncryptionManager()->isEnabled()) {
				//put the temporary file in the external storage
				Filesystem::file_put_contents($directory . '/' . pathinfo($nameOfFile)['filename'] . "." . $type, file_get_contents(dirname($file) . '/' . pathinfo($file)['filename'] . "." . $type));
				// check that the temporary file is not the same as the new file
				if (Filesystem::getLocalFile($directory . '/' . pathinfo($nameOfFile)['filename'] . "." . $type) != dirname($file) . '/' . pathinfo($file)['filename'] . "." . $type) {
					unlink(dirname($file) . '/' . pathinfo($file)['filename'] . "." . $type);
				}
			} else {
				//create the new file in the NC filesystem
				Filesystem::touch($directory . '/' . pathinfo($file)['filename'] . "." . $type);
			}
			//if ffmpeg is throwing an error
			if ($return) {
				return json_encode($response);
			}
			if ($return == 127) {
				$response = array_merge($response, array("code" => 0, "desc" => "ffmpeg is not installed or available \n
				DEBUG(" . $return . "): " . $file . ' - ' . $output));
				return json_encode($response);
			} else {
				$response = array_merge($response, array("code" => 1));
				return json_encode($response);
			}
		} else {
			$response = array_merge($response, array("code" => 0, "desc" => "Can't find file at " . $file));
			return json_encode($response);
		}
	}
	/**
	 * @NoAdminRequired
	 */
	public function createCmd($file, $output)
	{
		//echo $link;
		$cmd = " ffmpeg -y -i " . escapeshellarg($file) . " " . escapeshellarg(dirname($file) . '/' . pathinfo($file)['filename'] . "." . $output);
		return $cmd;
	}
}
