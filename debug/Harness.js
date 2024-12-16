const libPath = require('path');

console.log('Fancy debug harness here.  Shame if it would get indoctrinated.');

let libIndoctrinate = require('../source/Indoctrinate-CLIProgram.js');

// The folder to read
let tmpInputFolder = `${__dirname}/../`;
//tmpInputFolder = `${__dirname}/../docs/examples/book/`;
//tmpInputFolder = `${__dirname}/../examples/data_model/`;
//tmpInputFolder = `${__dirname}/../examples/document/`;
//tmpInputFolder = `${__dirname}/../examples/monorepo/`;
tmpInputFolder = `${__dirname}/tmp/`;
tmpInputFolder = libPath.resolve(tmpInputFolder);

// The folder to write documentation (and staged files) to
let tmpTargetOutputFolder = `${__dirname}/dist/`;
tmpTargetOutputFolder = libPath.resolve(tmpTargetOutputFolder);

libIndoctrinate.run(['node', 'Harness.js', 'compile', '-d', tmpInputFolder, '-t', tmpTargetOutputFolder, '-c' ]);
//libIndoctrinate.run(['node', 'Harness.js', 'extended_process', 'dist/indoctrinate_content_staging/Indoctrinate-Catalog-AppData.json' ]);
