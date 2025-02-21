const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("LaOfiEscrow con COIN", function () {
    let owner, coworker, host, coin, escrow;
    let initialTokens;

    before(async () => {
        [owner, coworker, host] = await ethers.getSigners();

        const LaOfiCoin = await ethers.getContractFactory("LaOfiCoin");
        coin = await LaOfiCoin.deploy();
        await coin.waitForDeployment();

        const LaOfiEscrow = await ethers.getContractFactory("LaOfiEscrow");
        escrow = await LaOfiEscrow.deploy(await coin.getAddress());
        await escrow.waitForDeployment();

        initialTokens = ethers.parseEther("10000");
        await coin.mint(coworker.address, initialTokens);
    });

    it("✔️ 1. Flujo: Crear reserva", async () => {
        const amountToReserve = ethers.parseEther("1000");
        await coin.connect(coworker).approve(await escrow.getAddress(), amountToReserve);

        const startTime = (await ethers.provider.getBlock("latest")).timestamp + 60;
        const endTime = startTime + 3600;

        await escrow.connect(coworker).createReservation(host.address, startTime, endTime, amountToReserve);

        const res = await escrow.reservations(1);
        expect(res.coworker).to.equal(coworker.address);
        expect(res.host).to.equal(host.address);
        expect(res.amount).to.equal(amountToReserve);
    });

    it("✔️ 2. Flujo: Check-in", async () => {
        await ethers.provider.send("evm_increaseTime", [70]);
        await ethers.provider.send("evm_mine", []);

        await escrow.connect(coworker).checkIn(1);

        const resAfterCheckIn = await escrow.reservations(1);
        expect(resAfterCheckIn.checkedIn).to.be.true;
    });

    it("✔️ 3. Flujo: Check-out (host recibe pago)", async () => {
        const hostBalanceBefore = await coin.balanceOf(host.address);

        await escrow.connect(coworker).checkOut(1);

        const hostBalanceAfter = await coin.balanceOf(host.address);
        expect(BigInt(hostBalanceAfter) - BigInt(hostBalanceBefore)).to.equal(ethers.parseEther("1000"));

        const resAfterCheckOut = await escrow.reservations(1);
        expect(resAfterCheckOut.checkedOut).to.be.true;
    });

    it("✔️ 4. Validación: No se puede hacer check-out sin check-in", async () => {
        const amountToReserve = ethers.parseEther("500");
        await coin.connect(coworker).approve(await escrow.getAddress(), amountToReserve);

        const startTime = (await ethers.provider.getBlock("latest")).timestamp + 60;
        const endTime = startTime + 3600;

        await escrow.connect(coworker).createReservation(host.address, startTime, endTime, amountToReserve);

        await expect(escrow.connect(coworker).checkOut(2)).to.be.revertedWith("Debe hacer check-in primero");
    });
});
