const cifs = ['45992391__subsidiary_1'];

async function testCIF(cif) {
  const email = 'costin.damasaru@gmail.com';
  const token = '001|1bd60fc9905762a534a48bd76cc487c5';
  const credentials = `${email}:${token}`;
  const encoded = Buffer.from(credentials).toString('base64');
  const authHeader = `Basic ${encoded}`;

  const url = new URL('https://ws.smartbill.ro/api/invoice');
  url.searchParams.append('cif', cif);
  url.searchParams.append('seriesname', '');
  url.searchParams.append('number', '');
  url.searchParams.append('clientCif', '');
  url.searchParams.append('clientName', '');
  url.searchParams.append('issueDate', '2026-01-01');
  url.searchParams.append('issueEndDate', '2026-03-27');

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Authorization: authHeader,
        'Accept': 'application/xml',
      },
    });

    const body = await response.text();
    console.log(`CIF: ${cif}`);
    console.log(`Status: ${response.status} ${response.statusText}`);
    console.log(`Raw Response: ${body}`);
    console.log('---');
  } catch (error) {
    console.log(`CIF: ${cif}`);
    console.log(`Error: ${error.message}`);
    console.log('---');
  }
}

async function testAllCIFs() {
  for (const cif of cifs) {
    await testCIF(cif);
  }
}

testAllCIFs();