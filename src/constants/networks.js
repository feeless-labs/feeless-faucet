
//IOTA EVM NETWORK TESTNET
export const IOTA_EVM_TESTNET_CONFIG = {
    networkId: 1075,
    name: 'IOTA EVM Testnet',
    localStorageName: 'iota-evm-testnet',
    explorer: 'https://explorer.evm.testnet.iotaledger.net/',
    iconUrls: 'https://explorer.evm.testnet.iotaledger.net/assets/configs/network_logo.svg',
    rpc: 'https://1075.rpc.thirdweb.com',
    isResil: true,
    isEth: false,
    nativeCurrency: {
        name: 'IOTA',
        symbol: 'IOTA',
        decimals: 18
    },
}

export const IOTA_EVM_CONFIG = {
    networkId: 8822,
    name: 'IOTA EVM',
    localStorageName: 'iota-evm',
    explorer: 'https://explorer.evm.testnet.iotaledger.net/',
    iconUrls: 'https://explorer.evm.testnet.iotaledger.net/assets/configs/network_logo.svg',
    rpc: 'https://json-rpc.evm.iotaledger.net',
    isResil: true,
    isEth: false,
    nativeCurrency: {
        name: 'IOTA',
        symbol: 'IOTA',
        decimals: 18
    },
}

export const NETWORKS = [
    IOTA_EVM_TESTNET_CONFIG,
    IOTA_EVM_CONFIG
];
