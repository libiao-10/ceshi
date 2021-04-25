//发邮件测试程序
const nodemailer  = require("nodemailer");
const smtpTransport = nodemailer.createTransport({
    service: 'qq',
    auth: {
        user: '1031215978@qq.com',
        pass: 'depeibndtwlvbceb'
    }
});
module.exports = (result, req) => {
    var String=`<h4>${result.query.name }  ${result.query.sex==1?'先生':"女士" },您好</h4>
    <h5> 时间 ：${result.query.time }</h5>
    <h5> Hello World</h5>`
    console.log(result.query)
    return smtpTransport.sendMail({
        from    : '1031215978@qq.com',
        to      : result.query.Email,
        subject : '测试!',
        html: String 
    });
}