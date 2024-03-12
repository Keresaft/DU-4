import http from 'http'
import path from 'path'
import chalk from 'chalk'
import fs from 'fs/promises'

const port = 3000

async function readOrCreateTextFile(action = 'read') {
  //odkaz na složku
  const filePath = path.join('public', 'text.txt');
  try {
    let fileData = await fs.readFile(filePath, 'utf-8');
    let number = parseInt(fileData);

    if (isNaN(number)) {
      throw new Error('File content is not a number');
    }

    if (action === 'increase') {
      number++;
    } else if (action === 'decrease') {
      number--;
    }

    await fs.writeFile(filePath, number.toString(), 'utf-8');
    return number;
  } catch (error) { //založení složky
    if (error.code === 'ENOENT') {
      await fs.writeFile(filePath, '0', 'utf-8');
      return 0;
    } else {
      throw new Error('Error reading text.txt');
    }
  }
}

async function handleNumberRequest(res, action) {
  try {
    const fileData = await readOrCreateTextFile(action);
    res.statusCode = 200; //OK
    res.write(fileData.toString());
  } catch {
    res.statusCode = 500; // Server error 
    res.write('500 - Server Error');
  }
  res.end();
}

const server = http.createServer(async (req, res) => {
  // Define routes
  const routes = {
    '/read': async () => {
      await handleNumberRequest(res, 'read');
    },
    '/increase': async () => {
      await handleNumberRequest(res, 'increase');
    },
    '/decrease': async () => {
      await handleNumberRequest(res, 'decrease');
    },
  };

  // Get the requested route from the URL
  const requestedRoute = req.url.split('?')[0]; // Remove query parameters
  const routeHandler = routes[requestedRoute];

  if (routeHandler) {
    await routeHandler();
  } else {
    res.statusCode = 404; // Not found
    res.write('404 - Not found - Page does not Exist');
    res.end();
  }
});

server.listen(port, () => {
  console.log(chalk.green(`Server listening at http://localhost:${port}`));
});
