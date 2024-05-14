import { setupPrimary } from '@socket.io/cluster-adapter';
import cluster from 'cluster';
import os from 'os';
import { PORT } from './config.js';
import { __dirname } from './upload.js';

const cpuCount = os.cpus().length;

console.log(`The total number of CPUs is ${cpuCount}`);
console.log(`Primary pid=${process.pid}`);

cluster.setupPrimary({ exec: __dirname + '/index.js' });

for (let i = 0; i < cpuCount && i < 2; i++) {
	cluster.fork({ PORT: Number(PORT) + i });
}

cluster.on('exit', worker => {
	console.log(`Worker ${worker.process.pid} has been killed`);
	console.log('Starting another worker');
	cluster.fork({ PORT: Number(worker.process.pid ?? PORT) });
});

setupPrimary();
