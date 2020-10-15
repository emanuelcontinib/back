// Create express app
const express = require("express")
const app = express()
var md5 = require("md5")
var sqlite3 = require('sqlite3').verbose()
const DBSOURCE = "db.sqlite"
var bodyParser = require("body-parser");
var passport = require('passport');
const db = require('./database');
const cors = require('cors');

app.use(bodyParser.urlencoded({
      extended: false
}));
app.use(bodyParser.json());

app.use((req, res, next) => {
      //Qual site tem permissão de realizar a conexão, no exemplo abaixo está o "*" indicando que qualquer site pode fazer a conexão
      res.header("Access-Control-Allow-Origin", "*");
      //Quais são os métodos que a conexão pode realizar na API
      res.header("Access-Control-Allow-Methods", 'GET,PATCH,POST,DELETE');
      app.use(cors());
      next();
});

// Server port
const HTTP_PORT = 8000
// Start server
app.listen(HTTP_PORT, () => {
      console.log("Server running on port %PORT%".replace("%PORT%", HTTP_PORT))
});
// Root endpoint
app.get("/", (req, res, next) => {
      res.json({
            "message": "Ok"
      })
});


app.post('/login', (req, res, next) => {
      res.json({
            "message": "Ok"
      })
      // passport.authenticate('local', {
      //       failureRedirect: '/login'
      // }),
      // function (req, res) {
      //       res.redirect('/');
      // });
})

//USER TABLE
app.get("/api/users", (req, res, next) => {
      var sql = "select * from user"
      var params = []
      db.all(sql, params, (err, rows) => {
            if (err) {
                  res.status(400).json({
                        "error": err.message
                  });
                  return;
            }
            res.json({
                  "message": "success",
                  "data": rows
            })
      });
});

app.get("/api/user/:id", (req, res, next) => {
      var sql = "select * from user where id = ?"
      var params = [req.params.id]
      db.get(sql, params, (err, row) => {
            if (err) {
                  res.status(400).json({
                        "error": err.message
                  });
                  return;
            }
            res.json({
                  "message": "success",
                  "data": row
            })
      });
});

app.post("/api/user/", (req, res, next) => {
      var errors = []
      if (!req.body.password) {
            errors.push("No password specified");
      }
      if (!req.body.email) {
            errors.push("No email specified");
      }
      if (errors.length) {
            res.status(400).json({
                  "error": errors.join(",")
            });
            return;
      }
      var data = {
            name: req.body.email,
            email: req.body.password,
      }
      var sql = 'INSERT INTO user, email, password) VALUES (?,?)'
      db.run(sql, params, function (err, result) {
            if (err) {
                  res.status(400).json({
                        "error": err.message
                  })
                  return;
            }
            res.json({
                  "message": "success",
                  "data": data,
                  "id": this.lastID
            })
      });
})

app.patch("/api/user/:id", (req, res, next) => {
      var data = {
            name: req.body.email,
            email: req.body.password,
      }
      db.run(
            `UPDATE sureg set 
            email = COALESCE(?,email), 
            password = COALESCE(?,password), 
            WHERE id = ?`,
            [data.email, data.password, req.params.id],
            function (err, result) {
                  if (err) {
                        res.status(400).json({
                              "error": res.message
                        })
                        return;
                  }
                  res.json({
                        message: "success",
                        data: data,
                        changes: this.changes
                  })
            });
})

app.delete("/api/user/:id", (req, res, next) => {
      db.run(
            'DELETE FROM user WHERE id = ?',
            req.params.id,
            function (err, result) {
                  if (err) {
                        res.status(400).json({
                              "error": res.message
                        })
                        return;
                  }
                  res.json({
                        "message": "deleted",
                        changes: this.changes
                  })
            });
})


//SUREG TABLE
app.get("/api/sureg", (req, res, next) => {
      var sql = `select (select count (*) from printer where sureg.id = printer.suregId) "quantity", city,uf,name, sureg.id
      from sureg`
      var params = []
      db.all(sql, params, (err, rows) => {
            if (err) {
                  res.status(400).json({
                        "error": err.message
                  });
                  return;
            }
            res.json({
                  "message": "success",
                  "data": rows
            })
      });
});

app.get("/api/sureg/:id", (req, res, next) => {
      var sql = "select * from sureg where id = ?"
      var params = [req.params.id]
      db.get(sql, params, (err, row) => {
            if (err) {
                  res.status(400).json({
                        "error": err.message
                  });
                  return;
            }
            res.json({
                  "message": "success",
                  "data": row
            })
      });
});

