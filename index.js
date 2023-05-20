const express = require('express');
const { createProxyMiddleware} = require('http-proxy-middleware');
const btoa = require('btoa');
const app = express();
const bodyParser = require('body-parser')
const cors = require('cors')
/* This is where we specify options for the http-proxy-middleware
 * We set the target to appbase.io backend here. You can also
 * add your own backend url here */
const options = {
    target: 'https://localhost:9200/',
	secure: false,
    changeOrigin: true,
    onProxyReq: (proxyReq, req) => {
        proxyReq.setHeader(
            'Authorization',
            `Basic ${btoa('reactive:password')}`
        );
        /* transform the req body back from text */
        const { body } = req;
        if (body) {
            if (typeof body === 'object') {
                proxyReq.write(JSON.stringify(body));
            } else {
                proxyReq.write(body);
            }
        }
    }
}

app.use(cors());

/* Parse the ndjson as text */
app.use(bodyParser.text({ type: 'application/x-ndjson' }));

/* This is how we can extend this logic to do extra stuff before
 * sending requests to our backend for example doing verification
 * of access tokens or performing some other task */
app.use((req, res, next) => {
    const { body } = req;
    console.log('Verifying requests ✔', body);
      // After this we call next to tell express to proceed
     // to the next middleware function which happens to be our
    // proxy middleware 
    next();
})

const sortFunction = (req,res)=>{
console.log(req,res);

}


/* Here we proxy all the requests from reactivesearch to our backend */
app.use('*',createProxyMiddleware(options),sortFunction);

app.listen(7777, () => console.log('Server running at http://localhost:7777 🚀'));
