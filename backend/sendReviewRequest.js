const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient({region: 'us-east-1'});

exports.handler = (event, context, callback) => {
  var data = JSON.parse(event.body);

  //reviewID = uuid of review request
  var reviewID = data.review_id; 
  //artist related data
  var imageName = data.art_title;
  var artistName = data.artist_name;
  var artistID = data.sub;
  var artistEmail = data.artist_email;
  var artDescription = data.descript;
  var reviewDate = data.upload_date;
  var sourceKey = data.image_key; //s3 image key
  var url = "https://s3.amazonaws.com/myapp-20181030214040-deployment/public/" + sourceKey;
  
  //business related data
  var businessName = data.businessName;
  var businessEmail = data.businessEmail;
  var businessID = data.businessID;
  
  //data relating to responses
  var replied = false;
  var repliedDate = "";
  //var response = data.response;
  var refunded = 0;
  var submittedWithFreeCredit = '';

  var params = { 
    TableName: 'reviewRequest',
    Item:{
      'businessId': businessID, //primary key
      'reviewID': reviewID,    //sort key
      'artwork':{
        'artTitle': imageName,
        'artistID': artistID,
        'artistName': artistName,
        'artistEmail': artistEmail,
        'description': artDescription,
        'url': url
      },
      'business':{
        'businessEmail': businessEmail,
        'businessName': businessName,
      },
      'readByArtist': false,
      'refunded': refunded,
      'replied': false
      }

    }
    docClient.put(params, function(err, data){
      if(err){
        callback(err);
      }
      else{
        callback(null, data)
      }
    });
}
    