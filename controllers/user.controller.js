const users = require('../model/user.model');
const bcrypt = require('bcrypt');
const passport = require('passport');

var handlebars = require('hbs');
handlebars.registerHelper("setVar", function(varName, varValue, options) {
  options.data.root[varName] = varValue;
});

// module to render register or /
module.exports.register = async function(req, res) {
    // get username, password, confirmpassword,name,phonenumber in register form
    const{username, password, confirmpassword,name,phonenumber}=req.body;
    let errors=[];
    //console.log(username,password,confirmpassword,name,phonenumber);
    // check required fields
    if(!username || !password || !confirmpassword || !name || !phonenumber ){
        errors.push({msg:'Bạn nhập thiếu thông tin!!'});
    }
    
    // check password match
    if(password !== confirmpassword){
      errors.push({msg:'Xác nhận mật khẩu không đúng!!'});
    }

    // check pass length
    if(!password || password.length < 6){
      errors.push({msg:'Chiều dài mật khẩu phải lớn hơn 6 kí tự'});
    }

    if(errors.length > 0)
    {
      res.render('register',{errors,username,password,confirmpassword,name,phonenumber});
    }
    else{
      const newuser = new users ({
        username,
        password,
        name,
        phonenumber
      });

      users.findOne({username : username})
      .then(users=>{
        if(users){
          //user exists
          errors.push({msg:'Tên đăng nhập đã tồn tại!!'});
          res.render('register',{errors, username,password,confirmpassword,name,phonenumber});
        }
        else{
          // Hash password
          bcrypt.genSalt(10,(err,salt)=>{
            bcrypt.hash(newuser.password,salt,(err,hash)=>{
              if(err) throw err;
              // set password to hash
              newuser.password= hash;
              //save user
              //console.log(newuser);
              newuser.save()
              .then(users => {
                req.flash('success_msg', 'Bạn đăng kí tài khoản thành công! Hãy đăng nhập');
                res.render('login',{username,password});
              })
              .catch(err=>console.log(err));
            });
          });
          //console.log(newuser);
          //newuser.save()
          //res.render('login');
        }
      }).catch(err=>console.log(err));
    }
}

//login
module.exports.login = async function(req, res, next) {
    passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
  })(req, res, next);
}

// Logout

module.exports.logout = async function(req, res, next) {
  req.logout();
  req.flash('success_msg', 'Bạn đã đăng xuất');
  res.redirect('/login');
}