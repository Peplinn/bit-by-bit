

CREATE TABLE Patterns (
    pattern_id int PRIMARY KEY,
    route_id int NOT NULL,
    route_name varchar(255) NOT NULL,
    route_code int NOT NULL,
    head_sign varchar(255),
    direction_name varchar(255),
    colour varchar(255)
);

CREATE TABLE Positions (
    vehicle_id int NOT NULL,
    pattern_id int NOT NULL,
    velocity int,
    bearing int,
    lat double precision NOT NULL,
    lng double precision NOT NULL,
    last_update timestamptz NOT NULL,
    last_polled timestamptz NOT NULL,
    PRIMARY KEY(vehicle_id, last_update),

    CONSTRAINT bus_possesses_pattern
    FOREIGN KEY (pattern_id) REFERENCES Routes (pattern_id)
);