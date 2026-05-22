

I want to explain what am thinking and let us think it through and have a plan, go through my code end to end before writing the plan so that you can know the current state of things


We have:

Connect Classes
Discipleship Classes 
Crosspoint which are the Home Church
Member

So how do you become a member at Ruach:
- You are a legacy member the ones who were from the beginning
- After compeleting Connect Class (Here is where you understand the vision and direction of the church)

Let us go through the journey of a guest to a member

You are new guest at Ruach and you have decided to come and join the church 

We pick your details at church and we tell if you want to continue being a member you have to do the connect class for you to understand the vision and direction of the church


For the New One:

After we share with you a link to register for connect, now we have some few checks here make sure we display an upcoming Cohort not the ongoing one if it has started, if the teacher has not added one or the admin no problem inform the person that they will notified once one is put in place, now we have picked their details and on the database level we know either if they have a cohort or none, for the ones who have picked a cohort we will notify them when it starts and everything for the one that has none when a cohort is made available inform them so when they log back in they will see the cohort available and select it, so this people can see a dashboard with nothing until the cohort is available and they start it

So the dashboard they will see is the one that has only the Connect and its details

And when doing the check make sure we have the following working perfectly fine:
- A teacher can create a class session and people can join in just like google meet, we are avoiding to use third parties and only work with this in house, the link can be shared to wherever but when someone wants to join they have to login if not and the system checks if they belong to that cohort, if they are logged in and they stay for a certain amount of time the system logs them as attended

- A teacher should be able to create an exam, add questions and answers (sometimes the answers are more than one so they say what the answer)

- the student can take the exam in a limited time frame and they should not get out, the teacher sets the timer, just every feature examinica uses

-  and the features of google classroom also availble

Inshort we make it very simple for the teacher and the student, instead of the teacher using mulitiple systems (zoom, examinicaa, google classroom we are in one system and able to do it all)

- they can share resources and the student can download them, they trigger wanring to lazy students who are not attending clasess

- We can gamify a bit of the student part, where we can have points for the things and celebrations a pop up appears after a certain achievement, e.g after they join the cohort, after attending a class, doing and exam, some scores can be tied to what they get on an exam

All of this Connect features also apply to Discileship for Discleship it has 3 levels KDC 1, 2 and 3 but the teachers can just whatever they want

Now once done with the connect and teacher confirms the ones who have graduated or passed

They will be now given a member by the system and after this there status changes on the database to member

Now we will have a member dashboard but if you are you are joining as a member for the first time we wil have a few question, we have 3 types of people here who might click to login on the member dashboard:

A guest
A graduate of connect
A legacy member (who did connect long time ago before the system, or those from the beginning)

Now if someone is Joining they will be asked the following questions:

Have you done connect?

If No, they will be redirected to the Connect Portal and told why

if Yes, they pick the Cohort, (the past Cohorts will be added by the teacher or admin, so make sure we have a place for this)

After picking the cohort will ask them if they have done Discipleship and they say either Yes and pick the Cohort or No I dont want to, or I want to do it, for those who say they want to do it (the discipleship portal will be added in their dachboard and they will see it)

After that now we go to the Crosspoint, where will ask them of they have joined a crosspoint:

If No, I want to, take them to select their Zones, then after the Zones they will now select the exact area where they live and see the available Crosspoints, they will click Join and after they will also see a Whatsapp link to that Crosspoint and make sure their database now picks there exact crosspoint (in the dashboard make it possible for someone to switch a Crosspoint)

If Yes they will search for their exact Crosspoint and Pick it and the database will also register this

If No I dont want to, they will be taken to the Next

Now for the Last Step is for them to add their details, Full Name, whatsapp Phone number, email for the sake of attendance and passowrd and then they can choose to get an OTP either on the phone through SMS or Email, I will give the config details for both below:

After they are in the dashboard, immediately they enter the dashboard they will prompted with a simpe review Questionnaire, how they rate the following Teachings, Worshipping and Praise and the other things like any complains and impressions such things and they can submit the feedback, they can close the form if they want but it will go on the bottom left if they close from here just do a way with it


Now for those who here before the Connect Class came to be, am not sure how we will filter them out but add something for them, after they pick they will be asked what Year did they join and then they are asked about the Discipleship followied by the crosspoint and then they add their details, now for them remember they dont have a Member Number so create for them one and then tell them that there account is under verification by the church admin, if the admin cancels there request they cant access the things on the dashboard they will have this message to reach out to the admin on whatsapp to confirm their details so that they are confoirm them

They can still access the member dashboard before they are verefied,

Member dashboard can have the folloing, they can see the Discipleship if they have are in one

They can request a prayer, they can see upcoming events, announcements, sermons, their notes, there crosspoints and their modules, we can have a suggestion box and other things I have not mentioned

Let the admin be able to do all the things we talked about

And write any SQL changes on the supabase schema I have not yet run it

So what I want you to do is to assume roles e.g teacher guest member student, and go through each of their journeys each one and check if each of the functionality is working

Also make sure you have the plan for the following:

I can add events on the control panel and even a calendar and it will appear on the events page and some on the homepage and even on the dashboards of the member, on the Events page can you 2 views, one view is for seeing the events wiht the cards the other is to view all the Events on the Calendar, also have the ability to add an event to google or apple calendar and if an event is finished remove it from the site

Also for the Sermons I like how you have hardcoded the ones we have, the ideas I had for sermons is this I add the sermon through the Control Panel, the youtube link, and the tile(this will create a slug) and below a well added AI generated Sermon Notes

Now when someone gooes to the Sermon part and they click on a sermon it open the slug (the idea is for SEO purposes) and we have this page with the video on the top and also I have remember we also have this sermons on spotify so we can also add the link add it will appear so sermon can listen watch and also reead

