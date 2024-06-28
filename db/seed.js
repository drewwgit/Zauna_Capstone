const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
    console.log("Seeding Database")


    await prisma.user.create({
        data: {
            name: "Drew",
            email: "drewseph@gmail.com",
            password: "test"
        }
    }); 

    await prisma.menuItem.create({
        data: {
            name: "Blueberry Cliff Bar",
            description:"This is a great nutrient dense snack for your workout or recovery!",
            price: 3.99, 
            available: true
        }
    })
}


main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })