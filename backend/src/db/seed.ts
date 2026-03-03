import { db } from './index.js'
import { roles, users } from './schema.js'
import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'

// Создаем роли по умолчанию
const defaultRoles = [
  { code: 'ADMIN', name: 'Администратор' },
  { code: 'USER', name: 'Пользователь' },
  { code: 'VIEWER', name: 'Наблюдатель' },
]

console.log('Создание ролей...')
for (const role of defaultRoles) {
  const existing = db.select().from(roles).where(eq(roles.code, role.code)).get()
  if (!existing) {
    db.insert(roles).values(role).run()
    console.log(`Роль "${role.name}" создана`)
  }
}

// Создаем администратора по умолчанию
const adminRole = db.select().from(roles).where(eq(roles.code, 'ADMIN')).get()

if (adminRole) {
  const existingAdmin = db.select().from(users).where(eq(users.email, 'admin@polanet.local')).get()
  
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash('admin123', 10)
    
    db.insert(users).values({
      lastName: 'Администратор',
      firstName: 'Системный',
      middleName: '',
      email: 'admin@polanet.local',
      phone: '',
      passwordHash,
      roleId: adminRole.id,
    }).run()
    
    console.log('Пользователь admin@polanet.local создан (пароль: admin123)')
  }
}

console.log('База данных успешно инициализирована!')
