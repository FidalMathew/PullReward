const express = require('express');
const app = express();
const dotenv = require('dotenv');
dotenv.config();
const {isPRLinkedToIssueAndMerged, getCount} = require('./controller');
app.use(express.json());

const port = process.env.PORT || 3001;


// app start


app.get('/api', (req, res) => {
    res.json({ message: 'Hello from server!' });
}
);

app.post('/verifyPR', async(req,res)=>{
    const result = await isPRLinkedToIssueAndMerged(req.body.prUrl, req.body.issueUrl);
    // console.log(result, 'result');
   return res.json({result}).status(200); 
    // return res.json({result: 'success'}).status(200);
})

app.get('/getCount', async(req,res)=>{
    const result = await getCount();
    return res.json({result}).status(200);
})   

app.listen(port, () => {
    console.log('Server listening on port ' + port);
} );

