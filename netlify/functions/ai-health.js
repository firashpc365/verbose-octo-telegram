exports.handler = async function (event) {
  if (event.httpMethod !== 'GET') return { statusCode: 405, body: 'Method Not Allowed' };
  return { statusCode: 200, body: JSON.stringify({ status: 'ok' }) };
};
