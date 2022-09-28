const express = require("express");
const mailchimp = require("@mailchimp/mailchimp_marketing");
const https = require("https");
const favicon = require("serve-favicon");
const path = require("path");

const app = express();

app.use(favicon(path.join(__dirname, './public/images', 'favicon.ico')));
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.sendFile(`${__dirname}/public/signup.html`);
});

app.post("/", async (req, res) => {
    const firstName = req.body.fName;
    const lastName = req.body.lName;
    const { email } = req.body;
    const apiKey = "74a302d3181eef78e4d1fd2f05af9c91-us8";
    const dataCenter = "us8";
    const audienceId = "8997518616";

    mailchimp.setConfig({
        apiKey,
        server: dataCenter,
    });

    const data = {
        members: [
            {
                email_address: email,
                status: "subscribed",
                merge_fields: {
                    FNAME: firstName,
                    LNAME: lastName,
                }
            }
        ]
    };

    const jsonData = JSON.stringify(data);

    const url = `https://${dataCenter}.api.mailchimp.com/3.0/lists/${audienceId}`;
    const options = {
        method: "POST",
        auth: `ghoes18:${apiKey}`
    };

    const request = https.request(url, options, (response) => {
        
        response.on("data", (data) => {
            const resData = JSON.parse(data);
            if(res.statusCode === 200 && resData.new_members.length && resData.error_count === 0) {
                res.sendFile(`${__dirname}/public/success.html`);
                return;
            }
            res.sendFile(`${__dirname}/public/failure.html`);
        });
    });
    request.write(jsonData);
    request.end();
});

app.post('/failure', (req, res) => {
    res.redirect('/');
});


app.listen(3000, () => {
    console.log('http://localhost:3000');
});