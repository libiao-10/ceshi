//列表数据格式化
module.exports = (result) => {
    var List = { data: result[0], total: result[1][0].count }
    return List
}