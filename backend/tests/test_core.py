import pytest

from app.core import (
    CodeValidationError,
    SnippetStore,
    build_messages,
    normalise_mode,
    parse_model_json,
    validate_code,
)


def test_validate_code_rejects_short_and_empty():
    with pytest.raises(CodeValidationError):
        validate_code("")
    with pytest.raises(CodeValidationError):
        validate_code("   \n  ")
    with pytest.raises(CodeValidationError):
        validate_code("ab")


def test_validate_code_rejects_non_string():
    with pytest.raises(CodeValidationError):
        validate_code(None)  # type: ignore[arg-type]


def test_validate_code_enforces_the_upper_bound():
    assert validate_code("x" * 50_000) == "x" * 50_000
    with pytest.raises(CodeValidationError):
        validate_code("x" * 50_001)


def test_validate_code_accepts_normal_input():
    assert validate_code("print('hi')") == "print('hi')"


def test_normalise_mode_falls_back_to_review():
    assert normalise_mode("explain") == "explain"
    assert normalise_mode("  CONVERT ") == "convert"
    assert normalise_mode("nonsense") == "review"
    assert normalise_mode(None) == "review"


def test_build_messages_has_system_and_user_turns():
    messages = build_messages("review", "python", "print(1)")
    assert [m["role"] for m in messages] == ["system", "user"]
    assert "print(1)" in messages[1]["content"]
    assert "Language: python" in messages[1]["content"]
    assert "ONLY valid JSON" in messages[0]["content"]


def test_build_messages_uses_the_requested_mode_prompt():
    assert "converted_code" in build_messages("convert", "go", "x")[0]["content"]
    assert "quality" not in build_messages("convert", "go", "x")[0]["content"].lower()


def test_parse_model_json_plain_object():
    assert parse_model_json('{"score": 90}') == {"score": 90}


def test_parse_model_json_strips_markdown_fences():
    fenced = '```json\n{"score": 88, "summary": "ok"}\n```'
    assert parse_model_json(fenced) == {"score": 88, "summary": "ok"}


def test_parse_model_json_recovers_from_leading_prose():
    noisy = 'Here is the review:\n{"score": 70}\nHope that helps!'
    assert parse_model_json(noisy) == {"score": 70}


def test_parse_model_json_rejects_empty_and_non_json():
    for bad in ["", "   ", "not json at all"]:
        with pytest.raises(ValueError):
            parse_model_json(bad)


def test_parse_model_json_rejects_json_arrays():
    with pytest.raises(ValueError):
        parse_model_json("[1, 2, 3]")


def test_snippet_store_roundtrip():
    store = SnippetStore()
    store.add({"code": "x", "language": "python", "title": "t"}, snippet_id="abc")
    assert store.get("abc") == {"code": "x", "language": "python", "title": "t"}
    assert store.get("missing") is None
    assert len(store) == 1


def test_snippet_store_expires_entries():
    store = SnippetStore(ttl_seconds=0)
    store.add({"code": "x"}, snippet_id="old")
    assert store.get("old") is None
    assert len(store) == 0


def test_snippet_store_evicts_oldest_past_capacity():
    store = SnippetStore(max_items=2)
    store.add({"code": "1"}, snippet_id="a")
    store.add({"code": "2"}, snippet_id="b")
    store.add({"code": "3"}, snippet_id="c")
    assert len(store) <= 2
    assert store.get("c") is not None
