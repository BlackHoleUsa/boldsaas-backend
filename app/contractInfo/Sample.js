const Web3 = require("web3");
// const Tx = require("ethereumjs-tx");
var Tx = require("ethereumjs-tx").Transaction;
const ContractInfo = require("./ledgerContract");
const EthUtil = require("ethereumjs-util");

const RPC = "https://data-seed-prebsc-2-s2.binance.org:8545";

// function to mint on binance blockchain.
module.exports.updateLedger = async (amount, userId, price) => {
  const web3 = new Web3(RPC);

  const contract = new web3.eth.Contract(
    ContractInfo.LEDGER_CONTRACT_ABI,
    ContractInfo.LEDGER_CONTRACT_ADDRESS
  );

  const secretkey =
    "6557a93a5e11b09b0da989d7751b23b530f4d143ce53e2808df2782e457736db";
  const adminAdd = "0x16Cc90fE450636F066291Ab498D33d2abA8bF4dc";

  const privateKey = Buffer.from(secretkey, "hex");
  const privateKeyBuffer = EthUtil.toBuffer(privateKey);

  data = contract.methods.updateLedger(amount, userId, price).encodeABI();

  var nonce;
  var gasPrice;

  try {
    nonce = await web3.eth.getTransactionCount(adminAdd);
    gasPrice = await web3.eth.getGasPrice();
  } catch (e) {
    throw e;
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
  var rawData = "0x" + tx.serialize().toString("hex");

  return new Promise((resolve) => {
    web3.eth
      .sendSignedTransaction(rawData)
      .on("transactionHash", function (hash) {
        console.log("Ledger update tx completed:", hash);
        resolve(true);
      });
  });
};
