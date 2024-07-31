<template>

<div class="col d-lg-flex justify-content-lg-center">

  <div v-if="isMetaMaskInstalled">
      </div>
      <div v-else>
     
        <div><a href="#" class="btn btn-primary bt-md" v-on:click="startOnboarding()" >Metamask is not installed. Please click here to install it.</a></div>
      </div>

      <!--Wrong Network Message-->
      <div v-if="!isValidNetwork && isLoggedIn">
        <h3>Wrong network</h3>
        <p>Please, add and connect the to {{this.ethConfig.name}}.</p>
        <div class="btn-group" role="group" aria-label="Basic example">
          <button class="btn btn-sm btn-primary" v-on:click="addChain()"> Connect to {{this.ethConfig.name}}</button>
          <button class="btn btn-sm btn-secondary" v-on:click="disconnect()"> Disconnect</button>

        </div>
      </div>
</div>
<br>

<div class="col d-lg-flex justify-content-lg-center">
    <h3>Request your IOTA from the official <a target=blank href="https://evm-toolkit.evm.testnet.iotaledger.net/">IOTA faucet</a></h3>
    
</div>
<br>
<br>

   
  <div class="col d-lg-flex justify-content-lg-center">
  
        <form id="form-tkn-trans">
          <div class="form-block">
            <h3>Wallet Address</h3>
           
            <input
              class="form-control"
              type="text"
              data-bss-hover-animate="pulse"
              id="metamask-address"
              placeholder=" Your Metamask Address"
              name="metamask-address"
              required=""
              readonly
              v-model="metaMaskAddress"
              
            />
          </div>
          <div class="form-block">
            <h3><strong>Token to Transfer</strong></h3>
            <p>
              Select the token, add it to your Metamask wallet, insert how much
              you want to transfer, and click "SEND TOKEN".
            </p>
            <div
              class="row d-sm-flex flex-column justify-content-sm-center align-items-sm-center"
              id="row-tkn-transf"
            >
              <div
                class="col d-flex justify-content-center"
                id="col-sel-token"
                style="background: rgba(116,93,134,0);"
              >
                <select
                  class="form-select"
                  required=""
                  style="margin-right: 24px;"
                  v-model="selectedToken"
                  ><optgroup label="Token"
                    >
                     
                     <option value="wIOTA">wIOTA</option>
                      <option value="FLS">FLS</option>
                      <option value="wFLS">wFLS</option>
                    <option value="wDAI">wDAI</option
                    ><option value="FUSDT" selected="">FUSDT</option
                    ><option value="FUSDC">FUSDC</option>
                    ><option value="wBTC" selected="">wBTC</option
                    ><option value="wETH">wETH</option
                    >
                    </optgroup
                  ></select> 
                <button :disabled="!isLoggedIn"
                  class="btn btn-primary d-flex d-xxl-flex align-items-center align-items-xxl-center"
                  data-bs-toggle="tooltip"
                  data-bss-tooltip=""
                  id="btn-add-tkn"
                  type="button"
                  title="Add the selected token to your Metamask wallet"
                  @click="addToken"
                >
                  +&nbsp;<svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="1em"
                    height="1em"
                    viewBox="0 0 24 24"
                    stroke-width="2"
                    stroke="currentColor"
                    fill="none"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="icon icon-tabler icon-tabler-wallet"
                    style="font-size: 28px;font-weight: bold;"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                    <path
                      d="M17 8v-3a1 1 0 0 0 -1 -1h-10a2 2 0 0 0 0 4h12a1 1 0 0 1 1 1v3m0 4v3a1 1 0 0 1 -1 1h-12a2 2 0 0 1 -2 -2v-12"
                    ></path>
                    <path d="M20 12v4h-4a2 2 0 0 1 0 -4h4"></path>
                  </svg>
                </button>
              </div>
              <div class="col" id="col-qty-input">
                <input
                  class="form-control"
                  type="number"
                  data-bss-hover-animate="pulse"
                  id="form-qty-input"
                  placeholder="How much do you want to send?"
                  v-model="tokenAmount"
                  required
                />
              </div>
            </div>
          </div>
          <div
            class="d-flex d-md-flex d-xl-flex justify-content-center justify-content-md-center justify-content-xl-center"
          >
            <button :disabled="!isSendEnabled" class="btn btn-primary" id="btn-send" type="button" @click="handleTokenRequest">
              SEND TOKEN
            </button>
          </div>
        </form>
      </div>
</template>

