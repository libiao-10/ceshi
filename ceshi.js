const express = require("express");
const app = express();
const mysql = require("mysql");
const formatting = require("./js/formatting.js");
const encode = require("./js/utils.js");
const Error = require("./js/Error.js");
const SendMessage = require("./js/SendMessage.js");
const jwt = require("jsonwebtoken");
var multipart = require("connect-multiparty");
var multipartMiddleware = multipart();
const bodyParser = require("body-parser");
const formidable = require("formidable");
app.use(bodyParser.urlencoded({ extended: false }));
const path = require("path");
const fs = require("fs");
let secret = "ceshi";
// 创建连接
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "123456",
  database: "test",
  multipleStatements: true,
});
//
//连接数据库
db.connect((err) => {
  if (err) throw err;
  console.log("数据库连接成功");
});

// // 创建数据库
// app.get("/createdb", (req, res) => {
//   let sql = "CREATE DATABASE test";
//   db.query(sql, (err, result) => {
//     if (err) {
//       res.send(Error(err));
//     } else {
//       console.log(result);
//       res.send(`Datebase 创建成功 <a href='/createUserTable'>创建表</a>`);
//     }
//   });
// });

// //  创建表
// app.get("/createUserTable", (req, res) => {
//   let sql =
//     "CREATE TABLE personnel(id int AUTO_INCREMENT,title VARCHAR(255),name VARCHAR(255),phone VARCHAR(255),PRIMARY KEY(ID))";
//   db.query(sql, (err, result) => {
//     if (err) {
//       res.send(Error(err));
//     } else {
//       console.log(result);
//       res.send("User表创建成功....");
//     }
//   });
// });

//登录
app.post("/login", multipartMiddleware, function (req, res) {
  var username = req.body.username;
  var password = req.body.password;
  var selectSQL =
    "select * from user where username = '" +
    username +
    "' and password = '" +
    password +
    "'";
  db.query(selectSQL, function (err, rs) {
    if (err) throw err;
    if (rs[0]) {
      let payload = { name: username };
      let token = jwt.sign(payload, secret);
      res.send({
        status: 200,
        username: rs[0].name,
        userId: rs[0].id,
        token: token,
      });
    } else {
      res.send({ status: "4001", message: "账号或密码错误" });
    }
  });
});

// 人才管理新增接口
app.get("/addUser", (req, res) => {
  db.query("INSERT INTO personnel SET ?;", req.query, (err, result) => {
    if (err) {
      res.send(Error(err));
    } else {
      var data = {
        status: 200,
        data: { id: result.insertId },
        messgae: "请求成功",
      };
      res.send(data);
    }
  });
});

// 人才管理查询接口
app.all("/getList", (req, res) => {
  let wheretext = "";
  for (var item in req.query) {
    if (item !== "currentPage" && item !== "perPageRows") {
      if (req.query[item] !== "-1") {
        wheretext += ` AND ${item} = ` + "'" + req.query[item] + "'";
      }
    }
  }
  let sql = `SELECT * FROM personnel WHERE 1 = 1 ${wheretext}  limit ${
    (req.query.currentPage - 1) * req.query.perPageRows || 0
  },${
    req.query.perPageRows || 20
  };SELECT count(*) as count from personnel WHERE 1 = 1 ${wheretext}`;
  db.query(sql, (err, result) => {
    if (err) {
      res.send(Error(err));
    } else {
      var data = {
        status: 200,
        data: formatting(result, req),
        messgae: "请求成功",
      };
      res.send(data);
    }
  });
});

// 人才管理详情接口  -- 详情
app.get("/getUser/:id", (req, res) => {
  let sql = `SELECT * FROM personnel WHERE id = ${req.params.id}`;
  db.query(sql, (err, result) => {
    if (err) {
      res.send(Error(err));
    } else {
      var data = {
        status: 200,
        data: result[0],
        messgae: "请求成功",
      };
      res.send(data);
    }
  });
});

// 人才管理更新接口
app.get("/updateUser/:id", (req, res) => {
  let sql = `UPDATE personnel SET ${encode(req.query)} WHERE id = ${
    req.params.id
  }`;
  db.query(sql, (err, result) => {
    if (err) {
      res.send(Error(err));
    } else {
      var data = {
        status: 200,
        messgae: "请求成功",
      };
      res.send(data);
    }
  });
});

// 人才管理删除人才信息
app.get("/deleteUser/:id", (req, res) => {
  let sql = `DELETE FROM personnel WHERE id = ${req.params.id}`;
  db.query(sql, (err, result) => {
    if (err) {
      res.send(Error(err));
    } else {
      var data = {
        status: 200,
        messgae: "请求成功",
      };
      res.send(data);
    }
  });
});

// 人才管理发送邮件服务
app.get("/SendMessage", (req, res) => {
  SendMessage(req, res).then((result) => {
    let sql = `UPDATE personnel SET isSend = 1 , interview = "${req.query.time}" WHERE id = ${req.query.id}`;
    db.query(sql, (err, result) => {
      if (err) {
        res.send(Error(err));
      } else {
        var data = {
          status: 200,
          messgae: "请求成功",
        };
        res.send(data);
      }
    });
  });
});

//上传图片
app.post("/upload/:id", function (req, res) {
  var form = new formidable.IncomingForm();
  form.parse(req, function (error, fields, files) {
    fs.writeFileSync(
      `cover/${req.params.id}.${
        files.upload.name.split(".")[files.upload.name.split(".").length - 1]
      }`,
      fs.readFileSync(files.upload.path)
    );
    let sql = `UPDATE personnel SET cover = 'cover/${req.params.id}.${
      files.upload.name.split(".")[files.upload.name.split(".").length - 1]
    }' WHERE id = ${req.params.id}`;
    db.query(sql, (err, result) => {
      if (err) {
        res.send(Error(err));
      } else {
        var data = {
          status: 200,
          data: req.params.id,
          messgae: "请求成功",
        };
        res.send(data);
      }
    });
  });
});

