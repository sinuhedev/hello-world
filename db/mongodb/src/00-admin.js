// version
db.version();

// get config
db.adminCommand({ getCmdLineOpts: 1 });
