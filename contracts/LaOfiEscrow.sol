// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./LaOfiCoin.sol";

/**
 * @title LaOfiEscrow
 * @dev Manejo de reservas, pagos y disputas en tokens COIN (LaOfiCoin).
 */
contract LaOfiEscrow {
    LaOfiCoin public coinToken;
    address public admin;

    struct Reservation {
        address coworker;
        address host;
        uint256 amount;
        uint256 startTime;
        uint256 endTime;
        bool checkedIn;
        bool checkedOut;
    }

    uint256 public reservationCount;
    mapping(uint256 => Reservation) public reservations;

    event ReservationCreated(uint256 indexed reservationId, address coworker, address host, uint256 amount);
    event CheckIn(uint256 indexed reservationId);
    event CheckOut(uint256 indexed reservationId);

    constructor(address _coinTokenAddress) {
        admin = msg.sender;
        coinToken = LaOfiCoin(_coinTokenAddress);
    }

    function createReservation(
        address _host,
        uint256 _startTime,
        uint256 _endTime,
        uint256 _amount
    ) external {
        require(_amount > 0, "Cantidad de tokens debe ser mayor a 0");
        require(_host != address(0), "Host no valido");
        require(_startTime < _endTime, "Tiempo de reserva invalido");

        bool success = coinToken.transferFrom(msg.sender, address(this), _amount);
        require(success, "Fallo en transferencia de tokens");

        reservationCount++;
        reservations[reservationCount] = Reservation(msg.sender, _host, _amount, _startTime, _endTime, false, false);

        emit ReservationCreated(reservationCount, msg.sender, _host, _amount);
    }

    function checkIn(uint256 _reservationId) external {
        Reservation storage res = reservations[_reservationId];
        require(msg.sender == res.coworker, "Solo coworker puede check-in");
        require(block.timestamp >= res.startTime, "Aun no inicia la reserva");
        require(!res.checkedIn, "Ya se hizo check-in");

        res.checkedIn = true;
        emit CheckIn(_reservationId);
    }

    function checkOut(uint256 _reservationId) external {
        Reservation storage res = reservations[_reservationId];
        require(msg.sender == res.coworker, "Solo coworker puede check-out");
        require(res.checkedIn, "Debe hacer check-in primero");
        require(!res.checkedOut, "Ya se hizo check-out");

        res.checkedOut = true;
        bool success = coinToken.transfer(res.host, res.amount);
        require(success, "Fallo en transferencia al host");

        emit CheckOut(_reservationId);
    }
}
