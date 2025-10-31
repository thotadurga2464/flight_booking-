# models.py
from sqlalchemy import Column, Integer, String, DateTime, DECIMAL, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Flight(Base):
    __tablename__ = "Flight"

    Flight_id = Column(Integer, primary_key=True, index=True)
    Flight_no = Column(String(10), unique=True)
    origin = Column(String(50))
    destination = Column(String(50))
    departure = Column(DateTime)
    arrival = Column(DateTime)
    base_fare = Column(DECIMAL(10, 2))
    total_seats = Column(Integer)
    seats_available = Column(Integer)
    airline_name = Column(String(50))

    bookings = relationship("Booking", back_populates="flight")

class Passenger(Base):
    __tablename__ = "passengers"

    passenger_id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(100))
    contact_number = Column(String(20))
    email = Column(String(100))
    city = Column(String(50))

class Booking(Base):
    __tablename__ = "bookings"

    booking_id = Column(Integer, primary_key=True, index=True)
    trans_id = Column(String(20))
    flight_no = Column(String(10), ForeignKey("Flight.Flight_no"))
    origin = Column(String(50))
    destination = Column(String(50))
    passenger_fullname = Column(String(50))
    passenger_contact = Column(String(20))
    seat_no = Column(Integer)

    flight = relationship("Flight", back_populates="bookings")
