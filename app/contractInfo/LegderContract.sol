pragma solidity ^0.5.16;

import "./ICOToken.sol";
import "./SafeMath.sol";
import "./Ownable.sol";

contract LedgerContract is Ownable{
    using SafeMath for uint256;
    
    ICOToken private token_;
    uint256 public idCounter;
    
    struct UserPurchase{
        uint256 id;
        string userId;
        uint256 shares;
        uint256 price;
    }
    
    mapping(uint256 => UserPurchase)public UserPurchaseList;
    
    mapping(string => mapping(uint256 => uint256)) private _ownerIdIndex;
    mapping(string => uint256[]) private _ownerIds;
    
    constructor(address tokenAddress) 
    Ownable (msg.sender)public{
        token_ = ICOToken(tokenAddress);
        idCounter = 1;
    }
    
    function updateLedger(uint256 amount_, string memory userId_, uint256 price_)public onlyOwner{
        require(amount_> 0, "amount can not be zero");
        
        token_.mint(address(this), amount_);
        
        UserPurchase memory newPurchase = UserPurchase(
            idCounter,
            userId_,
            amount_,
            price_
            );
        
        UserPurchaseList[idCounter] = newPurchase;
        
        if (!_ownerIdExists(userId_, idCounter)) {
            _addOwnerId(userId_, idCounter);
        }
        
        idCounter = idCounter.add(1);
        
    }
    
    function adminWithdraw(uint256 amount_)public onlyOwner{
        require(amount_>0 , "amount can not be zero");
        
        token_.transfer(msg.sender, amount_);
        
    }
    
    function getUserIds(string memory user) public view returns (uint256[] memory) {
       return _ownerIds[user];
       
   }
   
   function getUserIdIndex(string memory user, uint256 id) public view returns (uint256) {
       return _ownerIdIndex[user][id];
   }
    
    function _deleteOwnerId(string memory owner, uint256 id) internal {
        uint256 lastIndex = _ownerIds[owner].length.sub(1);
        uint256 lastId = _ownerIds[owner][lastIndex];
        
        if (id == lastId) {
            _ownerIdIndex[owner][id] = 0;
            _ownerIds[owner].pop();
        } else {
            uint256 indexOfId = _ownerIdIndex[owner][id];
            _ownerIdIndex[owner][id] = 0;

            _ownerIds[owner][indexOfId] = lastId;
            _ownerIdIndex[owner][lastId] = indexOfId;
            _ownerIds[owner].pop();
        }
  }
  
  function _addOwnerId(string memory owner, uint256 id) internal {
      uint256 len = _ownerIds[owner].length;
      _ownerIdIndex[owner][id] = len;
      _ownerIds[owner].push(id);
  }

  function _ownerIdExists(string memory owner, uint256 id) internal view returns (bool) {
      if (_ownerIds[owner].length == 0) return false;
      
      uint256 index = _ownerIdIndex[owner][id];
      return id == _ownerIds[owner][index];
  }    
    
    
}

// getUserIds(userId);
//UserPurchaseList(id); 

//LedgerContract:  0x682552c284E3fA35929474bB281dF5A427D63231
// tokenContract: 0xA82aA5BC6932B8ad736Ba73dFDc01347D31aF382