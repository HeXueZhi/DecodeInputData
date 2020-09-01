## 以太坊合约交易inputData解码

### 一、需求式例

交易hash：[0xb1c0abd217193ffe64f97caedad8fa6f0f9c0265967d2ab9fb782280c928fb47](https://cn.etherscan.com/tx/0xb1c0abd217193ffe64f97caedad8fa6f0f9c0265967d2ab9fb782280c928fb47)

![inputdata](http://i.loli.net/2020/09/01/zRVY1tOMWE37aqJ.png)

需要将交易中的数据解码为上图中的数据。

### 二、思路

1. 先通过web3来取得交易中的`to`地址和`inputdata`。
2. 将`to`地址传入erherScan的api获得合约的abi。
3. 通过abi-decoder来解析inputdata。

### 三、具体实现

整体通过webpack框架。
应用的包：`package.json`文件中的`dependencies`

#### 3.1 实例化web3

在infura注册一个key，替换代码中的key。（*Infura*提供免费的以太坊节点RPC API服务）

```js
window.addEventListener('load', function() {
    if (typeof web3 !== 'undefined') {
        window.web3 = new Web3(web3.currentProvider);
    } else {
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
            web3Provider = new Web3.providers.HttpProvider('https://mainnet.infura.io/v3/填入infura个人的key');
        }
        web3 = new Web3(web3Provider);
    }
    // App.start();
});
```

### 3.2 解析inputdata

在etherscan注册apikey，替换代码中的。

如果不想注册删掉代码中的`&apikey=填入etherscan的个人key`也可以，不过etherscan会添加每秒访问5次的限制。

```js
import "./app.css";
import { default as Web3} from 'web3';

var web3;
var ABI;


const fetch = require('node-fetch');
//通过fetch获取abi

const abiDecoder = require('abi-decoder'); 
// 通过abi解析inputdata


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
                console.log(accs.input);//输出inputdata
                //验证to地址是否是合约地址，合约地址的Code不为空
                web3.eth.getCode(accs.to, function(err, accs){
                    if(accs === '0x') {
                        alert('普通转账交易');
                        return;
                    }
                });
                
                var contractAddress = accs.to;
                if (contractAddress != null){
                    var url = 'https://api-cn.etherscan.com/api?module=contract&action=getabi&address=' + contractAddress + '&apikey=填入etherscan的个人key';
                    fetch(url, {method: 'get',}).then(response => response.json().then(data => {
                        ABI = JSON.parse(data.result);//获取合约abi'
                        // console.log(ABI);
                        document.getElementById("textArea").value = JSON.stringify(JSON.parse(data.result),null, ' ');
                        abiDecoder.addABI(ABI);//解析abi
                        var decodedData = abiDecoder.decodeMethod(accs.input);//获得解析数据
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
```

### 3.3 build项目

在文件夹下执行:

```powershell
npm run build
```

### 3.4 启动项目

在文件夹下执行:

```powershell
npm run dev
```

访问http://localhost:8080即可。
