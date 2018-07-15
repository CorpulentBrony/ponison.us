<?php
	require_once "FileSystemObject.php";

	class Pony extends FileSystemObject {
		protected $soundTypeList = []; // [SoundTypeList]

		public function getSoundTypeList(array $soundTypeListFilter = []): array {
			if (count($this->soundTypeList) === 0) {
				require_once "SoundTypeList.php";

				foreach (new \FileSystemIterator(parent::getPath()) as $soundTypeList)
					$this->soundTypeList[] = new SoundTypeList($soundTypeList);
			}

			if (count($soundTypeListFilter) > 0)
				return array_filter($this->soundTypeList, function(SoundTypeList $soundTypeList) use ($soundTypeListFilter): bool { return in_array($soundTypeList->getName(), $soundTypeListFilter, true); });
			return $this->soundTypeList;
		}

		public function jsonSerialize() { return ["name" => parent::getName(), "soundTypes" => $this->getSoundTypeList()]; }
	}
?>