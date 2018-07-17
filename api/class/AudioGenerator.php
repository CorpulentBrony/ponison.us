<?php
	class AudioGenerator implements \JsonSerializable {
		const FILE_BITRATE = 160000;
		const FFMPEG_CMD = "/usr/local/bin/ffmpeg -f concat -safe 0 -i %s -c copy %s";
		const OUTPUT_DIR = __DIR__ . "/../output/";
		const OUTPUT_LIFETIME_SECONDS = 600;
		const RM_CMD = __DIR__ . "/../../bin/schedule_delete.sh " . AudioGenerator::OUTPUT_LIFETIME_SECONDS . " %s > /dev/null 2>&1 &";
		const SILENT_AUDIO_FILE = __DIR__ . "/../../audio/silence.mp3";

		private $desiredLengthDeciseconds; // int
		private $generationTimeElapsedSeconds; // string
		private $length = "0"; // string
		private $minDelayDeciseconds; // int
		private $maxDelayDeciseconds; // int
		private $numberSoundTypesUsed; // int
		private $outputFilePath; // string
		private $outputFormat; // int
		private $ponies = []; // array
		private $soundTypeFiles = []; // [\SplFileInfo]
		private $soundTypeFilesUsed; // \Ds\Set
		private $timingLog; // [[]]

		private static function calculateDurationDeciseconds($fileSizeBytes): string { return bcmul(self::calculateDurationSeconds($fileSizeBytes), "10", 6); }
		private static function calculateDurationSeconds($fileSizeBytes): string { return bcdiv(bcmul(strval($fileSizeBytes), "8", 6), strval(self::FILE_BITRATE), 6); }

		// this should be re-written for bcmath since that is where this is coming from
		public static function formatSeconds($seconds) {
			$hours = $seconds / 3600 >> 0;
			$minutes = $seconds % 3600 / 60 >> 0;
			$seconds %= 60;
			return (($hours > 0) ? sprintf("%02d:", $hours) : "") . sprintf("%02d:%06.3f", $minutes, $seconds);
		}

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
			require_once __DIR__ . "/../include/bcmath.php";
			bcscale(6);
			$startTime = self::getTime();
			$fileList = new \Ds\Vector();
			$fileList->allocate($this->desiredLengthDeciseconds);
			$desiredLengthDeciseconds = strval($this->desiredLengthDeciseconds);
			$i = 0;
			$numSoundTypeFiles = count($this->soundTypeFiles);
			$silentAudio = new \SplFileInfo(realpath(self::SILENT_AUDIO_FILE));
			$this->numberSoundTypesUsed = 0;
			$this->soundTypeFilesUsed = new \Ds\Set();
			$this->timingLog = [];
			array_shuffle($this->soundTypeFiles);

			while (bccomp($this->length, $desiredLengthDeciseconds) < 0) {
				if ($i >= $numSoundTypeFiles) {
					array_shuffle($this->soundTypeFiles);
					$i = 0;
				}
				$delay = random_int($this->minDelayDeciseconds, max(min($this->maxDelayDeciseconds, intval(bcsub($desiredLengthDeciseconds, $this->length, 0))), $this->minDelayDeciseconds));
				$fileList = $fileList->merge(array_fill(0, $delay, $silentAudio->getPathname()));
				$this->length = bcadd($this->length, strval($delay), 6);
				$lengthDeciseconds = self::calculateDurationDeciseconds($this->soundTypeFiles[$i]->getSize());
				$soundTypeFilePath = $this->soundTypeFiles[$i]->getPathname();
				$soundTypeFileUrl = substr($soundTypeFilePath, strlen(realpath(__DIR__ . "/../../")));
				$fileList[] = $soundTypeFilePath;
				$this->timingLog[] = ["begin" => $this->length, "end" => $this->length = bcadd($this->length, $lengthDeciseconds, 6), "file" => $soundTypeFileUrl, "name" => basename($this->soundTypeFiles[$i]->getPath())];
				$this->numberSoundTypesUsed++;
				$this->soundTypeFilesUsed->add($soundTypeFileUrl);
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

		private function getOutputFileDurationSeconds(): string { return self::calculateDurationSeconds($this->getOutputFileSizeBytes()); }
		private function getOutputFileSizeBytes(): int { return filesize($this->outputFilePath); }
		// https://developer.mozilla.org/en-US/docs/Web/API/WebVTT_API
		// base64 encode?  or we can do that on JS side and just return the text here, maybe use array.  this is why i am doing timingLog
		private function getWebVtt(): string {
			return array_reduce($this->timingLog, function(string $webVtt, array $entry): string {
				$webVtt .= \PHP_EOL . \PHP_EOL . $entry["file"] . \PHP_EOL;
				$webVtt .= self::formatSeconds(bcdiv($entry["begin"], "10")) . " --> " . self::formatSeconds(bcdiv($entry["end"], "10")) . \PHP_EOL;
				return "{$webVtt}- {$entry["name"]}";
			}, "WEBVTT ");
		}

		public function jsonSerialize() {
			return [
				"generationTimeElapsedSeconds" => bcadd($this->generationTimeElapsedSeconds, "0", 3), 
				"numberSoundTypesUsed" => $this->numberSoundTypesUsed,
				"outputFile" => [
					"durationSeconds" => bcdiv($this->length, "10", 3), //bcadd($this->getOutputFileDurationSeconds(), "0", 3),
					"lifetimeSeconds" => self::OUTPUT_LIFETIME_SECONDS,
					"sizeBytes" => $this->getOutputFileSizeBytes(),
					"url" => substr($this->outputFilePath, strlen($_SERVER["DOCUMENT_ROOT"]))
				],
				"soundTypeFilesUsed" => $this->soundTypeFilesUsed,
				"timingLog" => $this->getWebVtt(),
				"totalSoundTypesSelected" => count($this->soundTypeFiles)
			];
		}
	}
?>