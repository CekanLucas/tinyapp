const generateRandomString = () => {
  let charArray = [];
  
  let i = 48 
  while(i < 58){ // generate digits
    charArray.push(String.fromCharCode(i));
    i++;
  }
  i = 65;
  while(i < 91){ // generate uppercase
    charArray.push(String.fromCharCode(i));
    i++;
  }
  i = 97;
  while(i < 123){ // generate lowercase
    charArray.push(String.fromCharCode(i));
    i++;
  }
  
  i = 0 
  let randStr = ''
  while(i < 6){
    //charArray.length is 62
    randStr += charArray[Math.floor(Math.random() * 62)];
    i++;
  }
  return randStr;
}

module.exports = {
  generateRandomString
}