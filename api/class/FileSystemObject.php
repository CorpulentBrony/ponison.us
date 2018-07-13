<?php
	abstract class FileSystemObject implements \JsonSerializable {
		protected $fileinfo = null; // \SplFileInfo

		public function __construct(\SplFileInfo $fileinfo) { $this->fileinfo = $fileinfo; }

		public function getName(): string { return urldecode($this->fileinfo->getFilename()); }
		public function getPath(): string { return $this->fileinfo->getPathname(); }
		public function jsonSerialize() { return $this->getName(); }
	}
?>