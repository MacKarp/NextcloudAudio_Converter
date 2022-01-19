<?php
namespace OCA\Audio_Converter\Controller;

use OCP\IRequest;
use OCP\AppFramework\Http\TemplateResponse;
use OCP\AppFramework\Http\DataResponse;
use OCP\AppFramework\Controller;
use \OCP\IConfig;
use OCP\EventDispatcher\IEventDispatcher;
use OC\Files\Filesystem;


class ConversionController extends Controller {

	private $userId;

	/**
	* @NoAdminRequired
	*/
	public function __construct($AppName, IRequest $request, $UserId){
		parent::__construct($AppName, $request);
		$this->userId = $UserId;

	}

	public function getFile($directory, $fileName){
		\OC_Util::tearDownFS();
		\OC_Util::setupFS($this->userId);
		return Filesystem::getLocalFile($directory . '/' . $fileName);
	}
	/**
	* @NoAdminRequired
	*/
	public function convertHere($nameOfFile, $directory, $external, $type, $preset, $priority, $movflags = false, $codec = null, $vbitrate = null, $scale = null, $shareOwner = null, $mtime = 0) {
		$file = $this->getFile($directory, $nameOfFile);
		$dir = dirname($file);
		$response = array();
		if (file_exists($file)){
			$cmd = $this->createCmd($file, $preset, $type, $priority, $movflags, $codec, $vbitrate, $scale);
			exec($cmd, $output,$return);
			// if the file is in external storage, and also check if encryption is enabled
			if($external || \OC::$server->getEncryptionManager()->isEnabled()){
				//put the temporary file in the external storage
				Filesystem::file_put_contents($directory . '/' . pathinfo($nameOfFile)['filename'].".".$type, file_get_contents(dirname($file) . '/' . pathinfo($file)['filename'].".".$type));
				// check that the temporary file is not the same as the new file
				if(Filesystem::getLocalFile($directory . '/' . pathinfo($nameOfFile)['filename'].".".$type) != dirname($file) . '/' . pathinfo($file)['filename'].".".$type){
					unlink(dirname($file) . '/' . pathinfo($file)['filename'].".".$type);
				}
			}else{
				//create the new file in the NC filesystem
				Filesystem::touch($directory . '/' . pathinfo($file)['filename'].".".$type);
			}
			//if ffmpeg is throwing an error
			if($return == 127){
				$response = array_merge($response, array("code" => 0, "desc" => "ffmpeg is not installed or available \n
				DEBUG(".$return."): " . $file . ' - '.$output));
				return json_encode($response);
			}else{
				$response = array_merge($response, array("code" => 1));
				return json_encode($response);
			}
		}else{
			$response = array_merge($response, array("code" => 0, "desc" => "Can't find file at ". $file));
			return json_encode($response);
		}
	}
	/**
	* @NoAdminRequired
	*/
	public function createCmd($file, $preset, $output, $priority, $movflags, $codec, $abitrate, $scale){
		$middleArgs = "";
		if ($output == "webm"){
			switch ($preset) {
				case 'faster':
					$middleArgs = "-vcodec libvpx -cpu-used 1 -threads 16";
					break;
				case 'veryfast':
					$middleArgs = "-vcodec libvpx -cpu-used 2 -threads 16";
					break;
				case 'superfast':
					$middleArgs = "-vcodec libvpx -cpu-used 4 -threads 16";
					break;
				case 'ultrafast':
					$middleArgs = "-vcodec libvpx -cpu-used 5 -threads 16 -deadline realtime";
					break;
				default:
					break;
			}
		} else {
			if ($codec != null){
				switch ($codec) {
					case 'mp3':
						$middleArgs = "-acodec libmp3lame -preset ".escapeshellarg($preset). " -strict -2";
						break;
					case 'x265':
						$middleArgs = "-vcodec libx265 -preset ".escapeshellarg($preset). " -strict -2";
						break;
				}
			} else {
				$middleArgs = "-preset ".escapeshellarg($preset). " -strict -2";
			}

			if ($movflags) {
				$middleArgs = $middleArgs." -movflags +faststart ";
			}

			if ($abitrate != null) {
				switch ($abitrate) {
					case '1':
						$abitrate = '96k';
						break;
					case '2':
						$abitrate = '128k';
						break;
					case '3':
						$abitrate = '160k';
						break;
					case '4':
						$abitrate = '192k';
						break;
					case '5':
						$abitrate = '224k';
						break;
					case '6':
						$abitrate = '256k';
						break;
					case '7':
						$abitrate = '320k';
						break;
					default :
						$abitrate = '320k';
						break;
				}
				$middleArgs = $middleArgs." -b:a ".$abitrate;
			}
		}
		//echo $link;
		$cmd = " ffmpeg -y -i ".escapeshellarg($file)." ".$middleArgs." ".escapeshellarg(dirname($file) . '/' . pathinfo($file)['filename'].".".$output);
		if ($priority != "0"){
			$cmd = "nice -n ".escapeshellarg($priority).$cmd;
		}
		return $cmd;
	}
}
