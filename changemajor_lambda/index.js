const AWS = require('aws-sdk');
const ssm = new AWS.SSM();
const elasticsearch = require('elasticsearch');
const awsHttpClient = require('http-aws-es');

var jwt = require('jsonwebtoken');
const fs = require('fs');

// const mulesoftHost ='https://esb-qa.asu.edu/api/v1/change-major/';
// const userName="34ac07437b9948cbba611d360a85cf7d";
// const passWord="fEB54293f8534C67acEDE95B622EB152";

// const dsHost = "https://webapp4.asu.edu/programs/XmlRpcServer";
// const method = "eAdvisorDSFind.findAllDegreesWithLessFields";
// const method="eAdvisorDSFind.findDegreesByFirstLetter";
// const method="eAdvisorDSFind.findDegreeByAcadPlanMapArray";
// const params = ["NHHSCBS"]; //an array containing one element, the number 5
// const format = "xml"; //could also be "json"

// const xmlrpc = require("davexmlrpc");


// const elasticHost = "https://search-programs-elasticsearch-dev-mf5qi7rm5hgr64d2hj6buahlzq.us-west-2.es.amazonaws.com";


// var sesAccessKey = 'changemajor_app'
// var sesSecretKey = '!matmomgg1020'




exports.handler =  function(event, context, callback) {
    
    var cert = fs.readFileSync('pk.pem','utf-8'); 
    console.log("cert=" + cert);
    
    var token = event.authorizationToken;
    console.log("token=" + token);
    
    var authenticated = false;
    
    jwt.verify(token, cert,{ algorithms: ['RS256'] }, (err, decodedToken) => 
    {
        console.log("new code")
      if (err || !decodedToken)
      {
       console.log("denied");
        authenticated=false;
      }else{
          console.log("yeyyyy2");
          authenticated=true;
      }

  })
  
  console.log("authenticated = " + authenticated);
  
  if(authenticated==true){
       let params = {
        Path: process.env.CHANGEMAJOR_PARAMETER_PATH,
        Recursive: true,
        WithDecryption: true
    };
    
    if (context && context.invokedFunctionArn) {

        // Try to split the arn using ':''.
        console.log("path=" + process.env.CHANGEMAJOR_PARAMETER_PATH);
        
        let arnList = process.env.CHANGEMAJOR_PARAMETER_PATH.split("/");
        
        let arnLastItem = arnList[arnList.length - 1];
        
        console.log("CHANGEMAJOR_mulesoft_connector: context.invokedFunctionArn last item split on colon: " + arnLastItem);
        
        let environments = ["dev", "qa", "prod"];
        
        if (environments.includes(arnLastItem)) {
            console.log("orientation_mulesoft_connector: Found environment alias:", arnLastItem);
        }
    }
    
    
     ssm.getParametersByPath(params, function(err, result) {
        //  console.log("get parameter");
         
      if (!err && result.Parameters) {
         
         let muleConfig = {};
            let muleParams = result.Parameters;
            for (var i = 0; i < muleParams.length; i++) {
                switch (muleParams[i].Name) {
                    case process.env.CHANGEMAJOR_PARAMETER_PATH + '/mulesoft/url':
                        // console.log("parameter value=" + muleParams[i].Value);
                        muleConfig.mule_baseUrl = muleParams[i].Value; 
                        break;
                    case process.env.CHANGEMAJOR_PARAMETER_PATH + '/mulesoft/username':
                        // console.log("parameter value=" + muleParams[i].Value);
                        muleConfig.mule_user = muleParams[i].Value;
                        break;
                    case process.env.CHANGEMAJOR_PARAMETER_PATH + '/mulesoft/password':
                        // console.log("parameter value=" + muleParams[i].Value);
                        muleConfig.mule_password = muleParams[i].Value;
                        break;
                    case process.env.CHANGEMAJOR_PARAMETER_PATH + '/elasticsearch/url':
                        // console.log("parameter value=" + muleParams[i].Value);
                        muleConfig.elastic_baseUrl = muleParams[i].Value;
                        break;
                    case process.env.CHANGEMAJOR_PARAMETER_PATH + '/elasticsearch/username':
                        // console.log("parameter value=" + muleParams[i].Value);
                        muleConfig.elastic_user = muleParams[i].Value;
                        break;
                    case process.env.CHANGEMAJOR_PARAMETER_PATH + '/elasticsearch/password':
                        // console.log("parameter value=" + muleParams[i].Value);
                        muleConfig.elastic_password = muleParams[i].Value;
                        break;
                    case process.env.CHANGEMAJOR_PARAMETER_PATH + '/smtp/username':
                        // console.log("parameter value=" + muleParams[i].Value);
                        muleConfig.smtp_user = muleParams[i].Value;
                        break;
                    case process.env.CHANGEMAJOR_PARAMETER_PATH + '/smtp/password':
                        // console.log("parameter value=" + muleParams[i].Value);
                        muleConfig.smtp_password = muleParams[i].Value;
                        break;
                }
            }
            
            var api = event.api;
            // var api="degreesearch";
            // var api = "student-major";
            
            switch (api) {
              case 'student-major':
                    var asurite = event.asurite;
                    // var asurite = "kgrivers";
                    var mulesoftUrl = muleConfig.mule_baseUrl + api + "?id=" + asurite;
                    console.log("get student major : " + mulesoftUrl);
                  
                 
                    var request = require('request'),
                    username=muleConfig.mule_user,
                    password = muleConfig.mule_password,
                    url = mulesoftUrl,
                    auth = "Basic " + new Buffer(username + ":" + password).toString("base64");
                
            
                    request(
                        {
                            url : url,
                            json: true,
                            headers : {
                                "Authorization" : auth
                                
                            }
                        },
                        function (error, response, body) {
                            // Do more stuff with 'body' here
                            callback(null,body);
                        }
                    );
            
                  break;
                  
                  case 'get-email':
                    var plancode = event.plancode;
                    // var asurite = "kgrivers";
                    mulesoftUrl = muleConfig.mule_baseUrl + "email" + "?plancode=" + plancode;
                    console.log("get email for : " + plancode);
                  
                 
                    var request = require('request'),
                    username=muleConfig.mule_user,
                    password = muleConfig.mule_password,
                    url = mulesoftUrl,
                    auth = "Basic " + new Buffer(username + ":" + password).toString("base64");
                
            
                    request(
                        {
                            url : url,
                            json: true,
                            headers : {
                                "Authorization" : auth
                                
                            }
                        },
                        function (error, response, body) {
                            // Do more stuff with 'body' here
                            callback(null,body);
                        }
                    );
            
                  break;
                  
                  // case 'degreesearch':
                  //     console.log("get plans from Degree search web services");
                      
                      
      
      
                  //     var params = event.params;
                  //     // var params = ['A','2207'];
                  //     xmlrpc.client(dsHost, method, params, format, function (err, data) {
                  //     if (err) {
                  //       console.log("err.message == " + err.message);
                  //     } else {
                  //       // console.log(JSON.stringify(data));
                  //       callback(null,data);
                  //     }
                  //   });
                  //  break; 
                   
                    case 'elasticsearch':
                        var params = event.params;
                        let client = elasticsearch.Client({
                          host: muleConfig.elastic_baseUrl,
                          connectionClass: awsHttpClient,
                          amazonES: {
                              region: 'us-west-2',
                              credentials: new AWS.Credentials(muleConfig.elastic_user, muleConfig.elastic_password)
                          }
                      });
                      
                      client.search({
                          index: 'program-undergrad-false',
                          type: 'asuPrograms',
                          body: {
                              _source: params,
                              size: '1000',
                              query: {
                                  match_all: {
                                      // body: 'elasticsearch'
                                  }
                              }
                          }
                      })
                      .then(res => callback(null,res.hits.hits));
                    break; 
                    
                    case 'send-email':
                        	var nodemailer = require('nodemailer');
                          	var smtpTransport = require('nodemailer-smtp-transport');
                        
                          	var transporter = nodemailer.createTransport(smtpTransport({
                        	    host: 'smtp.asu.edu',
                                port: 587,
                                secure: false, // Activate TLS/STARTTLS
                            
                        	    auth: {
                        	        user: muleConfig.smtp_user,
                        	        pass: muleConfig.smtp_password 
                        	    }
                          	}));
                        
                        
                          	var text = event.bodyText;
                          	var subject = event.subject;
                          	var fromEmail = event.fromEmail;
                          	var toEmail = event.toEmail;
                        
                          	var mailOptions = {
                        	    from: fromEmail,
                        	    to: toEmail,
                        	    //bcc: '<bcc email addres>',
                        	    subject: subject,
                        	    html: text
                          	};
                        
                          	transporter.sendMail(mailOptions, function(error, info){
                              if(error){
                                const response = {
                                  statusCode: 500,
                                  body: JSON.stringify({
                                    error: error.message,
                                  }),
                                };
                                callback(null, response);
                              }
                              const response = {
                                statusCode: 200,
                                body: JSON.stringify({
                                  message: `Email processed succesfully!`
                                }),
                              };
                              callback(null, response);
                            });
                            
                            break; 
                    
            }
      }
        else {
            console.log("error getting parameters from ssm.");
            context.fail("error getting parameters from ssm.")
        }
      
     });
  }

}

