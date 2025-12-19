const CONTRACT_ADDRESS = '0xb5E8ab8c3e222e81E9948bE90b1a447B624DEF4F'; 
const ABI = [
    "function projectName() view returns (string)",
    "function goal() view returns (uint)",
    "function totalDonated() view returns (uint)",
    "function getDonationCount() view returns (uint)",
    "function donate() payable", 
    "function getDonationCount() external view returns (uint)",
    "function getDonations() external view returns (Donation[] memory)", 
    "function withdraw() external onlyOwner", 
    "function isFundingEnded() external view returns (bool)"
];

let web3;
let account;
let contract;

document.getElementById('connectBtn').onclick = async () => {
  if (window.ethereum) {
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      web3 = new Web3(window.ethereum);
      const accounts = await web3.eth.getAccounts();
      account = accounts[0];
      document.getElementById('accountInfo').innerText = 'Подключено: ' + account;
      
      contract = new web3.eth.Contract(ABI, CONTRACT_ADDRESS);
      
      await loadProjectInfo();
    } catch (err) {
      alert('Ошибка подключения MetaMask');
      console.error(err);
    }
  } else {
    alert('Пожалуйста, установите MetaMask!');
  }
};

async function loadProjectInfo() {
  const projectName = await contract.methods.projectName().call();
  const goal = await contract.methods.goal().call();
  const totalDonated = await contract.methods.totalDonated().call();
  const deadline = await contract.methods.deadline().call();

  document.getElementById('projectName').innerText = projectName;
  document.getElementById('goal').innerText = web3.utils.fromWei(goal, 'ether') + ' ETH';
  document.getElementById('totalDonated').innerText = web3.utils.fromWei(totalDonated, 'ether') + ' ETH';
  
  const deadlineDate = new Date(parseInt(deadline) * 1000);
  document.getElementById('deadline').innerText = deadlineDate.toLocaleString();
}

document.getElementById('donateBtn').onclick = async () => {
  const amountEth = document.getElementById('donationAmount').value;
  if (!amountEth || isNaN(amountEth)) {
    alert('Введите корректную сумму ETH');
    return;
  }

  const amountWei = web3.utils.toWei(amountEth, 'ether');

  try {
    await contract.methods.donate().send({
      from: account,
      value: amountWei
    });
    alert('Пожертвование успешно!');
    await loadProjectInfo();
  } catch (err) {
    alert('Ошибка при пожертвовании');
    console.error(err);
  }
};

document.getElementById('loadDonationsBtn').onclick = async () => {
  try {
    const donationsCount = await contract.methods.getDonationCount().call();
    const donationsList = document.getElementById('donationsList');
    donationsList.innerHTML = '';

    for (let i = 0; i < donationsCount; i++) {
      const donation = await contract.methods.getDonations().call({ from: account });
    }

    const allDonations = await contract.methods.getDonations().call();

    allDonations.forEach((donation, index) => {
      const date = new Date(parseInt(donation.timestamp) * 1000).toLocaleString();
      const amountEth = web3.utils.fromWei(donation.amount, 'ether');
      const listItem = document.createElement('li');
      listItem.innerText = `Donor: ${donation.donor}, Amount: ${amountEth} ETH, Date: ${date}`;
      donationsList.appendChild(listItem);
    });
  } catch (err) {
    alert('Ошибка загрузки списка');
    console.error(err);
  }
}; 
