<?php
	function array_shuffle(array &$array) {
		$i = count($array);

		while (0 !== $i) {
			$j = random_int(0, $i-- - 1);
			list($array[$i], $array[$j]) = [$array[$j], $array[$i]];	
		}
	}
?>