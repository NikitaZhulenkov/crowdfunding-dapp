const contractAddress = "0xb5E8ab8c3e222e81E9948bE90b1a447B624DEF4F";
const abi = [
  {
    "inputs": [
      {"internalType": "string", "name": "_projectName", "type": "string"},
      {"internalType": "uint256", "name": "_goal", "type": "uint256"},
      {"internalType": "uint256", "name": "_durationInDays", "type": "uint256"}
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "goal",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalDonated",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getDonationCount",
    "outputs": [{"internalType": "uint", "name": "", "type": "uint"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getDonations",
    "outputs": [{"internalType": "struct Crowdfunding.Donation[]", "name": "", "type": "tuple[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "isFundingEnded",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "deadline",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "projectName",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "donate",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  }
];

let provider;
let signer;
let contract; 

const connectButton = document.getElementById('connectButton'); 
const donateButton = document.getElementById('donateButton'); 
const refreshButton = document.getElementById('refreshButton'); 

const projectNameElem = document.getElementById('projectName'); 
const goalElem = document.getElementById('goal'); 
const totalDonatedElem = document.getElementById('totalDonated'); 
const deadlineElem = document.getElementById('deadline'); 
const donationList = document.getElementById('donationList'); 
const projectInfoDiv = document.getElementById('projectInfo');

async function init() {
    if (typeof window.ethereum !== 'underfined') {
        provider = new ethers.providers.Web3Provider(window.ethereum);
        connectButton.onclick = connectWallet;
        donateButton.onclick = donate;
        refreshButton.onclick = fetchDonations;
    } else {
        alert("Пожалуйста, установите MetaMask!");
    }
}

async function connectWallet() { 
    try { 
        await provider.send("eth_requestAccounts", []); 
        signer = provider.getSigner(); 
        contract = new ethers.Contract(contractAddress, abi, signer); 
        document.getElementById('connection').style.display = 'none'; 
        projectInfoDiv.style.display = 'block'; 

        await loadProjectInfo(); 
        await fetchDonations(); 
    } catch (error) { 
        console.error(error); 
        alert('Ошибка при подключении кошелька');
    }
}

async function loadProjectInfo() {
    const name = await contract.projectName(); 
    const goalWei = await contract.goal(); 
    const totalWei = await contract.totalDonated(); 
    const deadlineTimestamp = await contract.deadline(); 

    const goalEth = ethers.utils.formatEther(goalWei); 
    const totalEth = ethers.utils.formatEther(totalWei); 
    const deadlineDate = new Date(deadlineTimestamp.toNumber() * 1000).toLocaleString(); 

    projectNameElem.textContent = name; 
    goalElem.textContent = goalEth; 
    totalDonatedElem.textContent = totalEth; 
    deadlineElem.textContent = deadlineDate;
}

async function fetchDonations() {
    try {
        const count = await contract.getDonationCount();
        const donations = await contract.getDonations();

        donationList.innerHTML = '';

        donations.forEach(d => {
            const li = document.createElement('li');
            const date = new Date(d.timestamp * 1000).toLocaleString();
            li.textContent = `Донор: ${d.donor} | Сумма: ${ethers.utils.formatEther(d.amount)} ETH | Время: ${date}`;
            donationList.appendChild(li);
        });
    } catch (err) {
        console.error(err);
        alert('Ошибка при получении донатов');
    }
}

async function donate() {
    try {
        const tx = await contract.donate({ value: ethers.utils.parseEther('1') });
        await tx.wait();
        alert('Спасибо за донат!');
        await fetchDonations();
        await loadProjectInfo();
    } catch (err) {
        console.error(err);
        alert('Ошибка при донате');
    }
}

window.onload = init;
