from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ...database import get_db
from ...models import CafeSettings, Role, User
from ...schemas.settings import SettingsOut, SettingsUpdate
from ..deps import get_current_user, require_roles

router = APIRouter(prefix="/settings", tags=["settings"])


def _get_or_create(db: Session) -> CafeSettings:
    settings = db.get(CafeSettings, 1)
    if settings is None:
        settings = CafeSettings(id=1)
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings


@router.get("", response_model=SettingsOut)
def get_settings(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    return _get_or_create(db)


@router.patch("", response_model=SettingsOut)
def update_settings(
    body: SettingsUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(Role.ADMIN)),
):
    settings = _get_or_create(db)
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(settings, field, value)
    db.commit()
    db.refresh(settings)
    return settings
