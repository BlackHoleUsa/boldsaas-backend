const Web3 = require("web3");
const EthereumTx = require("ethereumjs-tx").Transaction;
var contractInfo = require("./ledgerContract");

const provider = "https://data-seed-prebsc-2-s2.binance.org:8545";
const web3 = new Web3(new Web3.providers.HttpProvider(provider));
var abi = contractInfo.LEDGER_CONTRACT_ABI;
var address = contractInfo.LEDGER_CONTRACT_ADDRESS;

var pk = "d1a0c384ba901eac06a18cd5a5fbe90d38c21f1437ee30dd51b1123862897fda";
web3.eth.defaultAccount = "0xa08a9bA3EaC7EC46FB2e6072A966219cD98D6D69";

// // dummy values
// var amount = 10000000000; // 8 decimal places (100 x 1e^8)
// var user = "usman@test.com";
// var price = 100; // 2 decimal places (1 x 1e^2)

exports.blockchain = async (amount, user, price) => {
  amount = amount * 100000000;
  price = price * 100;

  web3.eth.getTransactionCount(web3.eth.defaultAccount, function (err, nonce) {
    const contract = new web3.eth.Contract(abi, address, {
      from: web3.eth.defaultAccount,
      gas: 7000000,
    });
    const functionAbi = contract.methods
      .updateLedger(amount, user, price)
      .encodeABI();
    var details = {
      nonce: nonce,
      gasPrice: web3.utils.toHex(web3.utils.toWei("85", "gwei")),
      gas: 700000,
      to: address,
      value: 0,
      data: functionAbi,
    };

    const transaction = new EthereumTx(details, {
      chain: "Smart Chain - Testnet",
    });
    transaction.sign(Buffer.from(pk, "hex"));
    var rawData = "0x" + transaction.serialize().toString("hex");

    web3.eth
      .sendSignedTransaction(rawData)
      .on("transactionHash", function (hash) {
        console.log(["transferToStaging Trx Hash:" + hash]);
      })
      .on("receipt", function (receipt) {
        console.log(["transferToStaging Receipt:", receipt]);
      })
      .on("error", console.error);
  });
};

// module.exports = blockchain;

// 31 days = "0 */744 * * *""
