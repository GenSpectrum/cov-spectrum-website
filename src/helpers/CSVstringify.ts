const CSVstringify = (data: any[]) => {
  let result = '';
  if (data.length > 0) {
    result += Object.keys(data[0]).join(',') + '\n';
    data.slice(1).forEach(item => {
      result += Object.values(item).join(',') + '\n';
    });
  }
  return result;
};

export default CSVstringify;