//专业列表
app.all("/getMajor", (req, res) => {
  let sql = `SELECT * FROM major`;
  db.query(sql, (err, result) => {
    if (err) {
      res.send(Error(err));
    } else {
      var List = [];
      for (var i in result) {
        List.push(result[i]);
      }
      var data = {
        status: 200,
        data: List,
        messgae: "请求成功",
      };
      res.send(data);
    }
  });
});

// 职位管理查询接口
app.all("/position/getlist", (req, res) => {
  let wheretext = "";
  for (var item in req.query) {
    if (item !== "currentPage" && item !== "perPageRows") {
      if (req.query[item] !== "-1") {
        wheretext += ` AND ${item} = ` + "'" + req.query[item] + "'";
      }
    }
  }
  let sql = `SELECT * FROM position WHERE 1 = 1 ${wheretext}  limit ${
    (req.query.currentPage - 1) * req.query.perPageRows || 0
  },${
    req.query.perPageRows || 20
  };SELECT count(*) as count from position WHERE 1 = 1 ${wheretext}`;
  db.query(sql, (err, result) => {
    if (err) {
      res.send(Error(err));
    } else {
      var data = {
        status: 200,
        data: formatting(result, req),
        messgae: "请求成功",
      };
      res.send(data);
    }
  });
});

// 职位管理新增接口
app.get("/position/addUser", (req, res) => {
  db.query("INSERT INTO position SET ?;", req.query, (err, result) => {
    if (err) {
      res.send(Error(err));
    } else {
      var data = {
        status: 200,
        data: { id: result.insertId },
        messgae: "请求成功",
      };
      res.send(data);
    }
  });
});

// 职位管理更新接口
app.get("/position/updateUser/:id", (req, res) => {
  let sql = `UPDATE position SET ${encode(req.query)} WHERE id = ${
    req.params.id
  }`;
  db.query(sql, (err, result) => {
    if (err) {
      res.send(Error(err));
    } else {
      var data = {
        status: 200,
        messgae: "请求成功",
      };
      res.send(data);
    }
  });
});

// 职位管理删除信息
app.get("/position/deleteUser/:id", (req, res) => {
  let sql = `DELETE FROM position WHERE id = ${req.params.id}`;
  db.query(sql, (err, result) => {
    if (err) {
      res.send(Error(err));
    } else {
      var data = {
        status: 200,
        messgae: "请求成功",
      };
      res.send(data);
    }
  });
});

// 职位管理查询接口
app.all("/position/getlistAll", (req, res) => {
  let sql = `SELECT * FROM position `;
  db.query(sql, (err, result) => {
    if (err) {
      res.send(Error(err));
    } else {
      var List = [];
      for (var i in result) {
        List.push(result[i]);
      }
      var data = {
        status: 200,
        data: List,
        messgae: "请求成功",
      };
      res.send(data);
    }
  });
});

// 统计管理查询接口
app.all("/statistics/getList", (req, res) => {
  let sql = `SELECT * FROM personnel`;
  db.query(sql, (err, result) => {
    if (err) {
      res.send(Error(err));
    } else {
      var List = [];
      for (var i in result) {
        List.push(result[i][req.query.key]);
      }
      var DataList = [];
      List.map((item) => {
        if (
          DataList.filter((item1) => {
            return item1.type == item;
          }).length > 0
        ) {
          DataList.map((item2) => {
            if (item2.type == item) {
              item2.const++;
            }
          });
        } else {
          var Box = {
            type: item,
            const: 1,
          };
          DataList.push(Box);
        }
      });
      var data = {
        status: 200,
        data: DataList,
        messgae: "请求成功",
      };
      res.send(data);
    }
  });
});

//菜单管理 menu
// 菜单管理下拉选择
//
app.all("/menu/Select/list", (req, res) => {
  let sql = `SELECT * FROM menu`;
  db.query(sql, (err, result) => {
    if (err) {
      res.send(Error(err));
    } else {
      var List = [];
      for (var i in result) {
        if (result[i].pid == 0) {
          List.push({ name: result[i].name, id: result[i].id });
        }
      }
      var data = {
        status: 200,
        data: List,
        messgae: "请求成功",
      };
      res.send(data);
    }
  });
});
// 菜单管理查询接口
app.all("/menu/getlist", (req, res) => {
  let sql = `SELECT * FROM menu`;
  db.query(sql, (err, result) => {
    if (err) {
      res.send(Error(err));
    } else {
      var List = [];
      for (var i in result) {
        List.push(result[i]);
      }
      var MenuList = [];
      List.map((item) => {
        if (item.pid == 0) {
          MenuList.push({
            key: item.id,
            title: item.name,
            url: item.url,
            children: [],
          });
        } else {
          MenuList.map((item1, index) => {
            if (item.pid == item1.key) {
              MenuList[index].children.push({
                key: item.id,
                title: item.name,
                url: item.url,
              });
            }
          });
        }
      }); 
      var data = {
        status: 200,
        data: MenuList,
        messgae: "请求成功",
      };
      res.send(data);
    }
  });
});

// 菜单管理新增接口
app.get("/menu/addUser", (req, res) => {
  db.query("INSERT INTO menu SET ?;", req.query, (err, result) => {
    if (err) {
      res.send(Error(err));
    } else {
      var data = {
        status: 200,
        data: { id: result.insertId },
        messgae: "请求成功",
      };
      res.send(data);
    }
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
app.use("/cover", express.static(path.join(__dirname, "./cover")));

app.listen(3000, () => {
  console.log("服务器端口3000....");
});
