from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)


def test_hash_and_verify_password() -> None:
    password = "super-secret-password"
    hashed = hash_password(password)
    assert hashed != password
    assert verify_password(password, hashed)
    assert not verify_password("wrong-password", hashed)


def test_password_hash_is_salted() -> None:
    h1 = hash_password("same-password")
    h2 = hash_password("same-password")
    assert h1 != h2  # bcrypt добавляет соль


def test_create_and_decode_access_token() -> None:
    token = create_access_token(user_id=42, role="admin")
    payload = decode_token(token)

    assert payload is not None
    assert payload["sub"] == "42"
    assert payload["role"] == "admin"
    assert payload["type"] == "access"


def test_create_and_decode_refresh_token() -> None:
    token = create_refresh_token(user_id=7, role="user")
    payload = decode_token(token)

    assert payload is not None
    assert payload["sub"] == "7"
    assert payload["type"] == "refresh"


def test_decode_invalid_token_returns_none() -> None:
    assert decode_token("not-a-jwt") is None
    assert decode_token("") is None