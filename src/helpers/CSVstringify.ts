const CSVstringify = async (data: any[]) => {
  let result = '';
  if (data.length > 0) {
    let header = Object.keys(data[0]);
    result += header.join(',') + '\n';
    data.slice(1).forEach(item => {
      result += Object.values(item).join(',') + '\n';
    });
  }
  return result;
};

export default CSVstringify;
