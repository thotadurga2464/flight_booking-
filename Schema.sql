-- Use the database
USE FlightS_booking;

-- Drop in correct order
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS passengers;
DROP TABLE IF EXISTS Flight;
DROP TABLE IF EXISTS airports;

-- Create airports table
CREATE TABLE airports (
    airport_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    city VARCHAR(50) NOT NULL,
    country VARCHAR(50) NOT NULL,
    iata_code CHAR(3) NOT NULL UNIQUE
);

-- Insert airport records
INSERT INTO airports (name, city, country, iata_code)
VALUES 
('Indira Gandhi International Airport', 'Delhi', 'India', 'DEL'),
('Chhatrapati Shivaji Maharaj International Airport', 'Mumbai', 'India', 'BOM'),
('Chennai International Airport', 'Chennai', 'India', 'MAA');

-- Create Flight table
CREATE TABLE Flight (
    Flight_id INT AUTO_INCREMENT PRIMARY KEY,
    Flight_no VARCHAR(10) NOT NULL UNIQUE,
    origin VARCHAR(50),
    destination VARCHAR(50),
    departure DATETIME,
    arrival DATETIME,
    base_fare DECIMAL(10, 2) DEFAULT 5000.00,
    total_seats INT,
    seats_available INT CHECK (seats_available >= 0),
    airline_name VARCHAR(50)
);

-- Insert flight records
INSERT INTO Flight (Flight_no, origin, destination, departure, arrival, base_fare, total_seats, seats_available, airline_name)
VALUES 
('AI1', 'Delhi', 'Mumbai', '2025-03-01 10:00:00', '2025-03-01 12:00:00', 8000.00, 200, 150, 'Air India'),
('AI2', 'Mumbai', 'Delhi', '2025-03-01 15:00:00', '2025-03-01 17:00:00', 8000.00, 200, 200, 'Air India'),
('AI3', 'Delhi', 'Chennai', '2025-03-01 09:00:00', '2025-03-01 11:30:00', 9000.00, 200, 180, 'Air India'),
('AI4', 'Chennai', 'Delhi', '2025-03-01 13:00:00', '2025-03-01 15:30:00', 9000.00, 200, 200, 'Air India'),
('AI5', 'Mumbai', 'Chennai', '2025-03-01 12:00:00', '2025-03-01 14:30:00', 6000.00, 200, 160, 'Air India'),
('AI6', 'Chennai', 'Mumbai', '2025-03-01 16:00:00', '2025-03-01 18:30:00', 7000.00, 200, 200, 'Air India');

-- Update available seats on Flight ID 6
UPDATE Flight SET seats_available = 300 WHERE Flight_id = 6;

-- Create passengers table
CREATE TABLE passengers (
    passenger_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    contact_number VARCHAR(20),
    email VARCHAR(100),
    city VARCHAR(50)
);

-- Insert passengers
INSERT INTO passengers (full_name, contact_number, email, city)
VALUES 
('Alice Johnson', '1234567890', 'alice@example.com', 'Delhi'),
('Bob Smith', '9876543210', 'bob@example.com', 'Mumbai'),
('Jack Lee', '8753092837', 'jack@example.com', 'Chennai'),
('David Kumar', '9988776655', 'david@example.com', 'Hyderabad'),
('Eva Thomas', '9911223344', 'eva@example.com', 'Bangalore');

-- Create bookings table
CREATE TABLE bookings (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    trans_id VARCHAR(20),
    flight_no VARCHAR(10),
    origin VARCHAR(50),
    destination VARCHAR(50),
    passenger_fullname VARCHAR(50) NOT NULL,
    passenger_contact VARCHAR(20),
    seat_no INT,
    FOREIGN KEY (flight_no) REFERENCES Flight(Flight_no)
);

-- Insert bookings
INSERT INTO bookings (trans_id, flight_no, origin, destination, passenger_fullname, passenger_contact, seat_no)
VALUES 
('IC145', 'AI1', 'Delhi', 'Mumbai', 'Alice Johnson', '1234567890', 12),
('AB123', 'AI2', 'Mumbai', 'Delhi', 'Bob Smith', '9876543210', 6),
('TC078', 'AI3', 'Delhi', 'Chennai', 'Jack Lee', '8753092837', 24);

-- JOINS

-- 1. INNER JOIN
SELECT b.passenger_fullname, f.Flight_no, f.origin, f.destination
FROM bookings b
INNER JOIN Flight f ON b.flight_no = f.Flight_no;

-- 2. LEFT JOIN
SELECT f.Flight_no, f.origin, f.destination, b.passenger_fullname
FROM Flight f
LEFT JOIN bookings b ON f.Flight_no = b.flight_no;

-- 3. RIGHT JOIN (requires latest MySQL or workaround with UNION)
SELECT b.passenger_fullname, f.Flight_no
FROM bookings b
RIGHT JOIN Flight f ON b.flight_no = f.Flight_no;

-- 4. FULL OUTER JOIN simulation using UNION
SELECT f.Flight_no, b.passenger_fullname
FROM Flight f
LEFT JOIN bookings b ON f.Flight_no = b.flight_no
UNION
SELECT f.Flight_no, b.passenger_fullname
FROM bookings b
RIGHT JOIN Flight f ON b.flight_no = f.Flight_no;


START TRANSACTION;

-- Check current seats
SELECT seats_available FROM Flight WHERE Flight_id = 1;

-- Deduct 1 seat
UPDATE Flight
SET seats_available = seats_available - 1
WHERE Flight_id = 1;

-- Add new booking
INSERT INTO bookings (trans_id, flight_no, origin, destination, passenger_fullname, passenger_contact, seat_no)
VALUES ('XY789', 'AI1', 'Delhi', 'Mumbai', 'David Kumar', '9988776655', 22);

COMMIT;

-- Final check
SELECT * FROM airports;
SELECT * FROM Flight;
SELECT * FROM passengers;
SELECT * FROM bookings;


