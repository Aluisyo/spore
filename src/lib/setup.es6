"use strict"; 

var readlineSync = require('readline-sync');
var fs           = require('fs-extra');
var path         = require('path');
var _            = require('underscore');

var Ipfs         = require('./ipfs.es6');
var web3         = require('web3');
var colors       = require('colors');

module.exports = function ( options ) {
  
  
  var addChain = function() {
    
    var eth_host = 'localhost';
    var eth_port = '8545';
    var spore_address = '0xfe463136af3fce0a1ce72463a33584b64936a353';
    
    if( options.cli ) {
    
      eth_host = readlineSync.question('Ethereum rpc host [localhost]: ') || 'localhost';
      eth_port = readlineSync.question('Ethereum rpc port [8545]: ') || '8545';
      // test rpc connection
      // 
      web3.setProvider(new web3.providers.HttpProvider(`http://${eth_host}:${eth_port}`)); 
      
      try {
        var bh = web3.getBlock(0).hash;
        if( bh === '0x34288454de81f95812b9e20ad6a016817069b13c7edc99639114b73efbc21368' ) {
          spore_address = '0xfe463136af3fce0a1ce72463a33584b64936a353'
        } else {
          console.log('ERROR'.red + ': Currently only the ConsenSys testnet chain is supported');
          // spore_address = readlineSync.question('Please point to ethereum address:') || '0xfe463136af3fce0a1ce72463a33584b64936a353'; // testnet contract
        }
      } catch ( e ) {
        console.log('ERROR'.red + ': Currently only the ConsenSys testnet chain is supported');
      }
      
      
    }
    
    return {
      host: eth_host,
      port: eth_port,
      address: spore_address
    };
    
  }
  
  var setupIpfs = function() {
    
    var ipfs_host = 'localhost';
    var ipfs_port = '5001';
    
    if ( options.cli ) {
      ipfs_host = readlineSync.question('IPFS host [localhost]: ') || 'localhost';
      ipfs_port = readlineSync.question('IPFS port [5001]: ') || '5001';
    }
    
    return {
      ipfs_host,
      ipfs_port
    };
  }
  
  var setupAll = function() {
    console.log('You are running spore for the first time. A configuration file will be created in ~/.spore.json');
    
    var obj = setupIpfs();
    var name = 'origin';
    if( options.cli )
      name     = readlineSync.question('Name for your chain and spore contract [origin]: ') || 'origin';
    obj.chains = {};
    obj.chains[name] = addChain(name);
    obj.selected = name;
    
    return obj;
  }
  
  
  var pingSpore = function( host, port, address ) {
    
    try {
      web3.setProvider(new web3.providers.HttpProvider(`http://${host}:${port}`));
      var c = web3.version.client;
    } catch ( e ) {
      if( options.cli )
        console.log( "Cannot reach etheruem rpc server, please verify its running." );
      return false;
    }
    
    
    var c = web3.eth.getCode( address );
    if ( c.length <= 2 ) {
      if( options.cli )
        console.log("Contract can't be found, try another address or deploy a new spore contract.");
      return false;
    }
    return true;
  }
  
  var pingIpfs = function( host, port ) {
    let ipfs = Ipfs( host, port );
    try {
      let addr = ipfs.addSync('test');
      return true;
    } catch ( e ) {
      if( options.cli )
        console.log( "Cannot reach ipfs deamon, try again." );
      return false;
    }
  }
  
  var testParameters = function() {
    
    var sporeOnline = pingSpore( eth_host, eth_port, spore_address );
    
    var ipfsOnline = pingIpfs( ipfs_host, ipfs_port );
    
    return sporeOnline && ipfsOnline;
  };
  
  return {
    addChain,
    setupIpfs,
    setupAll,
    pingSpore,
    pingIpfs
  };
  
}
