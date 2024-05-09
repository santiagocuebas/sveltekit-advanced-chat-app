import { setupMaster } from '@socket.io/sticky';
import cluster from 'cluster';
import { createServer } from 'https';
import os from 'os';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { PORT } from './config.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const cpuCount = os.cpus().length;

const httpServer = createServer();

// Setup sticky sessions
setupMaster(httpServer, { loadBalancingMethod: 'least-connection' });

httpServer.listen(PORT);

console.log(`The total number of CPUs is ${cpuCount}`);
console.log(`Primary pid=${process.pid}`);

cluster.setupPrimary({
	serialization: 'advanced',
	exec: __dirname + '/index.js'
});

for (let i = 0; i < cpuCount; i++) {
	cluster.fork();
}

cluster.on('exit', worker => {
	console.log(`Worker ${worker.process.pid} has been killed`);
	console.log('Starting another worker');
	cluster.fork();
});
