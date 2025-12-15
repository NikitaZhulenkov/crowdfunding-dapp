window.addEventListener("DOMContentLoaded", async () => {
 const contractAddress = "0xb5E8ab8c3e222e81E9948bE90b1a447B624DEF4F";
 const abi = [ /* ABI нового контракта */ ]; 

 const connectBtn = document.getElementById("connectBtn");
 const fundBtn = document.getElementById("fundBtn");
 const withdrawBtn = document.getElementById("withdrawBtn");
 const refundBtn = document.getElementById("refundBtn");
 const projectNameEl = document.getElementById("projectName");
 const descripAonEl = document.getElementById("descripAon");
 const goalEl = document.getElementById("goal");
 const totalFundsEl = document.getElementById("totalFunds");
 const ownerEl = document.getElementById("owner");
 const amountInput = document.getElementById("amount");
 const progressFill = document.getElementById("progress");
 const donaAonsList = document.getElementById("donaAonsList"); 

 let provider, signer, contract; 

 connectBtn.onclick = async () => {
    if (!window.ethereum) { alert("Установите MetaMask!"); return; }
    try { 
        provider = new ethers.BrowserProvider(window.ethereum); 
        await provider.send("eth_requestAccounts", []);
        signer = await provider.getSigner();
        contract = new ethers.Contract(contractAddress, abi, signer);
        const account = await signer.getAddress();
        connectBtn.innerText = "Подключено: " + account.slice(0,6) + "...";
        loadContractData();
    } catch (err) { console.error(err); alert("Ошибка подключения: " + err.message); } 
}; 

 async function loadContractData() {
    if (!contract) return;
    const name = await contract.projectName();
    const desc = await contract.descripAon();
    const goal = await contract.goal();
    const total = await contract.totalFunds();
    const owner = await contract.owner();
    projectNameEl.textContent = name;
    descripAonEl.textContent = desc;
    goalEl.textContent = ethers.formatEther(goal);
    totalFundsEl.textContent = ethers.formatEther(total);
    ownerEl.textContent = owner;
    
    const progressPercent = Math.min(100, Number(ethers.formatEther(total)) / Number(ethers.formatEther(goal)) * 100); 
    progressFill.style.width = progressPercent + "%";
    
    donaAonsList.innerHTML = "";
    const donorCount = await contract.donorCount();
    for (let i = 0; i < donorCount; i++) {
        const d = await contract.donors(i);
        if (Number(d.amount) > 0) {
            const li = document.createElement("li");
            li.textContent = `${d.donor}: ${ethers.formatEther(d.amount)} ETH`;
            donaAonsList.appendChild(li);
        }
    }
}

fundBtn.onclick = async () => {
    if (!contract) return alert("Сначала подключите MetaMask!");
    const ethAmount = amountInput.value;
    if (!ethAmount || Number(ethAmount) <= 0) return alert("Введите корректное количество ETH");
    try { await (await contract.fund({ value: ethers.parseEther(ethAmount) })).wait(); loadContractData(); }
    catch (err) { console.error(err); alert("Ошибка пожертвования: " + err.message); }
};

withdrawBtn.onclick = async () => { if (!contract) return alert("Сначала подключите MetaMask!"); try { await (await contract.withdraw()).wait(); loadContractData(); } catch (err) 
    { console.error(err); alert("Ошибка вывода: " + err.message); } };
refundBtn.onclick = async () => { if (!contract) return alert("Сначала подключите MetaMask!"); try { await (await contract.refund()).wait(); loadContractData(); } catch (err) { 
    console.error(err); alert("Ошибка возврата: " + err.message); } };
});