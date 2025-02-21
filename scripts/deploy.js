const hre = require("hardhat");

async function main() {
    const LaOfiCoin = await hre.ethers.getContractFactory("LaOfiCoin");
    const coin = await LaOfiCoin.deploy();
    await coin.waitForDeployment();
    console.log("LaOfiCoin deployed at:", coin.target);

    const LaOfiEscrow = await hre.ethers.getContractFactory("LaOfiEscrow");
    const escrow = await LaOfiEscrow.deploy(await coin.getAddress());
    await escrow.waitForDeployment();
    console.log("LaOfiEscrow deployed at:", escrow.target);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
