USE FlightS_booking;

DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS passengers;
DROP TABLE IF EXISTS Flight;
DROP TABLE IF EXISTS airports;
DROP TABLE IF EXISTS fare_history;

CREATE TABLE airports (
    airport_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    city VARCHAR(50) NOT NULL,
    country VARCHAR(50) NOT NULL,
    iata_code CHAR(3) NOT NULL UNIQUE
);

INSERT INTO airports (name, city, country, iata_code)
VALUES 
('Indira Gandhi International Airport', 'Delhi', 'India', 'DEL'),
('Chhatrapati Shivaji Maharaj International Airport', 'Mumbai', 'India', 'BOM'),
('Chennai International Airport', 'Chennai', 'India', 'MAA');


CREATE TABLE Flight (
    Flight_id INT AUTO_INCREMENT PRIMARY KEY,
    Flight_no VARCHAR(10) NOT NULL UNIQUE,
    origin VARCHAR(50),
    destination VARCHAR(50),
    departure DATETIME,
    arrival DATETIME,
    base_fare DECIMAL(10, 2) DEFAULT 5000.00,
    total_seats INT CHECK (total_seats >= 0),
    seats_available INT CHECK (seats_available >= 0),
    airline_name VARCHAR(50)
);

INSERT INTO Flight (Flight_no, origin, destination, departure, arrival, base_fare, total_seats, seats_available, airline_name)
VALUES 
('AI101', 'Delhi', 'Mumbai', NOW() + INTERVAL 2 DAY, NOW() + INTERVAL 2 DAY + INTERVAL 2 HOUR, 5000.00, 100, 100, 'Air India'),
('AI102', 'Bangalore', 'Chennai', NOW() + INTERVAL 3 DAY, NOW() + INTERVAL 3 DAY + INTERVAL 1 HOUR + INTERVAL 30 MINUTE, 4500.00, 120, 120, 'Air India Premium'),
('AI103', 'Mumbai', 'Kolkata', NOW() + INTERVAL 4 DAY, NOW() + INTERVAL 4 DAY + INTERVAL 3 HOUR, 6000.00, 150, 150, 'Air India');


CREATE TABLE passengers (
    passenger_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    contact_number VARCHAR(20),
    email VARCHAR(100),
    city VARCHAR(50)
);

INSERT INTO passengers (full_name, contact_number, email, city)
VALUES 
('Alice Johnson', '1234567890', 'alice@example.com', 'Delhi'),
('Bob Smith', '9876543210', 'bob@example.com', 'Mumbai'),
('Jack Lee', '8753092837', 'jack@example.com', 'Chennai'),
('David Kumar', '9988776655', 'david@example.com', 'Hyderabad'),
('Eva Thomas', '9911223344', 'eva@example.com', 'Bangalore');

CREATE TABLE bookings (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    trans_id VARCHAR(50),
    flight_no VARCHAR(10),
    flight_id INT,
    passenger_fullname VARCHAR(100) NOT NULL,
    passenger_contact VARCHAR(20),
    seat_no INT,
    pnr VARCHAR(16) UNIQUE,
    status VARCHAR(30) DEFAULT 'Pending',
    price DECIMAL(12,2),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (flight_no) REFERENCES Flight(Flight_no),
    FOREIGN KEY (flight_id) REFERENCES Flight(Flight_id)
);

INSERT INTO bookings (trans_id, flight_no, flight_id, passenger_fullname, passenger_contact, seat_no, pnr, status, price)
VALUES 
('IC145', 'AI101', 1, 'Alice Johnson', '1234567890', 12, 'PNR001', 'Confirmed', 5200.00),
('AB123', 'AI102', 2, 'Bob Smith', '9876543210', 6, 'PNR002', 'Confirmed', 4600.00),
('TC078', 'AI103', 3, 'Jack Lee', '8753092837', 24, 'PNR003', 'Confirmed', 6100.00);

CREATE TABLE fare_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    flight_no VARCHAR(10),
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    fare DECIMAL(20,2)
);


INSERT INTO fare_history (flight_no, fare)
VALUES 
('AI101', 5200.00),
('AI102', 4600.00),
('AI103', 6100.00);

START TRANSACTION;
UPDATE Flight
SET seats_available = seats_available - 1
WHERE Flight_no = 'AI101';

INSERT INTO bookings (trans_id, flight_no, flight_id, passenger_fullname, passenger_contact, seat_no, pnr, status, price)
VALUES ('XY789', 'AI101', 1, 'David Kumar', '9988776655', 22, 'PNR004', 'Reserved', 5300.00);

COMMIT;

SELECT Flight_no, origin, destination, departure, arrival, seats_available
FROM Flight
WHERE seats_available > 0
ORDER BY departure ASC;

SELECT passenger_fullname, passenger_contact, seat_no
FROM bookings
WHERE flight_no = 'AI101';

SELECT f.Flight_no, f.total_seats, COUNT(b.booking_id) AS booked_seats
FROM Flight f
LEFT JOIN bookings b ON f.Flight_no = b.flight_no
GROUP BY f.Flight_no, f.total_seats;

SELECT airline_name, COUNT(*) AS total_flights
FROM Flight
GROUP BY airline_name;

SELECT f.Flight_no, f.origin, f.destination
FROM Flight f
LEFT JOIN bookings b ON f.Flight_no = b.flight_no
WHERE b.booking_id IS NULL;

SELECT * FROM bookings ORDER BY booking_id DESC LIMIT 5;

SELECT Flight_no, origin, destination, departure
FROM Flight
WHERE departure BETWEEN NOW() AND NOW() + INTERVAL 3 DAY;

SELECT b.passenger_fullname, b.seat_no, b.status, b.price, f.Flight_no, f.origin, f.destination, f.departure, f.arrival
FROM bookings b
INNER JOIN Flight f ON b.flight_no = f.Flight_no;

SELECT Flight_no, total_seats, seats_available, (total_seats - seats_available) AS booked_seats
FROM Flight;

SELECT b.passenger_fullname, b.seat_no, b.status, p.contact_number, p.email, p.city, f.Flight_no, f.origin, f.destination
FROM bookings b
INNER JOIN passengers p ON b.passenger_fullname = p.full_name
INNER JOIN Flight f ON b.flight_no = f.Flight_no;

SELECT f.Flight_no, fh.timestamp, fh.fare
FROM Flight f
LEFT JOIN fare_history fh ON f.Flight_no = fh.flight_no
ORDER BY fh.timestamp DESC;

SELECT * FROM airports;
SELECT * FROM Flight;
SELECT * FROM passengers;
SELECT * FROM bookings;
SELECT * FROM fare_history;


