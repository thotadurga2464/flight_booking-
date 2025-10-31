from pydantic import BaseModel
from datetime import datetime

class FlightSchema(BaseModel):
    Flight_no: str
    origin: str
    destination: str
    departure: datetime
    arrival: datetime
    base_fare: float
    total_seats: int
    seats_available: int
    airline_name: str

    class Config:
        from_attributes = True  # replaces orm_mode in Pydantic v2


class BookingCreate(BaseModel):
    trans_id: str
    flight_no: str
    origin: str
    destination: str
    passenger_fullname: str
    passenger_contact: str
    seat_no: int
