from fastapi import FastAPI, HTTPException, Depends, status
from sqlalchemy import create_engine, Column, Integer, String, DateTime, DECIMAL, ForeignKey, func
from sqlalchemy.orm import sessionmaker, declarative_base, Session
from pydantic import BaseModel, Field
from datetime import datetime, timedelta
import random, threading, time, decimal, uuid, string
from typing import List, Optional

MYSQL_USER = "root"
MYSQL_PASSWORD = "2464"
MYSQL_HOST = "localhost"
MYSQL_DB = "FlightS_booking"

DATABASE_URL = f"mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}/{MYSQL_DB}"
engine = create_engine(DATABASE_URL, echo=False, future=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()


class Flight(Base):
    __tablename__ = "Flight"
    Flight_id = Column(Integer, primary_key=True, autoincrement=True)
    Flight_no = Column(String(10), unique=True, nullable=False)
    origin = Column(String(50))
    destination = Column(String(50))
    departure = Column(DateTime)
    arrival = Column(DateTime)
    base_fare = Column(DECIMAL(10, 2), default=5000.00)
    total_seats = Column(Integer)
    seats_available = Column(Integer)
    airline_name = Column(String(50))

class Booking(Base):
    __tablename__ = "bookings"
    booking_id = Column(Integer, primary_key=True, autoincrement=True)
    trans_id = Column(String(50), nullable=True)
    flight_no = Column(String(10), ForeignKey("Flight.Flight_no"), nullable=True)
    # new fields for milestone:
    flight_id = Column(Integer, ForeignKey("Flight.Flight_id"), nullable=True)
    passenger_fullname = Column(String(100), nullable=False)
    passenger_contact = Column(String(20), nullable=True)
    seat_no = Column(Integer)
    pnr = Column(String(16), unique=True, nullable=True)
    status = Column(String(30), default="Pending")  # Pending, Reserved, Confirmed, Cancelled, Payment Failed
    price = Column(DECIMAL(12,2), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class FareHistory(Base):
    __tablename__ = "fare_history"
    id = Column(Integer, primary_key=True, autoincrement=True)
    flight_no = Column(String(10))
    timestamp = Column(DateTime, default=datetime.utcnow)
    fare = Column(DECIMAL(20,2))

Base.metadata.create_all(engine)


class FlightCreateSchema(BaseModel):
    Flight_no: str = Field(..., max_length=10)
    origin: str
    destination: str
    departure: datetime
    arrival: datetime
    base_fare: float
    total_seats: int = Field(..., gt=0)
    seats_available: int = Field(..., ge=0)
    airline_name: str

class FlightOutSchema(FlightCreateSchema):
    dynamic_price: float
    class Config:
        from_attributes = True

class BookingCreate(BaseModel):
    flight_id: int
    seat_no: int = Field(..., ge=1)
    passenger_fullname: str
    passenger_contact: Optional[str] = None
    trans_id: Optional[str] = None

class BookingReserveOut(BaseModel):
    pnr: str
    flight_id: int
    flight_no: str
    seat_no: int
    status: str
    message: str

class BookingOutSchema(BaseModel):
    trans_id: Optional[str]
    flight_no: str
    passenger_fullname: str
    passenger_contact: Optional[str]
    seat_no: int
    origin: Optional[str]
    destination: Optional[str]
    pnr: Optional[str]
    status: Optional[str]
    price: Optional[float]
    class Config:
        orm_mode = True

class FlightSearchSchema(BaseModel):
    origin: Optional[str] = None
    destination: Optional[str] = None
    date: Optional[datetime] = None
    sort_by: Optional[str] = None

class FlightNoSchema(BaseModel):
    flight_no: str
    limit: Optional[int] = 10

class FareHistoryPostSchema(BaseModel):
    flight_no: str
    limit: Optional[int] = 10

class FareHistoryOutSchema(BaseModel):
    timestamp: datetime
    fare: float


def generate_pnr(length: int = 6) -> str:
    chars = string.ascii_uppercase + string.digits
    return ''.join(random.choice(chars) for _ in range(length))

def generate_trans_id() -> str:
    return str(uuid.uuid4()).replace('-', '')[:20]


def calculate_dynamic_price(base_fare, seats_available, total_seats, departure, airline_name="standard"):
    base = float(base_fare) if not isinstance(base_fare, float) else base_fare
    seat_ratio = seats_available / total_seats if total_seats else 0
    seat_factor = 0.4 * (1 - seat_ratio)
    days = (departure - datetime.now()).total_seconds() / 86400 if departure else 0
    if days <= 0: time_factor = 0.6
    elif days <= 1: time_factor = 0.4
    elif days <= 3: time_factor = 0.2
    elif days <= 7: time_factor = 0.1
    else: time_factor = -0.05
    demand_factor = random.uniform(-0.08, 0.25)
    tier_factor = 0.12 if "premium" in airline_name.lower() or "air india" in airline_name.lower() else -0.03
    total_multiplier = 1 + seat_factor + time_factor + demand_factor + tier_factor
    return max(round(base * total_multiplier, 2), 50.0)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


app = FastAPI(title="Flight Booking API", version="1.4-milestone3")


def simulate_market_loop(interval_seconds: int = 60):
    while True:
        db = SessionLocal()
        try:
            for f in db.query(Flight).all():
                change = random.choice([-3,-2,-1,0,1,2])
                f.seats_available = max(0, min(f.total_seats, (f.seats_available or 0) + change))
                dp = calculate_dynamic_price(f.base_fare, f.seats_available or 0, f.total_seats or 1, f.departure, f.airline_name or "")
                db.add(FareHistory(flight_no=f.Flight_no, fare=decimal.Decimal(str(dp)), timestamp=datetime.utcnow()))
            db.commit()
        except Exception as e:
            db.rollback()
            print("[Simulator] error:", e)
        finally:
            db.close()
        time.sleep(interval_seconds)

threading.Thread(target=simulate_market_loop, args=(30,), daemon=True).start()


def insert_sample_flights():
    db = SessionLocal()
    try:
        if db.query(Flight).first(): return
        flights = [
            Flight(Flight_no="AI101", origin="Delhi", destination="Mumbai",
                   departure=datetime.utcnow()+timedelta(days=2),
                   arrival=datetime.utcnow()+timedelta(days=2,hours=2),
                   base_fare=5000.0, total_seats=100, seats_available=100, airline_name="Air India"),
            Flight(Flight_no="AI102", origin="Bangalore", destination="Chennai",
                   departure=datetime.utcnow()+timedelta(days=3),
                   arrival=datetime.utcnow()+timedelta(days=3,hours=1,minutes=30),
                   base_fare=4500.0, total_seats=120, seats_available=120, airline_name="Air India Premium"),
            Flight(Flight_no="AI103", origin="Mumbai", destination="Kolkata",
                   departure=datetime.utcnow()+timedelta(days=4),
                   arrival=datetime.utcnow()+timedelta(days=4,hours=3),
                   base_fare=6000.0, total_seats=150, seats_available=150, airline_name="Air India")
        ]
        db.add_all(flights)
        db.commit()
    finally:
        db.close()

def insert_initial_fares():
    db = SessionLocal()
    try:
        for f in db.query(Flight).all():
            if not db.query(FareHistory).filter(FareHistory.flight_no==f.Flight_no).first():
                dp = calculate_dynamic_price(f.base_fare, f.seats_available or 0, f.total_seats or 1, f.departure, f.airline_name or "")
                db.add(FareHistory(flight_no=f.Flight_no, fare=decimal.Decimal(str(dp)), timestamp=datetime.utcnow()))
        db.commit()
    finally:
        db.close()

insert_sample_flights()
insert_initial_fares()


@app.get("/")
def root(): return {"message":"Flight Booking API running"}

@app.get("/flights/", response_model=List[FlightOutSchema])
def list_flights(): 
    db = SessionLocal()
    flights = db.query(Flight).all()
    out = [FlightOutSchema(
        Flight_no=f.Flight_no, origin=f.origin, destination=f.destination,
        departure=f.departure, arrival=f.arrival, base_fare=float(f.base_fare),
        total_seats=f.total_seats, seats_available=f.seats_available,
        airline_name=f.airline_name, dynamic_price=calculate_dynamic_price(f.base_fare, f.seats_available or 0, f.total_seats or 1, f.departure, f.airline_name or "")
    ) for f in flights]
    db.close()
    return out

class FlightPricingOutSchema(BaseModel):
    Flight_no: str
    origin: str
    destination: str
    departure: datetime
    arrival: datetime
    base_fare: float
    total_seats: int
    seats_available: int
    airline_name: str
    dynamic_price: float
    class Config:
        from_attributes = True

@app.get("/pricing/{flight_no}", response_model=FlightPricingOutSchema)
def get_pricing(flight_no: str):
    db = SessionLocal()
    f = db.query(Flight).filter(Flight.Flight_no==flight_no).first()
    if not f:
        db.close()
        raise HTTPException(status_code=404, detail="Flight not found")
    dp = calculate_dynamic_price(f.base_fare, f.seats_available or 0, f.total_seats or 1, f.departure, f.airline_name or "")
    db.close()
    return FlightPricingOutSchema(
        Flight_no=f.Flight_no,
        origin=f.origin,
        destination=f.destination,
        departure=f.departure,
        arrival=f.arrival,
        base_fare=float(f.base_fare),
        total_seats=f.total_seats,
        seats_available=f.seats_available,
        airline_name=f.airline_name,
        dynamic_price=dp
    )


@app.post("/booking/reserve", response_model=BookingReserveOut)
def reserve_booking(payload: BookingCreate, db: Session = Depends(get_db)):
    try:
        flight = db.query(Flight).filter(Flight.Flight_id == payload.flight_id).with_for_update().first()
        if not flight:
            raise HTTPException(status_code=404, detail="Flight not found")
        if not flight.total_seats or not (1 <= payload.seat_no <= flight.total_seats):
            raise HTTPException(status_code=400, detail="Invalid seat number for this flight")

        existing = db.query(Booking).filter(
            Booking.flight_id == payload.flight_id,
            Booking.seat_no == payload.seat_no,
            Booking.status != "Cancelled"
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Seat already booked")

        if flight.seats_available is None:
            flight.seats_available = max(0, flight.total_seats - 1)
        elif flight.seats_available <= 0:
            raise HTTPException(status_code=400, detail="No seats available")

        flight.seats_available = max(0, flight.seats_available - 1)
        db.flush()

        pnr = generate_pnr()
        trans_id = payload.trans_id or generate_trans_id()
        # price snapshot using dynamic price at the time of reservation
        price_val = calculate_dynamic_price(flight.base_fare, flight.seats_available, flight.total_seats or 1, flight.departure, flight.airline_name or "")

        booking = Booking(
            trans_id=trans_id,
            flight_no=flight.Flight_no,
            flight_id=flight.Flight_id,
            passenger_fullname=payload.passenger_fullname,
            passenger_contact=payload.passenger_contact,
            seat_no=payload.seat_no,
            pnr=pnr,
            status="Reserved",
            price=decimal.Decimal(str(price_val)),
            created_at=datetime.utcnow()
        )
        db.add(booking)
        db.commit()
        db.refresh(booking)
        return BookingReserveOut(
            pnr=booking.pnr,
            flight_id=booking.flight_id,
            flight_no=booking.flight_no,
            seat_no=booking.seat_no,
            status=booking.status,
            message="Seat reserved. Proceed to payment using the PNR."
        )
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Reservation failed: {e}")

@app.post("/bookings/pay/{pnr}")
def simulate_payment(pnr: str, db: Session = Depends(get_db)):
 try:
        booking = db.query(Booking).filter(Booking.pnr == pnr).with_for_update().first()
        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found")
        if booking.status == "Confirmed":
            return {"message": f"Booking {pnr} already confirmed", "status": booking.status, "pnr": booking.pnr}
        if booking.status == "Cancelled":
            raise HTTPException(status_code=400, detail="Booking is cancelled")
        flight = db.query(Flight).filter(Flight.Flight_id == booking.flight_id).with_for_update().first()
        payment_success = random.choice([True, False, True])  # slight bias toward success
        if payment_success:
            booking.status = "Confirmed"
            # update price snapshot to current dynamic price (optional; we use reserved price)
            # booking.price = decimal.Decimal(str(calculate_dynamic_price(flight.base_fare, flight.seats_available or 0, flight.total_seats or 1, flight.departure, flight.airline_name or "")))
            booking.trans_id = booking.trans_id or generate_trans_id()
            db.commit()
            return {"message": f"Payment successful for booking {pnr}", "status": booking.status, "pnr": booking.pnr}
        else:
            # On payment failure, mark accordingly and restore seat
            booking.status = "Payment Failed"
            if flight:
                flight.seats_available = min(flight.total_seats or 0, (flight.seats_available or 0) + 1)
            db.commit()
            return {"message": f"Payment failed for booking {pnr}", "status": booking.status}
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Payment simulation failed: {e}")

@app.post("/bookings/confirm/{pnr}")
def confirm_booking(pnr: str, db: Session = Depends(get_db)):
    try:
        booking = db.query(Booking).filter(Booking.pnr == pnr).with_for_update().first()
        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found")
        if booking.status == "Confirmed":
            return {"message": "Already confirmed", "pnr": pnr}
        if booking.status == "Cancelled":
            raise HTTPException(status_code=400, detail="Cannot confirm a cancelled booking")
        booking.status = "Confirmed"
        db.commit()
        return {"message":"Booking confirmed", "pnr": pnr}
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Confirm failed: {e}")

@app.delete("/bookings/cancel/{pnr}")
def cancel_booking(pnr: str, db: Session = Depends(get_db)):
    try:
        booking = db.query(Booking).filter(Booking.pnr == pnr).with_for_update().first()
        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found")
        if booking.status == "Cancelled":
            return {"message": f"Booking {pnr} already cancelled"}
        # restore seat if it was reserved/confirmed/paid
        flight = db.query(Flight).filter(Flight.Flight_id == booking.flight_id).with_for_update().first()
        if flight:
            flight.seats_available = min((flight.total_seats or 0), (flight.seats_available or 0) + 1)
        booking.status = "Cancelled"
        db.commit()
        return {"message": f"Booking {pnr} cancelled", "pnr": pnr, "flight_id": booking.flight_id}
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Cancellation failed: {e}")

@app.get("/bookings/", response_model=List[BookingOutSchema])
def list_bookings(db: Session = Depends(get_db)):
    bk = db.query(Booking).all()
    out = []
    for b in bk:
        out.append(BookingOutSchema(
            trans_id=b.trans_id,
            flight_no=b.flight_no or "",
            passenger_fullname=b.passenger_fullname,
            passenger_contact=b.passenger_contact,
            seat_no=b.seat_no,
            origin=None,
            destination=None,
            pnr=b.pnr,
            status=b.status,
            price=float(b.price) if b.price is not None else None
        ))
    return out

@app.get("/bookings/{pnr}", response_model=BookingOutSchema)
def get_booking_by_pnr(pnr: str, db: Session = Depends(get_db)):
    b = db.query(Booking).filter(Booking.pnr == pnr).first()
    if not b:
        raise HTTPException(status_code=404, detail="Booking not found")
    return BookingOutSchema(
        trans_id=b.trans_id,
        flight_no=b.flight_no or "",
        passenger_fullname=b.passenger_fullname,
        passenger_contact=b.passenger_contact,
        seat_no=b.seat_no,
        origin=None,
        destination=None,
        pnr=b.pnr,
        status=b.status,
        price=float(b.price) if b.price is not None else None
    )

@app.get("/fare-history/{flight_no}", response_model=List[FareHistoryOutSchema])
def fare_history(flight_no: str, limit: int = 10, db: Session = Depends(get_db)):
    rows = db.query(FareHistory).filter(FareHistory.flight_no==flight_no).order_by(FareHistory.timestamp.desc()).limit(limit).all()
    return [{"timestamp":r.timestamp,"fare":float(r.fare)} for r in rows]



