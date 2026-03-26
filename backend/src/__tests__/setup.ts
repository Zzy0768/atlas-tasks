// Runs before any test file — sets the test DB URL before Prisma client loads
process.env.DATABASE_URL = 'file:../prisma/test.db'
process.env.JWT_SECRET = 'test-secret'
process.env.JWT_EXPIRES_IN = '1h'