app.get(`/api/sureg/:id/printer`, (req, res, next) => {
      var sql = "select * from printer where suregId = ? "
      var params = [req.params.id]
      // return false
      db.all(sql, params, (err, row) => {
            if (err) {
                  res.status(400).json({
                        "error": err.message
                  })
            }
            res.json({
                  "message": "success",
                  "data": row
            })
      })
})

app.post("/api/sureg/", (req, res, next) => {
      var errors = []
      if (!req.body.city) {
            errors.push("No city specified");
      }
      if (!req.body.uf) {
            errors.push("No uf specified");
      }
      if (errors.length) {
            res.status(400).json({
                  "error": errors.join(",")
            });
            return;
      }
      var data = {
            city: req.body.city,
            uf: req.body.uf,
            name: req.body.name

      }
      var sql = 'INSERT INTO sureg (city, uf, name) VALUES (?,?,?)'
      var params = [data.city, data.uf, data.name]
      db.run(sql, params, 
            function (err, result) {
                  if (err) {
                        res.status(400).json({
                              "error": err.message
                        })
                        return;
                  }
                  res.json({
                        "message": "success",
                        "data": data,
                        "id": this.lastID
                  })
            }
      );
})
app.patch("/api/sureg/:id", (req, res, next) => {
            var data = {
                  city: req.body.city,
                  uf: req.body.uf,
            }
            db.run(
                  `UPDATE sureg set 
            city = COALESCE(?,city), 
            uf = COALESCE(?,uf),
            WHERE id = ?`,
                  [data.city, data.uf, req.params.id],
                  function (err, result) {
                        if (err) {
                              res.status(400).json({
                                    "error": res.message
                              })
                              return;
                        }
                        res.json({
                              message: "success",
                              data: data,
                              changes: this.changes
                        })
                  });
})
app.delete("/api/sureg/:id", (req, res, next) => {
      console.log(req.params.id);
      db.run(
            'DELETE FROM sureg WHERE id = ?',
            req.params.id,
            function (err, result) {
                  if (err) {
                        console.log("Deu erro")
                        console.log(err)
                        res.status(400).json({
                              "error": res.message
                        })
                        return;
                  }
                  console.log("Não deu erro e " + result)
                  res.json({
                        "message": "deleted",
                        changes: this.changes
                  })
            }
      );
})

//PRINTER TABLE
app.get("/api/printer", (req, res, next) => {

            var sql = "select * from printer"
            var params = []
            db.all(sql, params, (err, rows) => {
                  if (err) {
                        res.status(400).json({
                              "error": err.message
                        });
                        return;
                  }
                  res.json({
                        "message": "success",
                        "data": rows
                  })
            });
});

app.get("/api/printer/:id", (req, res, next) => {
            var sql = "select * from printer where id = ?"
            var params = [req.params.id]
            db.get(sql, params, (err, row) => {
                  if (err) {
                        res.status(400).json({
                              "error": err.message
                        });
                        return;
                  }
                  res.json({
                        "message": "success",
                        "data": row
                  })
            });
});
app.post("/api/printer/", (req, res, next) => {
            var errors = []
            console.log(req.body.suregId)
            if (!req.body.serial) {
                  errors.push("No serial specified");
            }
            if (!req.body.model) {
                  errors.push("No model specified");
            }
            if (errors.length) {
                  res.status(400).json({
                        "error": errors.join(",")
                  });
                  return;
            }
            var data = {
                  serial: req.body.serial,
                  model: req.body.model,
                  suregId: req.body.suregId,
            }
            var sql = 'INSERT INTO printer (serial, model, suregId) VALUES (?,?,?)'
            var params = [data.serial, data.model, data.suregId]
            db.run(sql, params, function (err, result) {
                  if (err) {
                        res.status(400).json({
                              "error": err.message
                        })
                        return;
                  }
                  res.json({
                        "message": "success",
                        "data": data,
                        "id": this.lastID
                  })
            });
})
app.patch("/api/printer/:id", (req, res, next) => {
            var data = {
                  serial: req.body.serial,
                  model: req.body.model,
            }
            db.run(
                  `UPDATE printer set 
            serial = COALESCE(?,serial), 
            model = COALESCE(?,model)
            WHERE id = ?`,
                  [data.serial, data.model, req.params.id],
                  function (err, result) {
                        if (err) {
                              res.status(400).json({
                                    "error": result
                              })
                              return err
                        }
                        res.json({
                              message: "success",
                              data: data,
                              changes: this.changes
                        })
                  });
})

app.delete("/api/printer/:id", (req, res, next) => {
      db.run(
            'DELETE FROM printer WHERE id = ?',
            req.params.id,
            function (err, result) {
                  if (err) {
                        res.status(400).json({
                              "error": res.message
                        })
                        return;
                  }
                  res.json({
                        "message": "deleted",
                        changes: this.changes
                  })
            }
      );
})