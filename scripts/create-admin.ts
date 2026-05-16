// Run: node scripts/create-admin.js
// Ye script admin password hash generate karta hai

import { createHash } from 'node:crypto'

const email = process.env.ADMIN_EMAIL || 'admin@kiranalink.in'
const password = process.argv[2] || 'admin123'

const hash = createHash('sha256').update(password).digest('hex')

console.log('\n✅ Admin Setup\n')
console.log('.env mein ye values daalo:\n')
console.log(`ADMIN_EMAIL="${email}"`)
console.log(`ADMIN_PASSWORD_HASH="${hash}"\n`)
console.log(`Login URL: /admin-secret-login`)
console.log(`Password: ${password}\n`)
