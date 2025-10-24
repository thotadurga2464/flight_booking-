# Flight Booking Simulator with Dynamic Pricing

## Project Overview
**Flight Booking Simulator with Dynamic Pricing** is a web-based flight reservation system designed to emulate real-world airline booking platforms.  
The project incorporates a **dynamic pricing engine** that adjusts fares based on **seat availability, time until departure, simulated demand**, and airline-specific pricing tiers.  

Users can search flights, view dynamic fares, and complete a **multi-step booking process** with simulated payment, all while ensuring **concurrency-safe seat reservations**.

---

## Project Statement
This project aims to develop a functional flight booking simulator that integrates:

- **Dynamic fare calculation** for realistic pricing behavior.
- **Transactional booking workflow** with concurrency safety.
- **Database-backed storage** for flights, bookings, passengers, and fare history.
- **APIs for full CRUD operations** on flights and bookings.
- **Simulated airline market** with fluctuating seat availability and fare history.

Through this project, students gain experience in **API development, database design, pricing algorithms, and transactional systems**.

---

## Key Features
- **Flight Search & Filtering:** Search by origin, destination, and date; sort by price or duration.
- **Dynamic Pricing Engine:** Fares adjust dynamically based on:
  - Remaining seat percentage
  - Time until departure
  - Simulated demand levels
  - Airline tiering and base fare
- **Booking Workflow:**
  - Seat reservation (concurrency-safe)
  - Passenger information capture
  - Simulated payment success/failure
  - PNR generation and confirmation
  - Booking cancellation and seat restoration
- **Background Market Simulation:** Seats and fares fluctuate periodically to mimic real-world demand.
- **Fare History Tracking:** Keeps historical price records for flights.

---

## Milestones

### **Milestone 1: Database & Sample Data**
- Designed schema for airports, flights, passengers, and bookings.
- Implemented sample data for testing.
- Practiced **SQL queries, joins, and transactions**.

### **Milestone 2: Flight Search & Dynamic Pricing**
- Built **REST APIs** to:
  - Retrieve all flights
  - Search flights by origin, destination, and date
  - Sort by price or duration
- Integrated **dynamic pricing logic**:
  - Seat availability
  - Time to departure
  - Simulated demand
  - Airline tiers
- Implemented **background simulation** for demand and availability changes.
- Stored **fare history** for tracking price changes.

### **Milestone 3: Booking Workflow & Transaction Management**
- Developed **multi-step booking process**:
  - Flight & seat selection
  - Passenger info capture
  - Simulated payment
- Implemented **concurrency-safe seat reservations** using transactions and row locks.
- Generated **unique PNRs** and stored bookings.
- Built endpoints for:
  - Confirming bookings
  - Cancelling bookings
  - Retrieving booking history

---

## Technology Stack
- **Backend:** FastAPI  
- **Database:** MySQL (can switch to PostgreSQL or SQLite)  
- **ORM:** SQLAlchemy  
- **Python Libraries:** Pydantic, UUID, Decimal, Threading, Random  
- **Frontend (optional):** HTML/JS/CSS or React/Vue for interactive UI  

---

## API Endpoints

### **Flights**
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/flights/` | GET | Retrieve all flights with dynamic pricing |
| `/pricing/{flight_no}` | GET | Get dynamic fare for a specific flight |
| `/fare-history/{flight_no}` | GET | Get fare history for a flight |

### **Booking**
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/booking/reserve` | POST | Reserve a seat (returns PNR) |
| `/bookings/pay/{pnr}` | POST | Simulate payment for booking |
| `/bookings/confirm/{pnr}` | POST | Confirm booking directly |
| `/bookings/cancel/{pnr}` | DELETE | Cancel a booking and restore seat |
| `/bookings/` | GET | List all bookings |
| `/bookings/{pnr}` | GET | Retrieve booking by PNR |

---

## Dynamic Pricing Logic
The dynamic fare is calculated using the following factors:

- **Seat Factor:** Ratio of remaining seats to total seats.
- **Time Factor:** Days until departure influence price multiplier.
- **Demand Factor:** Randomized factor to simulate market demand.
- **Airline Tier Factor:** Premium airlines adjust base fare higher.
- **Base Fare:** Starting fare for the flight.


