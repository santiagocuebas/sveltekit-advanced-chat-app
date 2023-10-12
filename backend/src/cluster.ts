import cluster from 'cluster';
import { createServer } from 'http';
import os from 'os';
import { setupMaster } from '@socket.io/sticky';
import { __dirname } from './config.js';

// Setup cluster
const server = createServer();
const numCPUs = os.cpus().length;

console.log(`The total number of CPUs is ${numCPUs}`);
console.log(`Primary pid=${process.pid}`);

// Setup sticky sessions
setupMaster(server, { loadBalancingMethod: 'least-connection' });

// Open worker
cluster.setupPrimary({
	exec: __dirname + '/index.js',
	serialization: 'advanced'
});

for (let i = 0; i < numCPUs; i++) {
	cluster.fork();
}

// Close worker
cluster.on('exit', (worker) => {
	console.log(`Worker ${worker.process.pid} has been killed`);
	console.log('Starting another worker');
	cluster.fork();
});