<script>
  //State from Vuex -> https://vuex.vuejs.org/
  import { mapState } from 'vuex'
  //Ethers - library for interacting with the Ethereum Blockchain and its ecosystem
  import { ethers } from "ethers";
  // Detect ethereum provider utility
  import detectEthereumProvider from '@metamask/detect-provider'
  //Notifications
  import { useToast } from "vue-toastification";
  //Onboarding for Metamask
  import MetaMaskOnboarding from '@metamask/onboarding';
  //Some of this will be moved to a .env
  import isOnline from 'is-online';

  //Import data
  import {
    NETWORKS
  } from '@/constants/networks.js'

  export default {
    name: 'bridge',
    data: function () {
      return {
        "isMetaMaskInstalled": false,
         metaMaskAddress: "",
        selectedToken: 'wFLS',
        FLSContractAddress : '0x1074021f00000000000000000000000000000000',
        tokenAmount: "0",
        factoryContractAddress : '0xe805CEDf88f1491849aD63C1C1C4e42eF0416CF4',
        tokens: [
        { symbol: 'wIOTA', address: '0xB2E0DfC4820cc55829C71529598530E177968613', image: '', decimals: 18},
        { symbol: 'FLS', address: '0x1074021f00000000000000000000000000000000', image: '', decimals: 12},
        { symbol: 'wFLS', address: '0x1D148Eb4C213e560a6bad71536b96AC5D6F1cDE3', image: '', decimals: 12},
        { symbol: 'wDAI', address: '0x68EA743120BaCf2C277910700116Eb4b1C0643AA', image: '', decimals: 12 },
        { symbol: 'FUSDT', address: '0xCa2DBF6Ba5f3252Fd758C113A8c48D6D77406CaC', image: '', decimals: 12 },
        { symbol: 'FUSDC', address: '0xc4FA42632fea08274ACDB5c0d9331285C01717Ba' , image: '', decimals: 12},
        { symbol: 'wBTC', address: '0x553D8A5927FBA1c3eC05DdA667D6Cda3F5543d3a', image: '', decimals: 12 },
        { symbol: 'wETH', address: '0xd8058dA2dF3FBaBC03Ad8Ca51cAB4AAa3614B209' , image: '', decimals: 12}

        
      ],
    depositABI : [
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "deposit",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "sender",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "Deposit",
        "type": "event"
    }
      ]
      ,
      contractABI: [
        // ABI with only the requestTokens method outlined for brevity
        {
          "constant": false,
          "inputs": [
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
          ],
          "name": "requestTokens",
          "outputs": [],
          "payable": false,
          "stateMutability": "nonpayable",
          "type": "function"
        }
      ],
       faucetABI : [
       { 
        "inputs": [
            {
                "internalType": "address",
                "name": "tokenAddress",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            },
            {
                "internalType": "uint64",
                "name": "storageDeposit",
                "type": "uint64"
            }
        ],
        "name": "faucet",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function",
        "payable": true
     }
    ],
    provider: null,
    contract: null,
      }
    },
    created(){
      //Check metamask is installed
      this.checkMetaMask();
      this.checkInternet();

      //React to paths on load
      if (this.$route.name === "Login") {
        this.connectAccount();
        this.$router.push({ path: '/' })
        
      }
      if (this.$route.name === "Logout") {
        this.disconnect();
        this.$router.push({ path: '/' })
      }
      this.fetchMetaMaskAddress();
    },
    setup() {
      //Setup notifications
      const toast = useToast();
      return { toast }
    },
    methods : {
      async approveTokens() {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []); // Request account access
        const signer = provider.getSigner();

        const tokenData = this.tokens.find(token => token.symbol === this.selectedToken);
        if (!tokenData) {
          alert('Token not found');
          return;
        }
       
        const tokenABI = [
          // Minimal ABI for ERC-20 token approval
          "function approve(address spender, uint256 amount) public returns (bool)"
        ];
        const tokenContract = new ethers.Contract(this.FLSContractAddress, tokenABI, signer);
        const wrapTokenAddress = tokenData.address;
    
        const amountToDeposit = ethers.utils.parseUnits(this.tokenAmount.toString(), 12);
        // Execute approval transaction
        console.log("Approving the contract to use your tokens...");
        const approvalTx = await tokenContract.approve(wrapTokenAddress, amountToDeposit);
        await approvalTx.wait(); // Wait for the transaction to be mined
        console.log(`Approval completed: ${approvalTx.hash}`);
        this.toast.success(`Approval completed: ${approvalTx.hash}`);
      } catch (error) {
        console.error('Error during token approval:', error.message);
        this.toast.error('Error during token approval:', error.message);
      }
    },
    async fetchMetaMaskAddress() {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        this.metaMaskAddress = accounts[0];  // Store the first account
      } catch (error) {
        console.error('Error fetching MetaMask account:', error);
        this.metaMaskAddress = 'Connect to Metamask to fetch the address';
      }
    },
      async handleTokenRequest() {
      if (this.selectedToken === 'wFLS') {
        await this.callFaucet(this.FLSContractAddress);
        await this.approveTokens();
        await this.swap(this.tokenAmount);
      } else {
        await this.sendTokenRequest();
      }
    },
     async swap(amount) {
      try {
       
        const tokenData = this.tokens.find(token => token.symbol === this.selectedToken);
        if (!tokenData) {
          alert('Token not found');
          return;
        }

        // Connect to the provider
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send('eth_requestAccounts', []); // Request account access if needed
        const signer = provider.getSigner();

        // Create a new contract instance
        var contract = new ethers.Contract(tokenData.address, this.depositABI, signer);

        // Assuming the deposit function takes an amount to deposit
       
        const amountToDeposit = ethers.utils.parseUnits(this.tokenAmount.toString(), 12);

        // Call the deposit function
        const tx = await contract.deposit(amountToDeposit);
        await tx.wait(); // Wait for the transaction to be mined
        console.log('Deposit successful:', tx);
        this.toast.success("Swap (deposit) completed successfully!");
      } catch (error) {
        console.error('Error during the swap:', error);
        this.toast.error("Failed to request tokens: " + error.message);
      }
    },
    async callFaucet(tokenAddress) {
    try {
        // Connect to the Ethereum network via MetaMask
        const ethersProvider = new ethers.providers.Web3Provider(window.ethereum);
        await ethersProvider.send("eth_requestAccounts", []); // Request account access if needed
        const signer = ethersProvider.getSigner(); // Get the signer to sign transactions

       
        // Connect to your contract
        const contract = new ethers.Contract(this.factoryContractAddress, this.faucetABI, signer);

        const amountToDeposit = ethers.utils.parseUnits(this.tokenAmount.toString(), 12);
        const storageDeposit = ethers.utils.parseUnits("1", 12); // 0.01 ETH as the storage deposit

        // Call the faucet function with specified parameters and options
        const txResponse = await contract.faucet(tokenAddress, amountToDeposit, 1, {value : storageDeposit});
        const txReceipt = await txResponse.wait(); // Wait for the transaction to be mined
        console.log('Transaction successful:', txReceipt);
        this.toast.success("Tokens requested successfully.");
    } catch (error) {
        console.error('Error calling faucet function:', error.message);
        this.toast.error("Failed to request tokens: " + error.message);
    }
  },
