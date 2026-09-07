from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ...database import get_db
from ...models import Role, Station, StationStatus, User
from ...schemas.station import StationCreate, StationOut, StationUpdate
from ..deps import get_current_user, require_roles

router = APIRouter(prefix="/stations", tags=["stations"])


@router.get("", response_model=list[StationOut])
def list_stations(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    return db.query(Station).order_by(Station.name).all()


@router.post("", response_model=StationOut, status_code=status.HTTP_201_CREATED)
def create_station(
    body: StationCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(Role.ADMIN, Role.TECHNICIAN)),
):
    if db.query(Station).filter(Station.name == body.name).first():
        raise HTTPException(status_code=400, detail="Station name already exists")
    station = Station(**body.model_dump())
    db.add(station)
    db.commit()
    db.refresh(station)
    return station


@router.patch("/{station_id}", response_model=StationOut)
def update_station(
    station_id: int,
    body: StationUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(Role.ADMIN, Role.TECHNICIAN)),
):
    station = db.get(Station, station_id)
    if station is None:
        raise HTTPException(status_code=404, detail="Station not found")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(station, field, value)
    db.commit()
    db.refresh(station)
    return station


@router.delete("/{station_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_station(
    station_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(Role.ADMIN)),
):
    station = db.get(Station, station_id)
    if station is None:
        raise HTTPException(status_code=404, detail="Station not found")
    if station.status == StationStatus.IN_USE:
        raise HTTPException(status_code=400, detail="Cannot delete an in-use station")
    db.delete(station)
    db.commit()
