//列表数据格式化
module.exports = (result, req) => {
    var List = {
        data: result[0],
        total: result[1][0].count
    }

    if (req.query.current || req.query.size) {
        List.current = Number(req.query.current) || 1
        List.size = Number(req.query.size) || 20
    }
    if (req.params.current || req.params.size) {
        List.current = Number(req.query.current) || 1
        List.size = Number(req.params.size) || 20
    }

    return List
}