import { createStore } from 'vuex'
const ethers = require("ethers");

import {
  IOTA_EVM_TESTNET_CONFIG,
  IOTA_EVM_CONFIG,
  NETWORKS
} from '@/constants/networks.js'


//Check network
const isTestnet = !(process.env.VUE_APP_IS_MAINNET == 'true')
const ethConfig = isTestnet ? IOTA_EVM_TESTNET_CONFIG : IOTA_EVM_CONFIG;

export default createStore({
  state: {
    isTestnet: isTestnet,
    ethConfig: ethConfig,
    networkId: null,
    homeProvider:{
    }
  },
  mutations: {
    setHomeChainData (state, data) {
      state.homeChain = data;
    },
    setForeignChainData (state, data) {
      state.foreignChain = data;
    },
    setHomeProvider (state, data) {
      state.homeProvider = data;
    },
    setNetworkId (state, id) {
      state.networkId = id;
    }
  },
  actions: {
    async  requestAccountDetails(state) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
        //Get account information
        // const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
        const accounts = await provider.send("eth_requestAccounts", []);
        const account = accounts[0];

        //Get ChainID
        const chainID = await provider.send("eth_chainId",[]);

        const chainIdDecimal = parseInt(chainID, 16);

        //Account Balance
        const homeBalance = await provider.send("eth_getBalance",[account,'latest']);
        //Account Transaction Count
        const transactionCount = await provider.send("eth_getTransactionCount",[account,'latest']);
        //Account Transaction Count
        const gasPrice = await provider.send("eth_gasPrice",[]);

        //Default network name
        const NETWORK_NAME = {'name': 'Unknown'};
        //Check if networkId matches one of the network names
        const network = await NETWORKS.find(elem => elem.networkId === chainIdDecimal);

        //If results then use the correct network name
        if (network !== undefined){
          NETWORK_NAME.name = network.name;
          
        }


        let homeData = {
          chainID: chainID,
          networkName: NETWORK_NAME.name,
          account: account,
          homeBalance: homeBalance,
          transactionCount: transactionCount,
          gasPrice: gasPrice,
        }
        state.commit("setHomeProvider", homeData);

        console.log("Connected! Account number:"+account);
        console.log(homeData);

      } catch (err) {
        console.error(err);

      }
    },
  },
  modules: {
  }
})
