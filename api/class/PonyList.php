<?php
	require_once "FileSystemObject.php";
	require_once "Pony.php";

	class PonyList extends FileSystemObject {
		protected $ponies = []; // [Pony]

		public function getPonies(array $ponies = null): array {
			if (count($this->ponies) === 0)
				foreach (new \FileSystemIterator(parent::getPath()) as $pony)
					$this->ponies[] = new Pony($pony);
			return $this->ponies;
		}

		public function jsonSerialize() { return $this->getPonies(); }
	}
?>