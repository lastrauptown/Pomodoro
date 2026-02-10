import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    const session = await prisma.session.create({
      data: {
        type: 'work',
        duration: 1500, // 25 minutes
        completed: true,
        startTime: new Date(Date.now() - 1500 * 1000),
        endTime: new Date(),
        pauseCount: 0
      },
    })
    console.log('Created sample session:', session)
  } catch (e) {
    console.error(e)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
