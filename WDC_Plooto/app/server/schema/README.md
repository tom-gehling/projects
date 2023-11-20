Use `service mysql start` to start the mysql server, and then you can run the script `./setup.sh` which will setup the schema & load in some test data.

To launch the project with an empty database, then use `mysql -u root < init.sql` and then `mysql -u root < schema.sql`