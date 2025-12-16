const contractAddress = "0xb5E8ab8c3e222e81E9948bE90b1a447B624DEF4F";
const contractABI = [ "function donate() external payable", 
  "function getDonationCount() external view returns (uint)",
  "getDonations() external view returns (Donation[] memory)", 
  "function withdraw() external onlyOwner", 
  "function isFundingEnded() external view returns (bool)" ];

let web3;
let contract;
let accounts;

document.getElementById('connectBtn').onclick = async () => {
    if (window.ethereum) {
        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            web3 = new Web3(window.ethereum);
            accounts = await web3.eth.getAccounts();
            document.getElementById('app').style.display = 'block';
            document.getElementById('connectBtn').style.display = 'none';
            initContract();
            loadProjects();
        } catch (error) {
            alert('Ошибка при подключении MetaMask');
            console.error(error);
        }
    } else {
        alert('Пожалуйста, установите MetaMask');
    }
};

function initContract() {
    contract = new web3.eth.Contract(contractABI, contractAddress);
}

// Функция для создания проекта
document.getElementById('createProjectBtn').onclick = async () => {
    const name = document.getElementById('projectName').value;
    const goalEth = document.getElementById('goalAmount').value;
    const goalWei = web3.utils.toWei(goalEth, 'ether');

    try {
        await contract.methods.createProject(name, goalWei).send({ from: accounts[0] });
        alert('Проект создан!');
        loadProjects();
    } catch (err) {
        alert('Ошибка при создании проекта');
        console.error(err);
    }
};

// Загрузка и отображение проектов
async function loadProjects() {
    const projectsCount = await contract.methods.projectsCount().call();
    const projectsDiv = document.getElementById('projectsList');
    projectsDiv.innerHTML = '';

    for (let i = 1; i <= projectsCount; i++) {
        const project = await contract.methods.projects(i).call();
        const projectDiv = document.createElement('div');
        projectDiv.className = 'project';

        // Данные проекта
        projectDiv.innerHTML = `
            <h3>${project.name}</h3>
            <p>Цель: ${web3.utils.fromWei(project.goal, 'ether')} ETH</p>
            <p>Собрано: ${web3.utils.fromWei(project.amountRaised, 'ether')} ETH</p>
            <button onclick="donate(${project.id})">Пожертвовать</button>
        `;
        projectsDiv.appendChild(projectDiv);
    }
}

// Функция для пожертвования
async function donate(projectId) {
    const amountEth = prompt('Введите сумму пожертвования в ETH');
    if (!amountEth) return;
    const amountWei = web3.utils.toWei(amountEth, 'ether');

    try {
        await contract.methods.donate(projectId).send({ from: accounts[0], value: amountWei });
        alert('Пожертвование отправлено!');
        loadProjects();
    } catch (err) {
        alert('Ошибка при пожертвовании');
        console.error(err);
    }
}