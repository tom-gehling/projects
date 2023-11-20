echo "🚀 Setting up database..."
echo "DROP DATABASE IF EXISTS db_name;" | mysql -u root
echo "🔔 Database dropped"
mysql -u root < init.sql
echo "✅ Database initialized"
mysql -u root < schema.sql
echo "✅ Schema created"
mysql -u root < test_seed.sql
echo "✅ Test data seeded"
mysql -u root < assignments.sql
echo "✅ Users randomly assigned"