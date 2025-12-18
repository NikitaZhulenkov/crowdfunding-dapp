const contractAddress = "0xb5E8ab8c3e222e81E9948bE90b1a447B624DEF4F";
const abi = [
    "function donate() external payable", 
    "function getDonationCount() external view returns (uint)",
    "getDonations() external view returns (Donation[] memory)", 
    "function withdraw() external onlyOwner", 
    "function isFundingEnded() external view returns (bool)", 
    
    {
        "inputs": [
            { "internalType": "string", "name": "_projectName", "type": "string" },
            { "internalType": "uint256", "name": "_goal", "type": "uint256" },
            { "internalType": "uint256", "name": "_durationInDays", "type": "uint256" }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "inputs": [],
        "name": "owner",
        "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "projectName",
        "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "goal",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "totalDonated",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "deadline",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "donate",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getDonationCount",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getDonations",
        "outputs": [{ "internalType": "struct Crowdfunding.Donation[]", "name": "", "type": "tuple[]"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "withdraw",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "isFundingEnded",
        "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
        "stateMutability": "view",
        "type": "function"
    }
];

let provider;
let signer;
let contract;

async function init() {
    if (window.ethereum) {
        provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        signer = provider.getSigner();
        contract = new ethers.Contract(contractAddress, abi, signer);
        loadProjectInfo();
    } else {
        alert("Пожалуйста, установите MetaMask!");
    }
}

async function loadProjectInfo() {
    try {
        const name = await contract.projectName();
        const goalWei = await contract.goal();
        const totalWei = await contract.totalDonated();
        const deadlineTimestamp = await contract.deadline();

        document.getElementById("projectName").innerText = name;
        document.getElementById("goal").innerText = ethers.utils.formatEther(goalWei) + " ETH";
        document.getElementById("totalDonated").innerText = ethers.utils.formatEther(totalWei) + " ETH";

        const deadlineDate = new Date(deadlineTimestamp.toNumber() * 1000);
        document.getElementById("deadline").innerText = deadlineDate.toLocaleString();

    } catch (error) {
        console.error(error);
        alert("Ошибка при загрузке информации о проекте");
    }
}

document.getElementById("loadInfo").addEventListener("click", loadProjectInfo);

document.getElementById("donateBtn").addEventListener("click", async () => {
    const amountInput = document.getElementById("donationAmount").value;
    const amountInEther = amountInput.trim();

    if (!amountInEther || isNaN(amountInEther) || Number(amountInEther) <= 0) {
        alert("Пожалуйста, введите правильную сумму ETH");
        return;
    }

    try {
        const tx = await contract.donate({ value: ethers.utils.parseEther(amountInEther) });
        document.getElementById("donationStatus").innerText = "Пожертвование отправлено, ожидайте подтверждения...";
        await tx.wait();
        document.getElementById("donationStatus").innerText = "Пожертвование успешно!";
        loadProjectInfo();
    } catch (error) {
        console.error(error);
        document.getElementById("donationStatus").innerText = "Ошибка при отправке пожертвования.";
    }
});

document.getElementById("withdrawBtn").addEventListener("click", async () => {
    try {
        const tx = await contract.withdraw();
        document.getElementById("withdrawStatus").innerText = "Запрос на вывод отправлен, ожидайте подтверждения...";
        await tx.wait();
        document.getElementById("withdrawStatus").innerText = "Средства успешно выведены!";
    } catch (error) {
        console.error(error);
        document.getElementById("withdrawStatus").innerText = "Ошибка при выводе средств.";
    }
});

window.addEventListener("load", init); 
