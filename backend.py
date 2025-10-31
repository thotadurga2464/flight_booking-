from fastapi import FastAPI, HTTPException, Depends
from sqlalchemy import create_engine, Column, Integer, String, DateTime, DECIMAL, ForeignKey, CheckConstraint
from sqlalchemy.orm import sessionmaker, declarative_base, Session, relationship
from pydantic import BaseModel
from datetime import datetime, timedelta
import random, decimal, uuid, string, asyncio
from typing import List, Optional
from fastapi.middleware.cors import CORSMiddleware


# --------------------- Database Config ---------------------
MYSQL_USER = "root"
MYSQL_PASSWORD = "2464"
MYSQL_HOST = "localhost"
MYSQL_DB = "FlightS_booking"

DATABASE_URL = f"mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}/{MYSQL_DB}"
engine = create_engine(DATABASE_URL, echo=False, future=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()

# --------------------- Tables ---------------------
class Airport(Base):
    __tablename__ = "airports"
    airport_id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    city = Column(String(50), nullable=False)
    country = Column(String(50), nullable=False)
    iata_code = Column(String(3), unique=True, nullable=False)

class Airline(Base):
    __tablename__ = "airline"
    airline_id = Column(Integer, primary_key=True, autoincrement=True)
    airline_name = Column(String(100), nullable=False)
    contact_email = Column(String(100))
    contact_number = Column(String(15))

class Flight(Base):
    __tablename__ = "Flight"
    Flight_id = Column(Integer, primary_key=True, autoincrement=True)
    Flight_no = Column(String(10), unique=True, nullable=False)
    airline_id = Column(Integer, ForeignKey("airline.airline_id"))
    origin = Column(String(50))
    destination = Column(String(50))
    departure = Column(DateTime)
    arrival = Column(DateTime)
    base_fare = Column(DECIMAL(10,2), default=5000.0)
    total_seats = Column(Integer)
    seats_available = Column(Integer)
    airline_name = Column(String(50))
    flight_status = Column(String(10), default="On Time")
    airline = relationship("Airline")

class Passenger(Base):
    __tablename__ = "passengers"
    passenger_id = Column(Integer, primary_key=True, autoincrement=True)
    full_name = Column(String(100), nullable=False)
    contact_number = Column(String(20))
    email = Column(String(100))
    city = Column(String(50))

class Booking(Base):
    __tablename__ = "bookings"
    booking_id = Column(Integer, primary_key=True, autoincrement=True)
    trans_id = Column(String(50))
    flight_no = Column(String(10), ForeignKey("Flight.Flight_no"))
    flight_id = Column(Integer, ForeignKey("Flight.Flight_id"))
    passenger_fullname = Column(String(100), nullable=False)
    passenger_contact = Column(String(20))
    seat_no = Column(Integer)
    pnr = Column(String(16), unique=True)
    status = Column(String(30), default="Pending")
    price = Column(DECIMAL(12,2))
    created_at = Column(DateTime, default=datetime.utcnow)
    flight = relationship("Flight")

class FareHistory(Base):
    __tablename__ = "fare_history"
    id = Column(Integer, primary_key=True, autoincrement=True)
    flight_no = Column(String(10))
    timestamp = Column(DateTime, default=datetime.utcnow)
    fare = Column(DECIMAL(20,2))

class User(Base):
    __tablename__ = "user"
    user_id = Column(Integer, primary_key=True, autoincrement=True)
    full_name = Column(String(100))
    email = Column(String(100), unique=True)
    password = Column(String(255))
    phone = Column(String(15))
    role = Column(String(10), default="User")

class DynamicPricing(Base):
    __tablename__ = "dynamic_pricing"
    pricing_id = Column(Integer, primary_key=True, autoincrement=True)
    flight_id = Column(Integer, ForeignKey("Flight.Flight_id"))
    timestamp = Column(DateTime, default=datetime.utcnow)
    demand_factor = Column(DECIMAL(5,2))
    time_factor = Column(DECIMAL(5,2))
    seat_factor = Column(DECIMAL(5,2))
    final_fare = Column(DECIMAL(10,2))
    flight = relationship("Flight")

class Payment(Base):
    __tablename__ = "payment"
    payment_id = Column(Integer, primary_key=True, autoincrement=True)
    booking_id = Column(Integer, ForeignKey("bookings.booking_id"))
    payment_date = Column(DateTime, default=datetime.utcnow)
    amount = Column(DECIMAL(10,2))
    payment_mode = Column(String(20))
    payment_status = Column(String(10), default="Success")
    booking = relationship("Booking")

Base.metadata.create_all(engine)

# --------------------- Schemas ---------------------
class FlightOutSchema(BaseModel):
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
        orm_mode = True

class BookingCreate(BaseModel):
    flight_id: int
    seat_no: int
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

class FareHistoryOutSchema(BaseModel):
    timestamp: datetime
    fare: float

# --------------------- Helper Functions ---------------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def generate_pnr(length: int = 6) -> str:
    chars = string.ascii_uppercase + string.digits
    return ''.join(random.choice(chars) for _ in range(length))

def generate_trans_id() -> str:
    return str(uuid.uuid4()).replace('-', '')[:20]

def calculate_dynamic_price(base_fare, seats_available, total_seats, departure, airline_name="standard"):
    base = float(base_fare) if not isinstance(base_fare, float) else base_fare
    seat_ratio = seats_available / total_seats if total_seats else 0
    seat_factor = 0.4 * (1 - seat_ratio)
    days = (departure - datetime.utcnow()).total_seconds() / 86400 if departure else 0
    time_factor = 0.6 if days <= 0 else 0.4 if days <= 1 else 0.2 if days <= 3 else 0.1 if days <= 7 else -0.05
    demand_factor = random.uniform(-0.08, 0.25)
    tier_factor = 0.12 if "premium" in airline_name.lower() or "air india" in airline_name.lower() else -0.03
    total_multiplier = 1 + seat_factor + time_factor + demand_factor + tier_factor
    return max(round(base * total_multiplier, 2), 50.0)

# --------------------- FastAPI App ---------------------
app = FastAPI(title="Flight Booking API Full", version="1.5")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --------------------- Routes ---------------------
@app.get("/flights", response_model=List[FlightOutSchema])
@app.get("/flights/", response_model=List[FlightOutSchema])
def list_flights(db: Session = Depends(get_db)):
    flights = db.query(Flight).all()
    out = []
    for f in flights:
        dp = calculate_dynamic_price(f.base_fare, f.seats_available or 0, f.total_seats or 1, f.departure, f.airline_name or "")
        out.append(FlightOutSchema(
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
        ))
    return out

@app.get("/pricing/{flight_no}", response_model=FlightOutSchema)
def get_pricing(flight_no: str, db: Session = Depends(get_db)):
    f = db.query(Flight).filter(Flight.Flight_no==flight_no).first()
    if not f:
        raise HTTPException(404,"Flight not found")
    dp = calculate_dynamic_price(f.base_fare, f.seats_available or 0, f.total_seats or 1, f.departure, f.airline_name or "")
    return FlightOutSchema(
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
            raise HTTPException(404,"Flight not found")
        if not flight.total_seats or not (1 <= payload.seat_no <= flight.total_seats):
            raise HTTPException(400,"Invalid seat")
        existing = db.query(Booking).filter(Booking.flight_id==payload.flight_id, Booking.seat_no==payload.seat_no, Booking.status!="Cancelled").first()
        if existing:
            raise HTTPException(400,"Seat already booked")
        if flight.seats_available is None:
            flight.seats_available = max(0, flight.total_seats-1)
        elif flight.seats_available <= 0:
            raise HTTPException(400,"No seats available")
        flight.seats_available = max(0, flight.seats_available - 1)
        db.flush()
        pnr = generate_pnr()
        trans_id = payload.trans_id or generate_trans_id()
        price_val = calculate_dynamic_price(flight.base_fare, flight.seats_available, flight.total_seats or 1, flight.departure, flight.airline_name or "")
        booking = Booking(
            trans_id=trans_id, flight_no=flight.Flight_no, flight_id=flight.Flight_id,
            passenger_fullname=payload.passenger_fullname, passenger_contact=payload.passenger_contact,
            seat_no=payload.seat_no, pnr=pnr, status="Reserved", price=decimal.Decimal(str(price_val))
        )
        db.add(booking)
        db.commit()
        db.refresh(booking)
        return BookingReserveOut(
            pnr=booking.pnr, flight_id=booking.flight_id, flight_no=booking.flight_no,
            seat_no=booking.seat_no, status=booking.status, message="Seat reserved. Proceed to payment using the PNR."
        )
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(500,f"Reservation failed: {e}")

@app.post("/bookings/pay/{pnr}")
def simulate_payment(pnr: str, db: Session = Depends(get_db)):
    try:
        booking = db.query(Booking).filter(Booking.pnr==pnr).with_for_update().first()
        if not booking:
            raise HTTPException(404,"Booking not found")
        if booking.status=="Confirmed":
            return {"message": f"Booking {pnr} already confirmed","status":booking.status,"pnr":booking.pnr}
        if booking.status=="Cancelled":
            raise HTTPException(400,"Booking cancelled")
        flight = db.query(Flight).filter(Flight.Flight_id==booking.flight_id).with_for_update().first()
        payment_success = random.choice([True, False, True])
        if payment_success:
            booking.status="Confirmed"
            booking.trans_id = booking.trans_id or generate_trans_id()
            db.commit()
            return {"message": f"Payment successful for booking {pnr}", "status": booking.status, "pnr": booking.pnr}
        else:
            booking.status="Payment Failed"
            if flight:
                flight.seats_available = min(flight.total_seats or 0, (flight.seats_available or 0)+1)
            db.commit()
            return {"message": f"Payment failed for booking {pnr}", "status": booking.status}
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(500,f"Payment simulation failed: {e}")

@app.delete("/bookings/cancel/{pnr}")
def cancel_booking(pnr: str, db: Session = Depends(get_db)):
    try:
        booking = db.query(Booking).filter(Booking.pnr==pnr).with_for_update().first()
        if not booking:
            raise HTTPException(404,"Booking not found")
        if booking.status=="Cancelled":
            return {"message": f"Booking {pnr} already cancelled"}
        flight = db.query(Flight).filter(Flight.Flight_id==booking.flight_id).with_for_update().first()
        if flight:
            flight.seats_available = min(flight.total_seats or 0, (flight.seats_available or 0)+1)
        booking.status="Cancelled"
        db.commit()
        return {"message": f"Booking {pnr} cancelled","pnr":booking.pnr,"flight_id":booking.flight_id}
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(500,f"Cancellation failed: {e}")

@app.get("/fare-history/{flight_no}", response_model=List[FareHistoryOutSchema])
def fare_history(flight_no: str, limit: int = 10, db: Session = Depends(get_db)):
    rows = db.query(FareHistory).filter(FareHistory.flight_no==flight_no).order_by(FareHistory.timestamp.desc()).limit(limit).all()
    return [{"timestamp":r.timestamp,"fare":float(r.fare)} for r in rows]

@app.get("/health")
def health_check():
    return {"status":"running","time":datetime.utcnow()}

@app.get("/")
def root():
    return {"message":"Flight Booking API running"}

# --------------------- Dynamic Pricing Background ---------------------
async def dynamic_pricing_updater():
    while True:
        async with asyncio.Lock():
            db = SessionLocal()
            try:
                flights = db.query(Flight).all()
                for f in flights:
                    dp = calculate_dynamic_price(f.base_fare, f.seats_available or 0, f.total_seats or 1, f.departure, f.airline_name or "")
                    entry = DynamicPricing(
                        flight_id=f.Flight_id,
                        demand_factor=decimal.Decimal(str(random.uniform(0,0.3))),
                        time_factor=decimal.Decimal(str(random.uniform(0,0.3))),
                        seat_factor=decimal.Decimal(str(random.uniform(0,0.3))),
                        final_fare=decimal.Decimal(str(dp))
                    )
                    db.add(entry)
                    db.commit()
            except Exception:
                db.rollback()
            finally:
                db.close()
        await asyncio.sleep(30)

@app.on_event("startup")
async def start_background_tasks():
    asyncio.create_task(dynamic_pricing_updater())

from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

# Mount the static folder (for CSS, JS, images, index.html, etc.)
app.mount("/static", StaticFiles(directory="static"), name="static")

# Serve index.html at the root URL
@app.get("/")
def serve_index():
    return FileResponse(os.path.join("static", "index.html"))
