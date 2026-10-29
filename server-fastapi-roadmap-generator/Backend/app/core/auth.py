import base64
import hashlib
import hmac
import json
import os
from typing import Optional
from fastapi import Header, HTTPException, status


def _decode_part(value: str) -> bytes:
    return base64.urlsafe_b64decode(value + '=' * (-len(value) % 4))


async def get_current_user_id(authorization: Optional[str] = Header(default=None)) -> str:
    """Validate the HS256 JWT issued by the Node authentication service."""
    if not authorization or not authorization.startswith('Bearer '):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Authentication required')

    secret = os.getenv('JWT_SECRET')
    if not secret:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail='JWT_SECRET is not configured')

    token = authorization.removeprefix('Bearer ')
    try:
        header, payload, signature = token.split('.')
        expected_signature = hmac.new(
            secret.encode(), f'{header}.{payload}'.encode(), hashlib.sha256
        ).digest()
        if not hmac.compare_digest(_decode_part(signature), expected_signature):
            raise ValueError('Invalid signature')

        claims = json.loads(_decode_part(payload))
        if claims.get('exp', 0) < __import__('time').time() or not claims.get('id'):
            raise ValueError('Expired or invalid token')
        return claims['id']
    except (ValueError, KeyError, json.JSONDecodeError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid or expired token')
