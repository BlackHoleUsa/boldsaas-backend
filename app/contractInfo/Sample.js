const Web3 = require('web3')
const Tx = require('ethereumjs-tx');
const ContractInfo = require('./ledgerContract');

const RPC = "https://data-seed-prebsc-2-s2.binance.org:8545";


// function to mint on binance blockchain. 
module.exports.updateLedger = async ()=> {

  const web3 = new Web3(RPC)

  const contract = new web3.eth.Contract(ContractInfo.LEDGER_CONTRACT_ABI, ContractInfo.LEDGER_CONTRACT_ADDRESS);

  const secretkey = "d1a0c384ba901eac06a18cd5a5fbe90d38c21f1437ee30dd51b1123862897fda";
  const adminAdd = "0xa08a9bA3EaC7EC46FB2e6072A966219cD98D6D69"; 
  
  const privateKey = Buffer.from(secretkey, 'hex');
  const privateKeyBuffer = EthUtil.toBuffer(privateKey);

  data = contract.methods.updateLedger(amount,userId,price, '0x').encodeABI();

  var nonce
  var gasPrice


  try{
      nonce = await web3.eth.getTransactionCount(adminAdd);
      gasPrice = await web3.eth.getGasPrice();

  }
  catch(e){
      throw e
  }

  const rawTx = {

      from: adminAdd,
      to: ContractInfo.LEDGER_CONTRACT_ADDRESS,
      gasLimit: web3.utils.toHex(7000000),
      gasPrice: web3.utils.toHex(gasPrice),
      nonce: web3.utils.toHex(nonce),
      data: data,
  };

  const tx = new Tx(rawTx);
  tx.sign(privateKeyBuffer);
  var rawData = '0x' + tx.serialize().toString('hex');

  return new Promise(resolve => {
      
        web3.eth.sendSignedTransaction(rawData)
        .on('transactionHash', function(hash){
            console.log("Ledger update tx completed:", hash);
            resolve(true);
        });
      
    });

}

