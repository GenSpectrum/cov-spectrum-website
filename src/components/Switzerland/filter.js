var fs = require('fs');
const data = require('./PLZ10.json');

//file generated not readable, but might be useful in future

console.log('length is ', data.features.length);

data.features = data.features.filter(feature => {
  return feature.geometry !== null;
});

data.features = data.features.map(feature => {
  const props = feature.properties;
  delete props.OS_UUID;
  delete props.STATUS;
  delete props.INAEND;
  delete props.ZUSZIFF;
  return feature;
});

fs.writeFile('./src/components/Switzerland/PLZ.json', JSON.stringify(data), err => {
  if (err) {
    console.log('error', err);
  } else {
    console.log('Wrote file ');
  }
});
