// import { setupMaster } from '@socket.io/sticky';
import { setupPrimary } from '@socket.io/cluster-adapter';
import cluster from 'cluster';
// import { createServer } from 'http';
import os from 'os';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { PORT } from './config.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const cpuCount = os.cpus().length;

console.log(`The total number of CPUs is ${cpuCount}`);
console.log(`Primary pid=${process.pid}`);

cluster.setupPrimary({ exec: __dirname + '/index.js' });

for (let i = 0; i < cpuCount && i < 3; i++) {
	cluster.fork({ PORT: Number(PORT) + i });
}

cluster.on('exit', worker => {
	console.log(`Worker ${worker.process.pid} has been killed`);
	console.log('Starting another worker');
	cluster.fork({ PORT: Number(worker.process.pid ?? PORT) });
});

setupPrimary();

// const httpServer = createServer();

// // Setup sticky sessions
// setupMaster(httpServer, { loadBalancingMethod: 'least-connection' });

// httpServer.listen(PORT, () => console.log('Server listening at port', PORT));
