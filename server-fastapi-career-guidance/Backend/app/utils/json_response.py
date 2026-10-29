"""Safe parsing helpers for JSON returned by LLM providers."""

import json
from typing import Any


def parse_json_response(content: Any) -> Any:
    """Parse a JSON object/array, tolerating provider Markdown wrappers.

    The function intentionally does not attempt to invent missing model output.
    A malformed response remains an error so callers can use their existing
    fallback path instead of returning misleading partial recommendations.
    """
    if isinstance(content, (dict, list)):
        return content
    if not isinstance(content, str) or not content.strip():
        raise ValueError("The model returned an empty response")

    text = content.strip()
    if text.startswith("```"):
        lines = text.splitlines()
        if lines and lines[0].lstrip().startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        text = "\n".join(lines).strip()

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # Providers sometimes add a short sentence before/after an otherwise
    # complete object. Extract the first balanced JSON value rather than using
    # a greedy regular expression that breaks on braces inside strings.
    start_positions = [position for position in (text.find("{"), text.find("[")) if position >= 0]
    if not start_positions:
        raise ValueError("No JSON value found in model response")
    start = min(start_positions)
    opening = text[start]
    closing = "}" if opening == "{" else "]"
    depth = 0
    in_string = False
    escaped = False

    for index in range(start, len(text)):
        char = text[index]
        if in_string:
            if escaped:
                escaped = False
            elif char == "\\":
                escaped = True
            elif char == '"':
                in_string = False
            continue
        if char == '"':
            in_string = True
        elif char == opening:
            depth += 1
        elif char == closing:
            depth -= 1
            if depth == 0:
                return json.loads(text[start:index + 1])

    raise ValueError("The model response contains incomplete JSON")
