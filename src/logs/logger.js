
const logger  = require('./logconfig')
const express = require('express');

const app = express();
const port = 3000;


app.use((req, res, done) => {
    logger.info('cest moi: ' + ' ' + req.originalUrl + ' ' + req.method)
    done()
})
const handler = (func) => (req, res) => {
    try {
        logger.debug('server.handler.begun');
        func(req, res, logger);
    } catch(e){
        logger.error('server.handler.failed');
        res.send('Oh no, something did not go well!');
    }
};

app.get('/success', handler((req, res) => { res.send('Yay!'); }))
app.get('/error', handler((req, res) => { throw new Error('Doh!'); }))
app.get('/info', handler((req, res) => { res.send('info info info') }))
app.listen(port, () => console.log(`Example app listening on port ${port}!`))


