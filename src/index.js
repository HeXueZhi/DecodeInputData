import "./index.css";
import { default as Web3} from 'web3';

var web3;
var ABI;


const fetch = require('node-fetch');
const abiDecoder = require('abi-decoder'); // NodeJS


window.App = {
    getInputData: function(){
        document.getElementById("textArea").value = "";
        document.getElementById("textArea2").value = "";
        var TXHash = document.getElementById("TXHash").value;
        if (TXHash != null){
            console.log(TXHash);
            var inputData;
            web3.eth.getTransaction(TXHash,function(err, accs) {
                if (err != null) {
                    alert("There was an error fetching your TX.");
                    return;
                }
                if (accs.length == 0) {
                    alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
                    return;
                }
                // console.log(accs);
                // console.log("****************");
                console.log(accs.input);
                web3.eth.getCode(accs.to, function(err, accs){
                    if(accs === '0x') {
                        
                        alert('普通转账交易');
                        return;
                    }
                });
                
                

                var contractAddress = accs.to;
                if (contractAddress != null){
                    //替换为自己在etherscan申请的apikey
                    var url = 'https://api-cn.etherscan.com/api?module=contract&action=getabi&address=' + contractAddress + '&apikey=自己在etherscan申请的apikey';
                    fetch(url, {method: 'get',}).then(response => response.json().then(data => {
                        ABI = JSON.parse(data.result);
                        // console.log(ABI);
                        document.getElementById("textArea").value = JSON.stringify(JSON.parse(data.result),null, ' ');
                        abiDecoder.addABI(ABI);
                        var decodedData = abiDecoder.decodeMethod(accs.input);
                        document.getElementById("textArea2").value = JSON.stringify(decodedData,null,' ');
                    }));
                }else{
                    alert("error: ContractAddress为null!!!");
                    return;
                }

                

            });
        }else{
            alert("error: TXHash为null!!!");
            return;
        }
    }
};

window.addEventListener('load', function() {
    if (typeof web3 !== 'undefined') {
        console.warn("Using web3 detected from external source.  If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
        window.web3 = new Web3(web3.currentProvider);
    } else {
        console.warn("No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
        var web3Provider;
        if (window.ethereum) {
            web3Provider = window.ethereum;
            try {
                // 请求用户授权
                window.ethereum.enable();
            } catch (error) {
                // 用户不授权时
                console.error("User denied account access")
            }
        } else if (window.web3) {   // 老版 MetaMask Legacy dapp browsers...
            web3Provider = window.web3.currentProvider;
        } else {
            //替换为自己在infura申请的appKey
            web3Provider = new Web3.providers.HttpProvider('https://mainnet.infura.io/v3/自己在infura申请的appKey');
        }
        web3 = new Web3(web3Provider);
    }
    // App.start();
});