Now since I have not added the Sermons we can still have the hard coded ones but once I add a sermon we will start having this ones here, you can redesign this page to look like Netflix with big bold hero and the rest of the content aligned well below, we can have them categorized by Series and Categories e.g Faith (Make sure we are able to add this while creating the Sermon, I can create a Series and a Category or pick from the ones we already have)

Asking me the necessary questions needed so that we can make this thing work well

SMS and Email Configuration:
Send SMS

Postman Collection
Use this api to send smses.

URL - http://167.172.14.50:4002/v1/send-sms

METHOD - POST

CONTENT-TYPE - None

Response : JSON

Request Parameters

Name	Desc	Type	Option
apiClientID	API Client ID (Provided above)	Numeric	Mandatory
key	API Key (Provided above)	String	Mandatory
secret	API Secret (Provided above)	String	Mandatory
txtMessage	SMS message	String	Mandatory
MSISDN	Phone Number	Numeric	Mandatory
serviceID	Service ID (Provided above) - Default 1	Numeric	Optional
Response Parameters

Name	Desc	Type	Option
status	Status of the request (222 - success, 666 - error)	Numeric	Mandatory
status_message	Description of status	String	Mandatory
unique_id	Unique Message ID	String	Optional
credits	SMS Credits Balance	Numeric	Optional



 const axios = require('axios');

const url = 'http://167.172.14.50:4002/v1/send-sms';

const API_CLIENT_ID = 12XX;
const API_KEY = 'F3iwqdsfytAmoHe';
const API_SECRET = 'JoqkXuMyYTNKMlPRmrPQokSKYY0oChQ';
const SERVICE_ID = 12XX;

const postData = new URLSearchParams({
  apiClientID: API_CLIENT_ID,
  key: API_KEY,
  secret: API_SECRET,
  txtMessage: 'test',
  MSISDN: '254712345678',
  serviceID: SERVICE_ID
}).toString();

axios.post(url, postData, {
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  }
})
  .then(response => {
    console.log(response.data);
  })
  .catch(error => {
    console.error(error);
  });


  Emails

Postman Collection
Use this api to send emails between your associated accounts.

URL - https://app.bongasms.co.ke/api/send-bulk-email

METHOD - POST

Response - JSON

Request Parameters

Name	Description	Type	Option
apiClientID	API Client ID (Provided above)	Numeric	Mandatory
key	API Key (Provided above)	String	Mandatory
secret	Client ID you are transferring to	String	Mandatory
subject	Email subject	String	Mandatory
from	Sender email	String	Mandatory
to	recepient email	String	Mandatory
body	Email body	String	Optional
sender name	name of sender	String	Optional
recipient name	name of recepient	String	Optional
attributes	placeholders for the template html	json	Optional
cc	emails separated by a comma	String	Optional
bcc	emails separated by a comma	String	Optional
schedule	time in yyyy-mm-dd	String	Optional
Response Parameters

Name	Desc	Type	Option
status	Status of the request (222 - success, 666 - error)	Numeric	Mandatory
status_message	Description of status	String	Mandatory
batch_code	Code representing the batch of sent messages	String


```python 
import http.client

conn = http.client.HTTPSConnection("app.bongasms.co.ke")
payload = 'key=OnwyU5jV6dIb225&secret=n0WqOyhKsx2HiMAIcU5ag4A2zJsPej&apiClientID=92&subject=HELP%20ME%20GROW%20MY%20BUSINESS&from=helpmegrow%40.helpmegrow.com&to=brian.wachira%40helpmegrow.co&body=%3C!DOCTYPE%20html%3E%5Cn%3Chtml%3E%5Cn%3Chead%3E%5Cn%20%3Ctitle%3EHTML%20Email%20Example%3C%2Ftitle%3E%5Cn%3C%2Fhead%3E%5Cn%3Cbody%3E%5Cn%20%20%20%20%3Ch1%3EHello!%3C%2Fh1%3E%5Cn%20%3C%2Fp%3E%3Cp%3E%5B%25EMAIL%25%5D%20%20wants%20you%20to%20help%20them%20grow%20their%20business%3C%2Fbody%3E%5Cn%3C%2Fhtml%3E%0A&sender_name=helpmegrow%20website&recipient_name=INFO&attachments=&attributes=%7B%22EMAIL%22%3A%22%20jones%40gmail.com%22%2C%7D&cc=khelpmegrowi%40gmail.com%2C%20kehelpmegrowri%40gmail.com&bcc=kephelpmegrowkari%40gmail.com%2C%20rkhelpmegrowps47%40gmail.com&schedule=2023-09-10-13%3A00%3A00'
headers = {
  'Content-Type': 'application/x-www-form-urlencoded'
}
conn.request("POST", "/api/send-bulk-email", payload, headers)
res = conn.getresponse()
data = res.read()
print(data.decode("utf-8"))
 


 const axios = require('axios');

const url = 'https://app.bongasms.co.ke/api/send-bulk-sms';

const API_CLIENT_ID = 12XX;
const API_KEY = 'F3iwqdsfytAmoHe';
const API_SECRET = 'JoqkXuMyYTNKMlPRmrPQokSKYY0oChQ';
const SERVICE_ID = 12XX;

const postData = new URLSearchParams({
  apiClientID: API_CLIENT_ID,
  key: API_KEY,
  secret: API_SECRET,
  txtMessage: 'test',
  MSISDN: '254712345678,254712345678,2547123456 78,254712365678,254712345578,254712345478,254712341678,254712345278',
  serviceID: SERVICE_ID
}).toString();

axios.post(url, postData, {
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  }
})
  .then(response => {
    console.log(response.data);
  })
  .catch(error => {
    console.error(error);
  });