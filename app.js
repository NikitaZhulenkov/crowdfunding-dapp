const contractAddress = '0xb5E8ab8c3e222e81E9948bE90b1a447B624DEF4F'; 
const contractABI = [ "function donate() external payable", 
  "function getDonationCount() external view returns (uint)",
  "getDonations() external view returns (Donation[] memory)", 
  "function withdraw() external onlyOwner", 
  "function isFundingEnded() external view returns (bool)" ];

let web3;
let contract;
let account;

const connectBtn = document.getElementById('connectBtn');
const statusDiv = document.getElementById('status');
const goalSpan = document.getElementById('goal');
const raisedSpan = document.getElementById('raised');
const fundBtn = document.getElementById('fundBtn');
const claimBtn = document.getElementById('claimBtn');
const amountInput = document.getElementById('amount');

connectBtn.onclick = async () => {
  if (window.ethereum) {
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      web3 = new Web3(window.ethereum);
      const accounts = await web3.eth.getAccounts();
      account = accounts[0];
      statusDiv.innerText = 'Подключено: ' + account;
      
      contract = new web3.eth.Contract(contractABI, contractAddress);
      
      await loadFundingInfo();
      
      document.querySelector('.owner-actions').style.display = 'block';
      
    } catch (err) {
      console.error(err);
      statusDiv.innerText = 'Ошибка подключения';
    }
  } else {
    alert('Пожалуйста, установите MetaMask');
  }
};

async function loadFundingInfo() {
  try {
    const goalWei = await contract.methods.getFundingGoal().call();
    const raisedWei = await contract.methods.getRaisedAmount().call();
    goalSpan.innerText = web3.utils.fromWei(goalWei, 'ether');
    raisedSpan.innerText = web3.utils.fromWei(raisedWei, 'ether');
  } catch (err) {
    console.error('Ошибка загрузки данных:', err);
  }
}

fundBtn.onclick = async () => {
  const amountEth = amountInput.value;
  if (!amountEth || isNaN(amountEth)) {
    alert('Введите корректную сумму ETH');
    return;
  }
  try {
    await contract.methods.fund().send({
      from: account,
      value: web3.utils.toWei(amountEth, 'ether')
    });
    alert('Пожертвование успешно!');
    await loadFundingInfo();
  } catch (err) {
    console.error('Ошибка при пожертвовании:', err);
    alert('Ошибка при выполнении транзакции');
  }
};

claimBtn.onclick = async () => {
  try {
    await contract.methods.claimFunds().send({ from: account });
    alert('Средства выведены!');
    await loadFundingInfo();
  } catch (err) {
    console.error('Ошибка при выводе средств:', err);
    alert('Ошибка при выводе средств');
  }
};