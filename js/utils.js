//列表数据格式化
module.exports = (obj)=>{
	if(typeof obj==="object"){
		let newObj="";
		for(var i in obj){
			newObj+=",";
			newObj+=i;
			newObj+="=";
			newObj+="'"+obj[i]+"'";
		}
		return newObj.substr(1);
	}else if(typeof obj==="string"){
		return obj
	}
}