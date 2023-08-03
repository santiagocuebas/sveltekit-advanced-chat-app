import cluster from 'cluster';
import { createServer } from 'http';
import os from 'os';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { setupMaster } from '@socket.io/sticky';

const server = createServer();
const __dirname = dirname(fileURLToPath(import.meta.url));
const numCPUs = os.cpus().length;

console.log(`The total number of CPUs is ${numCPUs}`);
console.log(`Primary pid=${process.pid}`);

// Setup sticky sessions
setupMaster(server, { loadBalancingMethod: 'least-connection' });

cluster.setupPrimary({
	exec: __dirname + '/index.js',
	serialization: 'advanced'
});

for (let i = 0; i < 1; i++) {
	cluster.fork();
}

cluster.on('exit', (worker) => {
	console.log(`Worker ${worker.process.pid} has been killed`);
	console.log('Starting another worker');
	cluster.fork();
});
