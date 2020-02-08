const express = require('express');
const router = express.Router();
const url = require('url');
const fs = require('fs');
const util = require('util');
const request = require('request-promise-native');

router.get('/', (req, res) => {
  res.render('index');
});

router.get('/pnc', async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (!fs.existsSync('./cache')) {
    await util.promisify(fs.mkdir)('./cache');
  }
  if (!req.query.hasOwnProperty('u'))
    return res.json({ ok: 0, payload: 'empty url' });
  
  if (fs.existsSync(`./cache/${req.query.u}`)) {
    const data = await util.promisify(fs.readFile)(`./cache/${req.query.u}`);
    res.write(data);
    res.end();
    return;
  }
  const raw = req.query.u.replace(/\-/g, '+').replace(/\_/g, '/').replace(/\!/g, '=');
  const decodedStr = Buffer.from(raw, 'base64').toString();
  const urlInfo = url.parse(decodedStr);
  if (!urlInfo.host) 
    return res.json({ ok: 0, payload: 'invalid url' });
  const ua = req.query.hasOwnProperty('fakeUA') ? 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36 Edg/79.0.309.71' : req.useragent.source;
  console.log('request', decodedStr);
  const response = await request.get(decodedStr, {
    headers: {
      'User-Agent': ua
    },
    resolveWithFullResponse: true,
    encoding: null
  });
  await util.promisify(fs.writeFile)(`./cache/${req.query.u}`, response.body);
  // res.setHeader('Content-Type', response.caseless.get('content-type'));
  res.write(response.body);
  res.end();
});

router.get('/p', async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (!req.query.hasOwnProperty('u'))
    return res.json({ ok: 0, payload: 'empty url' });
  const raw = req.query.u.replace(/\-/g, '+').replace(/\_/g, '/').replace(/\!/g, '=');
  const decodedStr = Buffer.from(raw, 'base64').toString();
  const urlInfo = url.parse(decodedStr);
  if (!urlInfo.host) 
    return res.json({ ok: 0, payload: 'invalid url' });
  const ua = req.query.hasOwnProperty('fakeUA') ? 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36 Edg/79.0.309.71' : req.useragent.source;
  const response = await request.get(decodedStr, {
    headers: {
      'User-Agent': ua
    }
  });
  if (req.query.hasOwnProperty('raw')) {
    res.end(response);
    return;
  }
  res.json({
    ok: 1,
    payload: response
  });
});

module.exports = router;
