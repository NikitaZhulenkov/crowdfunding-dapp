let provider;
let signer;
let contract;
let contractAddress = null;

const abi = [
  "function owner() view returns (address)",
  "function projectName() view returns (string memory)",
  "function goal() view returns (uint)",
  "function deadline() view returns (uint)",
  "function totalDonated() view returns (uint)",
  "function donate() external payable",
  "function getDonationCount() external view returns (uint)",
  "function getDonations() external view returns (tuple(address donor, uint amount, uint timestamp)[])",
  "function withdraw() external",
  "function isFundingEnded() external view returns (bool)"
];

const connectBtn = document.getElementById('connectBtn');
const deployBtn = document.getElementById('deployBtn');
const loadInfoBtn = document.getElementById('loadInfo');
const loadDonationsBtn = document.getElementById('loadDonations');
const donateBtn = document.getElementById('donateBtn');
const checkEndedBtn = document.getElementById('checkEnded');

const statusDiv = document.getElementById('status');
const contractAddressP = document.getElementById('contractAddress');

const projectNameSpan = document.getElementById('projectName');
const goalInput = document.getElementById('goal');
const deadlineSpan = document.getElementById('deadline');
const totalDonatedSpan = document.getElementById('totalDonated');
const donationsList = document.getElementById('donationsList');
const endedStatusP = document.getElementById('endedStatus');

let crowdfundingContract = null;

async function connect() {
    if (window.ethereum) {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        provider = new ethers.providers.Web3Provider(window.ethereum);
        signer = provider.getSigner();
        statusDiv.innerText = 'Подключено к кошельку.';
    } else {
        alert('Пожалуйста, установите MetaMask');
    }
}

async function deployContract() {
    if (!signer) {
        alert('Сначала подключите кошелек');
        return;
    }
    const Factory = new ethers.ContractFactory(
        ["constructor(string memory _projectName, uint _goal, uint _durationInDays)", ...abi],
        // В вашем случае, нужно указать байткод контракта, который вы деплоили
        // Для этого нужно скомпилировать контракт и взять байткод
        // Для примера используем заглушку, т.к. байткод требуется
        "" // замените на реальный байткод
    );

    const projectName = prompt('Введите название проекта', 'Мой проект');
    const goalEther = prompt('Введите цель в ETH', '10');
    const durationDays = prompt('Введите продолжительность в днях', '30');

    // В этом примере оставим байткод пустым, чтобы не было ошибок
    // Реально нужно вставить байткод скомпилированного контракта
    alert('Для деплоя нужен байткод. В этом примере деплой пропущен.');

    // Можно реализовать реальный деплой при наличии байткода
}

async function loadContract() {
    if (!contractAddress) {
        alert('Сначала деплойте контракт или вставьте адрес');
        return;
    }
    contract = new ethers.Contract(contractAddress, abi, signer);
    statusDiv.innerText = 'Контракт загружен.';
}

async function loadExistingContract() {
    const address = prompt('Введите адрес контракта');
    if (address) {
        contractAddress = address;
        await loadContract();
    }
}

async function loadInfo() {
    if (!contract) {
        alert('Контракт не загружен');
        return;
    }
    try {
        const name = await contract.projectName();
        const goalWei = await contract.goal();
        const deadlineTimestamp = await contract.deadline();
        const totalWei = await contract.totalDonated();

        projectNameSpan.innerText = name;
        goalInput.value = ethers.utils.formatEther(goalWei);
        deadlineSpan.innerText = new Date(deadlineTimestamp.toNumber() * 1000).toLocaleString();
        totalDonatedSpan.innerText = ethers.utils.formatEther(totalWei);
    } catch (err) {
        console.error(err);
        alert('Ошибка при загрузке информации');
    }
}

async function loadDonations() {
    if (!contract) {
        alert('Контракт не загружен');
        return;
    }
    try {
        const donations = await contract.getDonations();
        donationsList.innerHTML = '';
        donations.forEach(d => {
            const li = document.createElement('li');
            li.innerText = `Донор: ${d.donor}, Сумма: ${ethers.utils.formatEther(d.amount)} ETH, Время: ${new Date(d.timestamp.toNumber() * 1000).toLocaleString()}`;
            donationsList.appendChild(li);
        });
    } catch (err) {
        console.error(err);
        alert('Ошибка при загрузке донатов');
    }
}

async function donate() {
    if (!contract) {
        alert('Контракт не загружен');
        return;
    }
    const amountEth = document.getElementById('donateAmount').value;
    if (!amountEth || isNaN(amountEth) || amountEth <= 0) {
        alert('Введите корректную сумму');
        return;
    }
    try {
        const tx = await contract.donate({ value: ethers.utils.parseEther(amountEth) });
        await tx.wait();
        alert('Пожертвование успешно!');
        loadInfo();
        loadDonations();
    } catch (err) {
        console.error(err);
        alert('Ошибка при пожертвовании');
    }
}

async function checkEnded() {
    if (!contract) {
        alert('Контракт не загружен');
        return;
    }
    try {
        const ended = await contract.isFundingEnded();
        endedStatusP.innerText = ended ? 'Финансирование завершено' : 'Финансирование продолжается';
    } catch (err) {
        console.error(err);
        alert('Ошибка при проверке статуса');
    }
}

// Обработчики
connectBtn.onclick = connect;
document.getElementById('deployBtn').onclick = deployContract;
loadInfoBtn.onclick = loadInfo;
loadDonationsBtn.onclick = loadDonations;
donateBtn.onclick = donate;
checkEndedBtn.onclick = checkEnded;

// Для удобства можно автоматически подключать кошелек
// connect();