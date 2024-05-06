import { setupPrimary } from '@socket.io/cluster-adapter';
import { setupMaster } from '@socket.io/sticky';
import cluster from 'cluster';
import os from 'os';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import server from './app.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const cpuCount = os.cpus().length;

// Setup sticky sessions
setupMaster(server, { loadBalancingMethod: 'least-connection' });

// Setup connections between the workers
setupPrimary();

console.log(`The total number of CPUs is ${cpuCount}`);
console.log(`Primary pid=${process.pid}`);

cluster.setupPrimary({
	serialization: 'advanced',
	exec: __dirname + '/index.js'
});

for (let i = 0; (i < cpuCount && i < 3); i++) {
	cluster.fork();
}

cluster.on('exit', (worker) => {
	console.log(`Worker ${worker.process.pid} has been killed`);
	console.log('Starting another worker');
	cluster.fork();
});
