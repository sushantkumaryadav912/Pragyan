from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.db import get_db
from app.core.security import verify_password, create_access_token
from app.core.dependencies import get_current_user
from app.schemas import UserCreate, UserOut, LoginRequest, Token
from app.repositories.users import get_user_by_username, get_user_by_email, create_user
from app.repositories.audit import log_audit_event
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication & RBAC"])

@router.post("/register", response_model=UserOut)
async def register_user(body: UserCreate, db: AsyncSession = Depends(get_db)):
    """Register a new user account."""
    existing_username = await get_user_by_username(db, body.username)
    if existing_username:
        raise HTTPException(status_code=400, detail="Username already registered")

    existing_email = await get_user_by_email(db, body.email)
    if existing_email:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = await create_user(
        db, username=body.username, email=body.email, password=body.password, role=body.role
    )
    await log_audit_event(
        db, username=user.username, action="USER_REGISTER", target=user.email, user_id=user.id
    )
    return user

@router.post("/login", response_model=Token)
async def login(body: LoginRequest, db: AsyncSession = Depends(get_db)):
    """Authenticate user and issue JWT access token."""
    user = await get_user_by_username(db, body.username)
    if not user or not verify_password(body.password, user.hashed_password):
        if user:
            await log_audit_event(
                db, username=body.username, action="LOGIN_FAILED", status="FAILED"
            )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )

    access_token = create_access_token(data={"sub": user.username, "role": user.role})
    await log_audit_event(
        db, username=user.username, action="LOGIN_SUCCESS", user_id=user.id
    )
    return Token(access_token=access_token, token_type="bearer", user=UserOut.model_validate(user))

@router.get("/me", response_model=UserOut)
async def get_me(current_user: User = Depends(get_current_user)):
    """Get authenticated user profile."""
    return current_user
