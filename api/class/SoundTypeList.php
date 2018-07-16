<?php
	require_once "FileSystemObject.php";

	class SoundTypeList extends FileSystemObject {
		protected $numberAvailable = null; // int
		protected $soundTypeFiles = []; // [\SplFileInfo]

		private function getIterator(): \FileSystemIterator { return new \FileSystemIterator(parent::getPath()); }
		public function getNumberAvailable(): int { return $this->numberAvailable ?? $this->numberAvailable = iterator_count($this->getIterator()); }

		public function getSoundTypeFiles(): array {
			if (count($this->soundTypeFiles) === 0)
				foreach ($this->getIterator() as $soundTypeFile)
					$this->soundTypeFiles[] = $soundTypeFile;
			return $this->soundTypeFiles;
		}

		public function jsonSerialize() { return ["name" => parent::getName(), "numberAvailable" => $this->getNumberAvailable()]; }
	}
?>