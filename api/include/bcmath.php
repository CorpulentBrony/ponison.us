<?php
	function bcmax(string ...$values): string {
		if (count($values) === 0)
			throw new \BadFunctionCallException("bcmax requires at least one value");
		$result = $values[0];

		for ($i = 1; $i < count($values); $i++)
			if (bccomp($result, $values[$i]) < 0)
				$result = $values[$i];
		return $result;
	}

	function bcmin(string ...$values): string {
		if (count($values) === 0)
			throw new \BadFunctionCallException("bcmin requires at least one value");
		$result = $values[0];

		for ($i = 1; $i < count($values); $i++)
			if (bccomp($result, $values[$i]) > 0)
				$result = $values[$i];
		return $result;
	}

	// function bcround(string $value, int $precision = 0, int $mode = \PHP_ROUND_HALF_UP): string {
	// 	if ($mode !== \PHP_ROUND_HALF_UP)
	// 		throw new \InvalidArgumentException("bcround only supports PHP_ROUND_HALF_UP");
	// 	else if (strpos($value, ".") === false)
	// 		return $value;
	// 	$precision = max(0, $precision);
	// 	$valueSplit = explode(".", $value);

	// 	if ($precision >= strlen($valueSplit[1]))
	// 		return $value;
	// 	else if (intval($valueSplit[1][$precision]) >= 5)
	// 		if ($precision === 0)
	// }
?>