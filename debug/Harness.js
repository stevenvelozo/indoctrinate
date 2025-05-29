const libPath = require("path");

console.log("Fancy debug harness here.	Shame if it would get indoctrinated.");

let libIndoctrinate = require("../source/Indoctrinate-CLIProgram.js");

// The folder to read
let tmpInputFolder = `../docs/examples/monorepo/`;
tmpInputFolder = `${__dirname}/../docs/examples/book/`;
//tmpInputFolder = `${__dirname}/../docs/examples/data_model/`;
//tmpInputFolder = `${__dirname}/../docs/examples/document/`;
//tmpInputFolder = `${__dirname}/../../`;
//tmpInputFolder = `${__dirname}/../docs/examples/monorepo/`;
//tmpInputFolder = `${__dirname}/tmp/`;
//tmpInputFolder = `/Users/stevenvelozo/Code/tmp/scapa/DataRoom/`;
//tmpInputFolder = `/var/headlight_data_integration/walbec/Blend History/`
tmpInputFolder = libPath.resolve(tmpInputFolder);

// The folder to write documentation (and staged files) to
let tmpTargetOutputFolder = `${__dirname}/dist/`;
tmpTargetOutputFolder = libPath.resolve(tmpTargetOutputFolder);

libIndoctrinate.run(
	[
		"node",
		"Harness.js",
		"compile",
		"-d",
		tmpInputFolder,
		"-t",
		tmpTargetOutputFolder,
		"-c",
	]);
//libIndoctrinate.run(['node', 'Harness.js', 'extended_process', 'dist/indoctrinate_content_staging/Indoctrinate-Catalog-AppData.json' ]);
