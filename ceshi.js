const express = require("express");
const app = express();
const mysql = require("mysql");
const formatting = require("./js/formatting.js")
const Error = require("./js/Error.js") 

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
    let Phone = Math.ceil(Math.random() * 100000)
    let post = { title: "1111111", name: "我的名字", phone: '151311' + Phone };
    db.query('INSERT INTO User SET ?;SELECT LAST_INSERT_ID() as Id;', post, (err, result) => {
        if (err) {
            res.send(Error(err))
        } else {
            console.log(result);
            res.send(result)
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
                data:formatting(result,req),
                messgae: "请求成功"
            }
            res.send(data)
        }
    })
})

// 查询单条内容
app.get("/getUser/:id", (req, res) => {
    let sql = `SELECT * FROM User WHERE id = ${req.params.id}`;
    db.query(sql, (err, result) => {
        if (err) {
            res.send(Error(err))
        } else {
            console.log(result);
            res.json(result)
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

app.listen(3000, () => {
    console.log("服务器端口3000....");
})