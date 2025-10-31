USE FlightS_booking;

DROP TABLE IF EXISTS payment;
DROP TABLE IF EXISTS dynamic_pricing;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS passengers;
DROP TABLE IF EXISTS Flight;
DROP TABLE IF EXISTS airports;
DROP TABLE IF EXISTS fare_history;
DROP TABLE IF EXISTS airline;
DROP TABLE IF EXISTS user;


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


CREATE TABLE airline (
    airline_id INT AUTO_INCREMENT PRIMARY KEY,
    airline_name VARCHAR(100) NOT NULL,
    contact_email VARCHAR(100),
    contact_number VARCHAR(15)
);

INSERT INTO airline (airline_name, contact_email, contact_number)
VALUES 
('Air India', 'info@airindia.com', '1800-180-1407'),
('IndiGo Airlines', 'support@goindigo.in', '0124-6173838'),
('SpiceJet', 'customer@spicejet.com', '9876543210');

CREATE TABLE Flight (
    Flight_id INT AUTO_INCREMENT PRIMARY KEY,
    Flight_no VARCHAR(10) NOT NULL UNIQUE,
    airline_id INT,
    origin VARCHAR(50),
    destination VARCHAR(50),
    departure DATETIME,
    arrival DATETIME,
    base_fare DECIMAL(10, 2) DEFAULT 5000.00,
    total_seats INT CHECK (total_seats >= 0),
    seats_available INT CHECK (seats_available >= 0),
    airline_name VARCHAR(50),
    flight_status VARCHAR(10) DEFAULT 'On Time' CHECK (flight_status IN ('On Time','Delayed','Cancelled')),
    FOREIGN KEY (airline_id) REFERENCES airline(airline_id)
);

INSERT INTO Flight (Flight_no, airline_id, origin, destination, departure, arrival, base_fare, total_seats, seats_available, airline_name)
VALUES 
('AI101', 1, 'Delhi', 'Mumbai', NOW() + INTERVAL 2 DAY, NOW() + INTERVAL 2 DAY + INTERVAL 2 HOUR, 5000.00, 100, 100, 'Air India'),
('AI102', 1, 'Bangalore', 'Chennai', NOW() + INTERVAL 3 DAY, NOW() + INTERVAL 3 DAY + INTERVAL 1 HOUR + INTERVAL 30 MINUTE, 4500.00, 120, 120, 'Air India Premium'),
('AI103', 2, 'Mumbai', 'Kolkata', NOW() + INTERVAL 4 DAY, NOW() + INTERVAL 4 DAY + INTERVAL 3 HOUR, 6000.00, 150, 150, 'IndiGo');


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


CREATE TABLE user (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    password VARCHAR(255),
    phone VARCHAR(15),
    role VARCHAR(10) DEFAULT 'User' CHECK (role IN ('Admin', 'User'))
);

INSERT INTO user (full_name, email, password, phone, role)
VALUES 
('Admin User', 'admin@example.com', 'admin123', '9999999999', 'Admin'),
('John Doe', 'john@example.com', 'john123', '8888888888', 'User');


CREATE TABLE dynamic_pricing (
    pricing_id INT AUTO_INCREMENT PRIMARY KEY,
    flight_id INT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    demand_factor DECIMAL(5,2),
    time_factor DECIMAL(5,2),
    seat_factor DECIMAL(5,2),
    final_fare DECIMAL(10,2),
    FOREIGN KEY (flight_id) REFERENCES Flight(Flight_id)
);

INSERT INTO dynamic_pricing (flight_id, demand_factor, time_factor, seat_factor, final_fare)
VALUES 
(1, 1.2, 1.1, 0.9, 5400.00),
(2, 1.1, 1.05, 1.0, 4700.00),
(3, 1.3, 1.2, 0.8, 6200.00);


CREATE TABLE payment (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT,
    payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    amount DECIMAL(10,2),
    payment_mode VARCHAR(20) CHECK (payment_mode IN ('CreditCard','DebitCard','UPI','Wallet')),
    payment_status VARCHAR(10) DEFAULT 'Success' CHECK (payment_status IN ('Success','Failed','Pending')),
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id)
);

INSERT INTO payment (booking_id, amount, payment_mode, payment_status)
VALUES 
(1, 5200.00, 'UPI', 'Success'),
(2, 4600.00, 'CreditCard', 'Success'),
(3, 6100.00, 'Wallet', 'Pending');


-- CREATE OR REPLACE VIEW flight_summary AS
-- SELECT 
--     f.Flight_no AS flight_number,
--     a.airline_name,
--     f.departure,
--     f.arrival,
--     f.seats_available,
--     f.base_fare,
--     f.flight_status
-- FROM Flight f
-- JOIN airline a ON f.airline_id = a.airline_id;


-- SELECT f.Flight_no, f.origin, f.destination, a.airline_name
-- FROM Flight f
-- INNER JOIN airline a ON f.airline_id = a.airline_id;

-- SELECT f.Flight_no, b.pnr, b.status
-- FROM Flight f
-- LEFT JOIN bookings b ON f.Flight_no = b.flight_no;

-- SELECT f.Flight_no, b.pnr, b.status
-- FROM Flight f
-- RIGHT JOIN bookings b ON f.Flight_no = b.flight_no;

-- SELECT f.Flight_no, b.pnr, b.status
-- FROM Flight f
-- LEFT JOIN bookings b ON f.Flight_no = b.flight_no
-- UNION
-- SELECT f.Flight_no, b.pnr, b.status
-- FROM Flight f
-- RIGHT JOIN bookings b ON f.Flight_no = b.flight_no;


-- START TRANSACTION;
-- INSERT INTO bookings (trans_id, flight_no, flight_id, passenger_fullname, passenger_contact, seat_no, pnr, status, price)
-- VALUES ('TRX200', 'AI101', 1, 'David Kumar', '9988776655', 15, 'PNR200', 'Pending', 5300.00);

-- SET @last_booking_id = LAST_INSERT_ID();

-- INSERT INTO payment (booking_id, amount, payment_mode, payment_status)
-- VALUES (@last_booking_id, 5300.00, 'UPI', 'Success');
-- COMMIT;

-- START TRANSACTION;
-- INSERT INTO bookings (trans_id, flight_no, flight_id, passenger_fullname, passenger_contact, seat_no, pnr, status, price)
-- VALUES ('TRX201', 'AI102', 2, 'Eva Thomas', '9911223344', 10, 'PNR201', 'Pending', 4600.00);

-- SET @failed_booking_id = LAST_INSERT_ID();

-- INSERT INTO payment (booking_id, amount, payment_mode, payment_status)
-- VALUES (@failed_booking_id, 4600.00, 'CreditCard', 'Failed');

-- ROLLBACK;


SELECT * FROM airports;
SELECT * FROM airline;
SELECT * FROM Flight;
SELECT * FROM passengers;
SELECT * FROM bookings;
SELECT * FROM fare_history;
SELECT * FROM user;
SELECT * FROM dynamic_pricing;
SELECT * FROM payment;
-- SELECT * FROM flight_summary;