async sendTokenRequest() {
      try {
        const ethersProvider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = ethersProvider.getSigner();
        const tokenData = this.tokens.find(token => token.symbol === this.selectedToken);
        var contract =  new ethers.Contract(tokenData.address, this.contractABI, signer);
        const tx = await contract.requestTokens(this.tokenAmount);
        await tx.wait();  // Wait for the transaction to be mined
        this.toast.success("Tokens requested successfully.");
      } catch (error) {
        console.error('Error requesting tokens:', error);
        this.toast.error("Failed to request tokens: " + error.message);
      }
    },
      async checkMetaMask() {
        //Detect ethereum Provider
        const provider = await detectEthereumProvider()
        if (provider) {
          //If Ethereum provider is detected then create events triggers
          ethereum.on('accountsChanged', this.requestAccountDetails);
          ethereum.on('chainChanged', this.requestAccountDetails);
          this.isMetaMaskInstalled = true;
          console.log('Ethereum successfully detected!');
        } else {
          this.isMetaMaskInstalled = false;
          console.error('Please install MetaMask!')
        }
      },
      startOnboarding(){
        const onboarding = new MetaMaskOnboarding();
        onboarding.startOnboarding()
      },
      async  connectAccount() {
        this.checkInternet();
        try {
          const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
          //Get account information
          const accounts = await provider.send("eth_requestAccounts", []);
          this.requestAccountDetails();
        } catch (err) {
          if (err.code === 4001) {
            this.toast.warning("You must connect with Metamask in order to use this Dapp.");
          } else if (err.code === -32002) {
            this.toast.warning("There is already a Metamask request. Please accept it.");
          } else {
            console.error(err);
          }
        }
      },
      requestAccountDetails() {
        //Dispatch store method to get accounts details and save them in the store
        this.$store.dispatch("requestAccountDetails").then( () => {
          if(this.homeProvider.length !== 0){
            this.toast.success("Connected.");
          }
        }
      );
      },
      async  disconnect() {
        //Removing data from store will reset the UI
        this.$store.commit("setHomeProvider", {});
      },
      async  checkInternet() {
       
        let isOnlineCheck = await isOnline();
        if (!isOnlineCheck){
          this.toast.warning("No internet connection.");
          return false;
        }else {
          console.log("Checked internet connectivity"); // cannot connect to a server or error occurred.
          return true;
        }
      },
     async addToken() {
      if (!this.selectedToken) {
        alert("Please select a token first.");
        return;
      }
      try {
        const tokenData = this.tokens.find(token => token.symbol === this.selectedToken);
        const wasAdded = await ethereum.request({
          method: 'wallet_watchAsset',
          params: {
            type: 'ERC20',
            options: {
              address: tokenData.address,
              symbol: tokenData.symbol,
              decimals: tokenData.decimals,  // Default decimals, update if necessary
              image: tokenData.image  // Placeholder image
            },
          },
        });

        if (wasAdded) {
          this.toast.success("Your token has been added to your MetaMask wallet.");
        } else {
          this.toast.warning("The token was not added to your MetaMask wallet.");
        }
      } catch (error) {
        console.error('Error adding token:', error);
        this.toast.error("Failed to add token: " + error.message);
      }
    }
  ,
    async  switchNetwork(chainId) {
    try {
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainId }], // chainId deve essere una stringa esadecimale, es: '0x1' per Ethereum Mainnet
      });
      } catch (switchError) {
      // Gestisci errori, ad esempio se la rete non è stata aggiunta da MetaMask
      if (switchError.code === 4902) {
        try {
        // La rete non è stata configurata, puoi chiedere di aggiungerla
        await ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: chainId,
              // Aggiungi altri parametri richiesti per configurare la rete
            }
          ],
        });
      } catch (addError) {
        console.error('Failed to add the network:', addError);
      }
    } else {
      console.error('Failed to switch the network:', switchError);
    }
  }
  },

      /*
      ADD CHAIN
       */
      async addChain(){
        const provider = new ethers.providers.Web3Provider(window.ethereum, "any");

        //Please  note that this.resilConfig is a computed property which then queries
        // the store to get the resil configuration based on the .env VUE_APP_IS_MAINNET true

        const chainIdHex = "0x" + this.ethConfig.networkId.toString(16);

        const networkData = {
          chainId: chainIdHex,
          chainName: this.ethConfig.name,
          nativeCurrency: {
            name: this.ethConfig.nativeCurrency.name,
            symbol: this.ethConfig.nativeCurrency.symbol,
            decimals: this.ethConfig.nativeCurrency.decimals,
          },
          rpcUrls: [this.ethConfig.rpc],
          blockExplorerUrls: [this.ethConfig.explorer],
          iconUrls: [this.ethConfig.iconUrls],
        };

        console.log("NETWORK")

        try {
          // wasAdded is a boolean. Like any RPC method, an error may be thrown.
          const wasAdded = await provider.send("wallet_addEthereumChain",[networkData],);

          if (wasAdded) {
            this.toast.success("You network has been added to your MetaMask wallet.");
            this.requestAccountDetails();
          } else {
            this.toast.warning("The network was not added to your MetaMask wallet.");
            console.log('Your loss!');
          }
        } catch (error) {
          console.log(error);
          //this.toast.error(error);
          this.switchNetwork(chainIdHex);

        }
      },
      async getBalance(){
        const balanceData = {
          address: this.homeProvider.account,
        };
        try {
          // wasAdded is a boolean. Like any RPC method, an error may be thrown.
          const getBalance = await ethereum.request({
            method: 'wallet_getBalance',
            params: [balanceData],
          });
          if (getBalance) {
            return  getBalance;
          } else {
            this.toast.warning("The was a problem obtaining the Balance.");
          }
        } catch (error) {
          console.log(error);
          this.toast.error(error);

        }
      }

    },
    computed: {
      targetAddress() {
        // Getter for the computed property, returns the private data property
        return this._metaMaskAddress;
      },

       provider() {
          return new ethers.providers.Web3Provider(window.ethereum);
      },

     
      homeProvider() {
        return this.$store.state.homeProvider;
      },
      ethConfig() {
        return this.$store.state.ethConfig;
      },
      chainId() {
        return this.$store.state.homeProvider.chainID;
      },
      isValidNetwork: function () {
        if(this.chainId == 1075){
          return true;
        }
      },
      isLoggedIn: function () {
        if(Object.keys(this.homeProvider).length == 0){
          return false;
        }else {
          return true;
        }
      },
       isSendEnabled: function () {
        
        if(Object.keys(this.homeProvider).length != 0 && this.tokenAmount > 0 && this.selectedToken != "wIOTA" && this.selectedToken != "FLS"  ){
          return true;
        }else {
          return false;
        }
      }
    },
    watch: {
      $route: function() {
        if (this.$route.path === "/login") {
          this.connectAccount();
        }else if (this.$route.path === "/logout")
        {
          this.disconnect();
        }
      },
      immediate: true
    },
  }
</script>


