const express = require("express");
const app = express();
const mysql = require("mysql");
const formatting = require("./js/formatting.js")
const Error = require("./js/Error.js")
const formidable = require("formidable");
const path = require('path')
const fs = require("fs");

// 创建连接
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "123456",
    database: "test",
    multipleStatements: true
})

//连接数据库
db.connect((err) => {
    if (err) throw err;
    console.log('数据库连接成功');
})

// 创建数据库
app.get("/createdb", (req, res) => {
    let sql = "CREATE DATABASE test";
    db.query(sql, (err, result) => {
        if (err) {
            res.send(Error(err))
        } else {
            console.log(result);
            res.send(`Datebase 创建成功 <a href='/createUserTable'>创建表</a>`)
        }
    })
})

//  创建表
app.get("/createUserTable", (req, res) => {
    let sql = "CREATE TABLE User(id int AUTO_INCREMENT,title VARCHAR(255),name VARCHAR(255),phone VARCHAR(255),PRIMARY KEY(ID))";
    db.query(sql, (err, result) => {
        if (err) {
            res.send(Error(err))
        } else {
            console.log(result);
            res.send("User表创建成功....")
        }
    })
})

// 插入数据
app.get("/addUser", (req, res) => {
    let post = { title: req.query.title ? req.query.title : '', name: req.query.name ? req.query.name : "", phone: req.query.phone ? req.query.phone : '' };
    db.query('INSERT INTO User SET ?;', post, (err, result) => {
        if (err) {
            res.send(Error(err))
        } else {
            var data = {
                status: 200,
                data: { id: result.insertId },
                messgae: "请求成功"
            }
            res.send(data)
        }
    })
})

// 查询内容
app.all("/getUser", (req, res) => {
    let wheretext = ""
    if (req.query.id) {
        wheretext += " AND id = " + req.query.id
    }
    if (req.query.name) {
        wheretext += " AND name = " + req.query.name
    }
    if (req.query.title) {
        wheretext += " AND title = " + req.query.title
    }
    let sql = `SELECT * FROM User WHERE 1 = 1 ${wheretext}  limit ${req.query.current - 1 || 0},${req.query.size || 20};SELECT count(*) as count from User WHERE 1 = 1 ${wheretext}`;
    db.query(sql, (err, result) => {
        if (err) {
            res.send(Error(err))
        } else {
            var data = {
                status: 200,
                data: formatting(result, req),
                messgae: "请求成功"
            }
            res.send(data)
        }
    })
})

// 查询单条内容  -- 详情
app.get("/getUser/:id", (req, res) => {
    let sql = `SELECT * FROM User WHERE id = ${req.params.id}`;
    db.query(sql, (err, result) => {
        if (err) {
            res.send(Error(err))
        } else {
            var data = {
                status: 200,
                data: result[0],
                messgae: "请求成功"
            }
            res.send(data)
        }
    })
})

// 更新内容
app.get("/updateUser/:id", (req, res) => {
    let newTitle = "update title";
    let sql = `UPDATE User SET title = '${newTitle}' WHERE id = ${req.params.id}`;
    db.query(sql, (err, result) => {
        if (err) {
            res.send(Error(err))
        } else {
            console.log(result);
            res.send(result)
        }
    })
})

// 删除内容
app.get("/deleteUser/:id", (req, res) => {
    let sql = `DELETE FROM User WHERE id = ${req.params.id}`;
    db.query(sql, (err, result) => {
        if (err) {
            res.send(Error(err))
        } else {
            console.log(result);
            res.send("删除成功.....")
        }
    })
})

//上传图片
app.post('/upload/:id', function (req, res) { 
    var form = new formidable.IncomingForm();
    form.parse(req, function (error, fields, files) {
        fs.writeFileSync(`cover/${req.params.id}.${files.upload.name.split('.')[files.upload.name.split('.').length - 1]}`, fs.readFileSync(files.upload.path));
        let sql = `UPDATE User SET cover = 'cover/${req.params.id}.${files.upload.name.split('.')[files.upload.name.split('.').length - 1]}' WHERE id = ${req.params.id}`;
        db.query(sql, (err, result) => {
            if (err) {
                res.send(Error(err))
            } else {
                var data = {
                    status: 200,
                    data: req.params.id,
                    messgae: "请求成功"
                }
                res.send(data)
            }
        })
    });
});

// // 服务器代理
// app.use('/api', proxy({
// 	target: "http://www.baidu.com",
// 	changeOrigin: true,
// 	pathRewrite: {
// 		"^/api": "/"
// 	}
// }))

// 图片服务代理
app.use('/cover', express.static(path.join(__dirname, './cover')))

app.listen(3000, () => {
    console.log("服务器端口3000....");
})