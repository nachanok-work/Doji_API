const express = require('express');
const app = express();
const PORT = 80;

const csv = require('csv-parser')
const fs = require('fs')
const results = [];

fs.createReadStream('BTC-USD.csv')
  .pipe(csv())
  .on('data', (data) => results.push(data))
  .on('end', () => {
    //console.log(results);
  });

app.use(express.json())

app.listen(
    PORT,
    () => console.log(`It's alive on http://localhost:${PORT}`)
)

//is_doji = (open - close) / (high - low) < 0.10
const isDoji = (item) => {
  return ((item.Open - item.Close) / (item.High - item.Low)) < 0.1;
}

const getItemProperties = (item) => {
  return {
    open: Number(item.Open),
    close: Number(item.Close),
    high: Number(item.High),
    low: Number(item.Low),
  }
}

const findDoji = (type) => {
  if (type === "gravestone-doji")
  {
    const graveStones = results.filter(item => {
      if (!isDoji(item)) return false;
      const {open,close,high,low} = getItemProperties(item);
      const median = (open + close) * 0.5;
      const _result = (median < (0.25 * (high - low) + low));
      //console.log(`_result: ${_result} median: ${median} fomular: ${0.25 * (high - low)} open+close: ${(open + close)} typeof: ${typeof open} ${typeof close}`);
      return _result;
    })
    return {coin: `bitcoin`, type: type, dates: graveStones.map(item => item.Date)}
    //return {length: graveStones.length, graveStones};
  }
  else if (type === "long-legged-doji")
  {
    const longLegs = results.filter(item => {
      if (!isDoji(item)) return false;
      const {open,close,high,low} = getItemProperties(item);
      const median = (open + close) * 0.5;
      const _result = (median >= (0.25 * (high - low) + low) && median <= (0.75 * (high - low) + low));
      //console.log(`_result: ${_result} median: ${median} fomular: ${0.25 * (high - low)} open+close: ${(open + close)} typeof: ${typeof open} ${typeof close}`);
      return _result;
    })
    return {coin: `bitcoin`, type: type, dates: longLegs.map(item => item.Date)}
    //return {length: longLegs.length, longLegs};
  }
  else if (type === "dragonfly-doji")
  {
    const dragonflies = results.filter(item => {
      if (!isDoji(item)) return false;
      const {open,close,high,low} = getItemProperties(item);
      const median = (open + close) * 0.5;
      const _result = (median > (0.75 * (high - low) + low));
      //console.log(`_result: ${_result} median: ${median} fomular: ${0.25 * (high - low)} open+close: ${(open + close)} typeof: ${typeof open} ${typeof close}`);
      return _result;
    })
    return {coin: `bitcoin`, type: type, dates: dragonflies.map(item => item.Date)}
    //return {length: dragonflies.length, dragonflies};
  }
  // debug
  else if (type === "default")
  {
    return {length: results.length, results};
  }
  else if (type === "dojis")
  {
    const dojis = results.filter(item => {
      return isDoji(item);
    })
    return {length: dojis.length, dojis}
  }
  else
    return "Format error";
}

app.get('/doji/:type', (req, res) => {
    const {type} = req.params;
    res.status(200).send({
        result: findDoji(type)
    })
});