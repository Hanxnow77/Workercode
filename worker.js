addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  // Parse the URL
  const url = new URL(request.url);
  const path = url.pathname;

  // Get the user's email from the request headers
  const email = request.headers.get('Cf-Access-Authenticated-User-Email');

  // Handle /secure path
  if (path === '/secure') {
    // Get the timestamp, and country
    const timestamp = new Date().toISOString();
    const country = request.cf.country.toLowerCase(); // Convert country code to lower case

    // Create the HTML response
    const html = `${email} authenticated at ${timestamp} from <a href="/secure/${country}">${country}</a>`;

    // Return the response
    return new Response(html, {
      headers: { 'content-type': 'text/html;charset=UTF-8' },
    });
  }

  // Handle /secure/{country} path
  if (path.startsWith('/secure/')) {
    // Get the country from the path and convert to lower case
    const country = path.split('/')[2].toLowerCase();

    // Get the flag from the R2 bucket
    const flagObject = await MY_BUCKET.get(`${country}.png`);

    // If the flag object exists, return the image response
    if (flagObject) {
      return new Response(flagObject.body, {
        headers: { 'content-type': 'image/png' },
      });
    }

    // If the flag object does not exist, return a 404 response
    return new Response('Not found', { status: 404 });
  }

  // Return 404 for other paths
  return new Response('Not found', { status: 404 });
}
