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
?>