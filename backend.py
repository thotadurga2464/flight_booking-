# backend.py
from fastapi import FastAPI, HTTPException
from sqlalchemy import create_engine, Column, Integer, String, DateTime, DECIMAL, ForeignKey, func
from sqlalchemy.orm import sessionmaker, declarative_base
from pydantic import BaseModel, Field
from datetime import datetime, timedelta
import random, threading, time, decimal
from typing import List, Optional

# -------------------------------
# DB CONFIG
# -------------------------------
MYSQL_USER = "root"
MYSQL_PASSWORD = "2464"
MYSQL_HOST = "localhost"
MYSQL_DB = "FlightS_booking"

DATABASE_URL = f"mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}/{MYSQL_DB}"
engine = create_engine(DATABASE_URL, echo=False, future=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()

# -------------------------------
# MODELS
# -------------------------------
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
    trans_id = Column(String(20))
    flight_no = Column(String(10), ForeignKey("Flight.Flight_no"))
    origin = Column(String(50))
    destination = Column(String(50))
    passenger_fullname = Column(String(50), nullable=False)
    passenger_contact = Column(String(20))
    seat_no = Column(Integer)

class FareHistory(Base):
    __tablename__ = "fare_history"
    id = Column(Integer, primary_key=True, autoincrement=True)
    flight_no = Column(String(10))
    timestamp = Column(DateTime, default=datetime.utcnow)
    fare = Column(DECIMAL(20,2))

Base.metadata.create_all(engine)

# -------------------------------
# SCHEMAS
# -------------------------------
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
    trans_id: str
    flight_no: str
    passenger_fullname: str
    passenger_contact: str
    seat_no: int = Field(..., ge=1)

class BookingOutSchema(BookingCreate):
    origin: str
    destination: str
    class Config:
        from_attributes = True

class FlightSearchSchema(BaseModel):
    origin: Optional[str] = None
    destination: Optional[str] = None
    date: Optional[datetime] = None
    sort_by: Optional[str] = None

class AirlineScheduleSchema(BaseModel):
    origin: str
    destination: str
    airline_name: Optional[str] = None

# POST schema for external airline schedule
class AirlineSchedulePostSchema(BaseModel):
    origin: str
    destination: str
    airline_name: Optional[str] = None

class FlightNoSchema(BaseModel):
    flight_no: str
    limit: Optional[int] = 10

# POST schema for fare history
class FareHistoryPostSchema(BaseModel):
    flight_no: str
    limit: Optional[int] = 10

class PricingOutSchema(BaseModel):
    flight_no: str
    dynamic_price: float

class FareHistoryOutSchema(BaseModel):
    timestamp: datetime
    fare: float

class ExternalFlightSchema(BaseModel):
    external_flight_no: str
    origin: str
    destination: str
    departure: str
    arrival: str
    available_seats: int
    price: float
    airline_name: str

class ExternalScheduleOutSchema(BaseModel):
    provider: str
    results: List[ExternalFlightSchema]

# -------------------------------
# DYNAMIC PRICING
# -------------------------------
def calculate_dynamic_price(base_fare, seats_available, total_seats, departure, airline_name="standard"):
    base = float(base_fare) if not isinstance(base_fare, float) else base_fare
    seat_ratio = seats_available / total_seats if total_seats else 0
    seat_factor = 0.4 * (1 - seat_ratio)
    days = (departure - datetime.now()).total_seconds() / 86400
    if days <= 0: time_factor = 0.6
    elif days <= 1: time_factor = 0.4
    elif days <= 3: time_factor = 0.2
    elif days <= 7: time_factor = 0.1
    else: time_factor = -0.05
    demand_factor = random.uniform(-0.08, 0.25)
    tier_factor = 0.12 if "premium" in airline_name.lower() or "air india" in airline_name.lower() else -0.03
    total_multiplier = 1 + seat_factor + time_factor + demand_factor + tier_factor
    return max(round(base * total_multiplier, 2), 50.0)

# -------------------------------
# FASTAPI APP
# -------------------------------
app = FastAPI(title="Flight Booking API", version="1.4")

# -------------------------------
# MARKET SIMULATOR
# -------------------------------
def simulate_market_loop(interval_seconds: int = 60):
    while True:
        db = SessionLocal()
        try:
            for f in db.query(Flight).all():
                change = random.choice([-3,-2,-1,0,1,2])
                f.seats_available = max(0, min(f.total_seats, f.seats_available + change))
                dp = calculate_dynamic_price(f.base_fare, f.seats_available, f.total_seats, f.departure, f.airline_name)
                db.add(FareHistory(flight_no=f.Flight_no, fare=decimal.Decimal(str(dp)), timestamp=datetime.utcnow()))
            db.commit()
        except Exception as e:
            db.rollback()
            print("[Simulator] error:", e)
        finally:
            db.close()
        time.sleep(interval_seconds)

threading.Thread(target=simulate_market_loop, args=(30,), daemon=True).start()

# -------------------------------
# SAMPLE FLIGHTS & FARES
# -------------------------------
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
                dp = calculate_dynamic_price(f.base_fare, f.seats_available, f.total_seats, f.departure, f.airline_name)
                db.add(FareHistory(flight_no=f.Flight_no, fare=decimal.Decimal(str(dp)), timestamp=datetime.utcnow()))
        db.commit()
    finally:
        db.close()

insert_sample_flights()
insert_initial_fares()

# -------------------------------
# HELPER FUNCTIONS
# -------------------------------
def _search_flights(origin, destination, date, sort_by):
    db = SessionLocal()
    q = db.query(Flight)
    if origin: q = q.filter(func.lower(Flight.origin)==origin.lower())
    if destination: q = q.filter(func.lower(Flight.destination)==destination.lower())
    if date:
        start, end = datetime(date.year,date.month,date.day), datetime(date.year,date.month,date.day)+timedelta(days=1)
        q = q.filter(Flight.departure>=start, Flight.departure<end)
    flights = q.all()
    out = []
    for f in flights:
        dp = calculate_dynamic_price(f.base_fare, f.seats_available, f.total_seats, f.departure, f.airline_name)
        duration = (f.arrival-f.departure).total_seconds() if f.arrival and f.departure else None
        out.append({**f.__dict__, "dynamic_price": dp, "duration_seconds": duration})
    if sort_by=="price": out.sort(key=lambda x: x["dynamic_price"])
    elif sort_by=="duration": out.sort(key=lambda x: x["duration_seconds"] or float("inf"))
    results = [FlightOutSchema(**{k:v for k,v in item.items() if k in FlightOutSchema.__fields__}) for item in out]
    db.close()
    return results

def external_schedule_mock(origin: str, destination: str, airline_name: Optional[str] = None):
    airlines = ["Air India", "IndiGo", "Vistara", "SpiceJet"]
    results = []
    for i in range(3):
        dep = datetime.utcnow() + timedelta(hours=4+i*3)
        arr = dep + timedelta(hours=random.choice([1,2,2.5,3]))
        airline = airline_name if airline_name else random.choice(airlines)
        results.append({
            "external_flight_no": f"{airline[:2].upper()}{random.randint(100,999)}",
            "origin": origin, "destination": destination,
            "departure": dep.isoformat(), "arrival": arr.isoformat(),
            "available_seats": random.randint(10,100),
            "price": round(random.uniform(3000,10000),2),
            "airline_name": airline
        })
    return {"provider":"mock-airline","results":results}

# -------------------------------
# ENDPOINTS
# -------------------------------
@app.get("/")
def root(): return {"message":"Flight Booking API running"}
@app.post("/") 
def root_post(): return {"message":"Flight Booking API running"}

# Flights
@app.get("/flights/", response_model=List[FlightOutSchema])
def list_flights(): 
    db = SessionLocal()
    flights = db.query(Flight).all()
    out = [FlightOutSchema(
        Flight_no=f.Flight_no, origin=f.origin, destination=f.destination,
        departure=f.departure, arrival=f.arrival, base_fare=float(f.base_fare),
        total_seats=f.total_seats, seats_available=f.seats_available,
        airline_name=f.airline_name, dynamic_price=calculate_dynamic_price(f.base_fare, f.seats_available, f.total_seats, f.departure, f.airline_name)
    ) for f in flights]
    db.close()
    return out

@app.post("/flights/list", response_model=List[FlightOutSchema])
def list_flights_post(): return list_flights()

@app.post("/flights/", response_model=FlightOutSchema)
def create_flight_post(f: FlightCreateSchema):
    db = SessionLocal()
    if db.query(Flight).filter(Flight.Flight_no==f.Flight_no).first():
        db.close(); raise HTTPException(400,"Flight number exists")
    new = Flight(**f.dict())
    db.add(new); db.commit(); db.refresh(new)
    dp = calculate_dynamic_price(new.base_fare, new.seats_available, new.total_seats, new.departure, new.airline_name)
    db.add(FareHistory(flight_no=new.Flight_no, fare=decimal.Decimal(str(dp)), timestamp=datetime.utcnow()))
    db.commit(); db.close()
    return FlightOutSchema(**{**f.dict(), "dynamic_price": dp})

@app.get("/flights/search", response_model=List[FlightOutSchema])
def search_flights_get(origin: Optional[str]=None, destination: Optional[str]=None, date: Optional[datetime]=None, sort_by: Optional[str]=None):
    return _search_flights(origin,destination,date,sort_by)

@app.post("/flights/search", response_model=List[FlightOutSchema])
def search_flights_post(payload: FlightSearchSchema):
    return _search_flights(payload.origin,payload.destination,payload.date,payload.sort_by)

# Pricing
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# Updated schema for pricing + flight info
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

# Updated endpoint
@app.get("/pricing/{flight_no}", response_model=FlightPricingOutSchema)
def get_pricing(flight_no: str):
    db = SessionLocal()
    f = db.query(Flight).filter(Flight.Flight_no==flight_no).first()
    if not f:
        db.close()
        raise HTTPException(404,"Flight not found")
    dp = calculate_dynamic_price(f.base_fare, f.seats_available, f.total_seats, f.departure, f.airline_name)
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

@app.post("/pricing", response_model=FlightPricingOutSchema)
def get_pricing_post(payload: FlightNoSchema):
    return get_pricing(payload.flight_no)

# Bookings
@app.get("/bookings/", response_model=List[BookingOutSchema])
def list_bookings():
    db = SessionLocal()
    bk = db.query(Booking).all()
    out = [BookingOutSchema(**{
        "trans_id":b.trans_id, "flight_no":b.flight_no,
        "passenger_fullname":b.passenger_fullname, "passenger_contact":b.passenger_contact,
        "seat_no":b.seat_no, "origin":b.origin, "destination":b.destination
    }) for b in bk]
    db.close(); return out

@app.post("/bookings/list", response_model=List[BookingOutSchema])
def list_bookings_post(): return list_bookings()

@app.post("/bookings/", response_model=BookingOutSchema)
def create_booking_post(b: BookingCreate):
    db = SessionLocal()
    flight = db.query(Flight).filter(Flight.Flight_no==b.flight_no).first()
    if not flight: db.close(); raise HTTPException(404, "Flight not found")
    if b.seat_no < 1 or b.seat_no > flight.total_seats:
        db.close(); raise HTTPException(400, "Invalid seat number")
    if db.query(Booking).filter(Booking.flight_no==b.flight_no, Booking.seat_no==b.seat_no).first():
        db.close(); raise HTTPException(400, "Seat already booked")
    booking = Booking(
        trans_id=b.trans_id, flight_no=b.flight_no,
        passenger_fullname=b.passenger_fullname, passenger_contact=b.passenger_contact,
        seat_no=b.seat_no, origin=flight.origin, destination=flight.destination
    )
    db.add(booking)
    flight.seats_available = max(flight.seats_available-1, 0)
    db.commit(); db.refresh(booking)
    out = BookingOutSchema(**{
        "trans_id":booking.trans_id, "flight_no":booking.flight_no,
        "passenger_fullname":booking.passenger_fullname, "passenger_contact":booking.passenger_contact,
        "seat_no":booking.seat_no, "origin":booking.origin, "destination":booking.destination
    })
    db.close()
    return out

# External schedule
@app.get("external/airline-schedu/le", response_model=ExternalScheduleOutSchema)
def external_schedule_get(origin: str, destination: str): 
    return external_schedule_mock(origin, destination)

@app.post("/external/airline-schedule", response_model=ExternalScheduleOutSchema)
def external_schedule_post(payload: AirlineSchedulePostSchema):
    return external_schedule_mock(payload.origin, payload.destination, payload.airline_name)

# Fare history
@app.get("/fare-history/{flight_no}", response_model=List[FareHistoryOutSchema])
def fare_history(flight_no: str, limit: int = 10):
    db = SessionLocal()
    rows = db.query(FareHistory).filter(FareHistory.flight_no==flight_no).order_by(FareHistory.timestamp.desc()).limit(limit).all()
    db.close()
    return [{"timestamp":r.timestamp,"fare":float(r.fare)} for r in rows]

@app.post("/fare-history", response_model=List[FareHistoryOutSchema])
def fare_history_post(payload: FareHistoryPostSchema):
    return fare_history(payload.flight_no, payload.limit)
