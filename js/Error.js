//错误处理
module.exports = (err) => {
    
    let data = {
        status: 1000,
        data: {},
        messgae: err.sqlMessage

    }

    return data
}