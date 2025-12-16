window.addEventListener("DOMContentLoaded", () => {
  const contractAddress = "0xb5E8ab8c3e222e81E9948bE90b1a447B624DEF4F";
  const abi = [ "function donate() external payable", 
  "function getDonationCount() external view returns (uint)",
  "getDonations() external view returns (Donation[] memory)", 
  "function withdraw() external onlyOwner", 
  "function isFundingEnded() external view returns (bool)" ];

  // Элементы DOM
  const connectBtn = document.getElementById("connectBtn");
  const fundBtn = document.getElementById("fundBtn");
  const withdrawBtn = document.getElementById("withdrawBtn");
  const refundBtn = document.getElementById("refundBtn");
  const projectNameEl = document.getElementById("projectName");
  const descriptionEl = document.getElementById("description");
  const goalEl = document.getElementById("goal");
  const totalFundsEl = document.getElementById("totalFunds");
  const ownerEl = document.getElementById("owner");
  const amountInput = document.getElementById("amount");
  const progressBar = document.getElementById("progress");
  const donationsList = document.getElementById("donationsList");

  let provider, signer, contract;

  // Обработчик подключения
  connectBtn.onclick = async () => {
    if (!window.ethereum) {
      alert("Пожалуйста, установите MetaMask!");
      return;
    }
    try {
      provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      signer = await provider.getSigner();
      contract = new ethers.Contract(contractAddress, abi, signer);
      
      const account = await signer.getAddress();
      connectBtn.innerText = `Подключено: ${account.slice(0,6)}...`;
      
      await loadContractData();
    } catch (error) {
      console.error(error);
      alert("Ошибка подключения: " + error.message);
    }
  };

  // Загрузка данных контракта
  async function loadContractData() {
    if (!contract) return;

    try {
      const name = await contract.projectName();
      const description = await contract.description();
      const goalWei = await contract.goal();
      const totalWei = await contract.totalFunds();
      const owner = await contract.owner();

      projectNameEl.textContent = name;
      descriptionEl.textContent = description;
      goalEl.textContent = ethers.formatEther(goalWei);
      totalFundsEl.textContent = ethers.formatEther(totalWei);
      ownerEl.textContent = owner;

      // Обновление прогресс-бара
      const totalETH = Number(ethers.formatEther(totalWei));
      const goalETH = Number(ethers.formatEther(goalWei));
      const progressPercent = Math.min(100, (totalETH / goalETH) * 100);
      progressBar.style.width = `${progressPercent}%`;

      // Обновление истории пожертвований
      donationsList.innerHTML = "";
      const donorCount = await contract.donorCount();
      for (let i = 0; i < donorCount; i++) {
        const donorData = await contract.donors(i);
        if (Number(donorData.amount) > 0) {
          const listItem = document.createElement("li");
          listItem.textContent = `${donorData.donor}: ${ethers.formatEther(donorData.amount)} ETH`;
          donationsList.appendChild(listItem);
        }
      }
    } catch (err) {
      console.error("Ошибка при загрузке данных:", err);
    }
  }

  // Обработка пожертвования
  fundBtn.onclick = async () => {
    if (!contract) {
      alert("Пожалуйста, подключитесь к MetaMask");
      return;
    }
    const amountETH = amountInput.value.trim();
    if (!amountETH || isNaN(amountETH) || Number(amountETH) <= 0) {
      alert("Введите корректное количество ETH");
      return;
    }
    try {
      const tx = await contract.fund({ value: ethers.parseEther(amountETH) });
      await tx.wait();
      await loadContractData();
    } catch (err) {
      console.error("Ошибка при пожертвовании:", err);
      alert("Ошибка при пожертвовании: " + err.message);
    }
  };

  // Вывод средств (только владелец)
  withdrawBtn.onclick = async () => {
    if (!contract) {
      alert("Пожалуйста, подключитесь к MetaMask");
      return;
    }
    try {
      const tx = await contract.withdraw();
      await tx.wait();
      await loadContractData();
    } catch (err) {
      console.error("Ошибка при выводе:", err);
      alert("Ошибка при выводе: " + err.message);
    }
  };

  // Возврат средств, если цель не достигнута
  refundBtn.onclick = async () => {
    if (!contract) {
      alert("Пожалуйста, подключитесь к MetaMask");
      return;
    }
    try {
      const tx = await contract.refund();
      await tx.wait();
      await loadContractData();
    } catch (err) {
      console.error("Ошибка при возврате:", err);
      alert("Ошибка при возврате: " + err.message);
    }
  };
});