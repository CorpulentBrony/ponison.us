<?php
	require_once "FileSystemObject.php";
	require_once "SoundType.php";

	class Pony extends FileSystemObject {
		protected $soundTypes = []; // [SoundType]

		public function getSoundTypes(): array {
			if (count($this->soundTypes) === 0)
				foreach (new \FileSystemIterator(parent::getPath()) as $soundType)
					$this->soundTypes[] = new SoundType($soundType);
			return $this->soundTypes;
		}

		public function jsonSerialize() { return ["name" => parent::getName(), "soundTypes" => $this->getSoundTypes()]; }
	}
?>