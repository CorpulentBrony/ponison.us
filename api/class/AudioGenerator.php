<?php
	// https://trac.ffmpeg.org/wiki/Concatenate - using the demux; generate temp file with list of fiels and then process the command
	// this is another alternative but command line could get too long ffmpeg -i "concat:breath_s1e01_001.mp3|breath_s1e01_002.mp3" -c copy test1.mp3
	// generate file
	// send response to browser
	// in js, download file from url given in response
	// in js, create link to manually download file in case automatic downloading does not work
	// set link to expire when lifetime number of seconds given in response have elapsed
	// job to check output directory and erase old files periodically
	class AudioGenerator implements \JsonSerializable {
		const FILE_BITRATE = 160000;
		const FFMPEG_CMD = "/usr/local/bin/ffmpeg -f concat -safe 0 -i %s -c copy %s";
		const OUTPUT_DIR = __DIR__ . "/../output/";
		const OUTPUT_LIFETIME_SECONDS = 600;
		const RM_CMD = __DIR__ . "/../../bin/schedule_delete.sh " . AudioGenerator::OUTPUT_LIFETIME_SECONDS . " %s > /dev/null 2>&1 &";
		const SILENT_AUDIO_FILE = __DIR__ . "/../../audio/silence.mp3";

		private $desiredLengthDeciseconds; // int
		private $generationTimeElapsedSeconds; // string
		private $length = 0; // int
		private $minDelayDeciseconds; // int
		private $maxDelayDeciseconds; // int
		private $numberSoundTypesUsed; // int
		private $outputFilePath; // string
		private $outputFormat; // int
		private $ponies = []; // array
		private $soundTypeFiles = []; // [\SplFileInfo]
		private $soundTypeFilesUsed; // \Ds\Set

		private static function calculateDurationDeciseconds($fileSizeBytes): string { return bcmul(self::calculateDurationSeconds($fileSizeBytes), "10", 6); }
		private static function calculateDurationSeconds($fileSizeBytes): string { return bcdiv(bcmul(strval($fileSizeBytes), "8", 6), strval(self::FILE_BITRATE), 6); }

		public static function getTime(): string {
			bcscale(6);
			return bcadd(...explode(" ", microtime()));
		}

		public function __construct(array $request) {
			require_once "PonyList.php";
			$this->desiredLengthDeciseconds = $request["desiredLengthSeconds"] * 10;
			$this->minDelayDeciseconds = $request["minDelayDeciseconds"];
			$this->maxDelayDeciseconds = $request["maxDelayDeciseconds"];
			$this->outputFormat = $request["outputFormat"];
			$ponyList = new PonyList($request["ponyListFileinfo"]);
			$this->ponies = array_reduce($ponyList->getPonies(), function(array $ponies, Pony $pony) use ($request): array {
				$ponyName = $pony->getName();

				if (in_array($ponyName, $request["ponies"], true)) {
					$ponies[$ponyName] = $pony;

					foreach ($pony->getSoundTypeList($request["soundTypes"]) as $soundTypeList)
						array_splice($this->soundTypeFiles, count($this->soundTypeFiles), 0, $soundTypeList->getSoundTypeFiles());
				}
				return $ponies;
			}, []);
		}

		public function generate(): self {
			require_once __DIR__ . "/../include/array.php";
			$startTime = self::getTime();
			$fileList = new \Ds\Vector();
			$fileList->allocate($this->desiredLengthDeciseconds);
			$i = 0;
			$numSoundTypeFiles = count($this->soundTypeFiles);
			$silentAudio = new \SplFileInfo(realpath(self::SILENT_AUDIO_FILE));
			$this->numberSoundTypesUsed = 0;
			$this->soundTypeFilesUsed = new \Ds\Set();
			array_shuffle($this->soundTypeFiles);

			while ($this->length < $this->desiredLengthDeciseconds) {
				if ($i >= $numSoundTypeFiles) {
					array_shuffle($this->soundTypeFiles);
					$i = 0;
				}
				$delay = $this->getDelayDeciseconds();
				$fileList = $fileList->merge(array_fill(0, $delay, $silentAudio->getPathname()));
				$soundTypeFilePath = $this->soundTypeFiles[$i]->getPathname();
				$fileList->push($soundTypeFilePath);
				$this->length += $delay + intval(explode(".", self::calculateDurationDeciseconds($this->soundTypeFiles[$i]->getSize()))[0]);
				$this->numberSoundTypesUsed++;
				$this->soundTypeFilesUsed->add(substr($soundTypeFilePath, strlen(realpath(__DIR__ . "/../../"))));
				$i++;
			}
			$tempFile = tmpfile();
			$tempFileName = stream_get_meta_data($tempFile)["uri"];
			$this->outputFilePath = realpath(self::OUTPUT_DIR) . "/" . basename($tempFileName) . ".mp3";
			fwrite($tempFile, "file '{$fileList->join("'\nfile '")}'");
			exec(sprintf(self::FFMPEG_CMD, escapeshellarg($tempFileName), escapeshellarg($this->outputFilePath)));
			exec(sprintf(self::RM_CMD, escapeshellarg($this->outputFilePath)));
			fclose($tempFile);
			$this->generationTimeElapsedSeconds = bcsub(self::getTime(), $startTime, 6);
			return $this;
		}

		private function getDelayDeciseconds(): int { return random_int($this->minDelayDeciseconds, $this->maxDelayDeciseconds); }
		private function getOutputFileDurationSeconds(): string { return self::calculateDurationSeconds($this->getOutputFileSizeBytes()); }
		private function getOutputFileSizeBytes(): int { return filesize($this->outputFilePath); }

		public function jsonSerialize() {
			return [
				"generationTimeElapsedSeconds" => $this->generationTimeElapsedSeconds, 
				"numberSoundTypesUsed" => $this->numberSoundTypesUsed,
				"outputFile" => [
					"durationSeconds" => $this->getOutputFileDurationSeconds(),
					"lifetimeSeconds" => self::OUTPUT_LIFETIME_SECONDS,
					"sizeBytes" => $this->getOutputFileSizeBytes(),
					"url" => substr($this->outputFilePath, strlen($_SERVER["DOCUMENT_ROOT"]))
				],
				"soundTypeFilesUsed" => $this->soundTypeFilesUsed,
				"totalSoundTypesSelected" => count($this->soundTypeFiles)
			];
		}
	}
?>