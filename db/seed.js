const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
    console.log("Seeding Database")

// seeding user test data 
    await prisma.user.createMany({
        data: [
        {
            name: "Drew",
            email: "drewseph@gmail.com",
            password: "test"
        },
        {
          name: "TestUser",
          email: "testuser@gmail.com",
          password: "test"
        },
        {
          name: "Hanna",
          email: "hanna@gmail.com",
          password: "test"
        }
        ]
}); 

// seeding gym booking data 

await prisma.gymBooking.createMany({
  data:[
    {
      userId: 1,
      date: new Date("2023-07-01T10:00:00Z"),
      timeSlot: "10:00 AM - 11:00 AM"
  },
  {
      userId: 2,
      date: new Date("2023-07-01T11:00:00Z"),
      timeSlot: "11:00 AM - 12:00 PM"
  }
  ]
});


// seeding sauna room data

await prisma.saunaRoom.createMany({
  data: [
    { roomNumber: 1 },
    { roomNumber: 2 },
    { roomNumber: 3 },
    { roomNumber: 4 },
    { roomNumber: 5 },
    { roomNumber: 6 },
    { roomNumber: 7 },
    { roomNumber: 8 },
    { roomNumber: 9 },
    { roomNumber: 10 }
  ]
})

// seeding sauna room booking data 

await prisma.saunaBooking.createMany({
  data: [
      {
          userId: 1,
          saunaRoomId: 1,
          date: new Date("2023-07-01T12:00:00Z"),
          timeSlot: "12:00 PM - 01:00 PM"
      },
      {
          userId: 2,
          saunaRoomId: 2,
          date: new Date("2023-07-01T01:00:00Z"),
          timeSlot: "01:00 PM - 02:00 PM"
      }
  ]
});

// seeding menu items 
await prisma.menuItem.createMany({
        data: 
        [
          {
            name: "Blueberry Cliff Bar",
            description:"This is a great nutrient dense snack for your workout or recovery!",
            price: 3.99, 
            available: true
        },
        {
          name: "Recharge Protein Shake",
          description:"A beautifully crafted shake destined to rejuvenate all of your muslces needs",
          price: 6.99, 
          available: true
        },
        {
          name: "Detox Ginger & Tumeric Shot",
          description:"A reset that your body needs!",
          price: 1.99, 
          available: true
        }
      ]
    });

// seeding orders 

await prisma.order.createMany({
  data: [
      { userId: 1, totalPrice: 15.98, status: "completed" },
      { userId: 2, totalPrice: 5.99, status: "in process" }
  ]
});

// seeding order items 

await prisma.orderItem.createMany({
  data: [
      { orderId: 1, menuItemId: 1, quantity: 2 },
      { orderId: 2, menuItemId: 2, quantity: 1 }
  ]
});

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