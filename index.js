const express = require('express')
const app = express()
const { PrismaClient } = require('@prisma/client')
app.use(express.json());

const prisma = new PrismaClient()
const port = 8080

app.get('/', (req, res) => {
  res.send('Hello World!')
})

 //// USERS ROUTES SECTION ////

// get all users 
app.get('/api/users', async (req,res) => {
  try {
  const getAllusers = await prisma.user.findMany();
  res.send(getAllusers)
  } catch (error) {
    res.status(500).json({error: "Failed to get all users"})
  }
});

// get user by ID 

app.get('/api/user/:id', async (req,res) => {
  const { id } = req.params; 
  try {
    const user = await prisma.user.findUnique({ where: {id:parseInt(id)}});
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: "User not found"});
    }
  } catch (error) {
    res.status(500).json({error: "Failed to fetch user"});
  }
});

// create new user 

app.post('/api/users', async (req, res) => {
  const { name, email, password } = req.body;
  try {
      const newUser = await prisma.user.create({
          data: {
              name,
              email,
              password,
          },
      });

      res.status(201).json(newUser); 
  } catch (error) {
      res.status(500).json({ error: 'Failed to create user' });
  }
});

// delete user 

app.delete('/api/user/:id', async (req, res) => {
  const { id } = req.params;
  try {
      await prisma.user.delete({ where: { id: parseInt(id) } });
      res.json({ message: 'User deleted successfully' });
  } catch (error) {
      res.status(500).json({ error: 'Failed to delete user' });
  }
});

    //// GYM BOOKINGS SECTION ////

// get all gym bookings 

app.get('/api/gym-bookings', async (req,res) => {
  try {
  const bookings = await prisma.gymBooking.findMany();
  res.send(bookings)
  } catch (error) {
    res.status(500).json({error: "Failed to get gym bookings"})
  }
});

// create gym booking 

app.post('/api/gym-bookings', async (req, res) => {
  const { userId, date, timeSlot } = req.body;
  try {
      const newBooking = await prisma.gymBooking.create({
          data: { userId, date: new Date(date), timeSlot }
      });
      res.json(newBooking);
  } catch (error) {
      res.status(500).json({ error: 'Failed to create gym booking' });
  }
});

// get gym booking by booking id #

app.get('/api/gym-bookings/:id', async (req,res) => {
  const { id } = req.params; 
  try {
    const user = await prisma.gymBooking.findUnique({ where: {id:parseInt(id)}});
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: "GymBooking not found"});
    }
  } catch (error) {
    res.status(500).json({error: "Failed to fetch booking"});
  }
});

// gym booking by userId 

app.get('/api/user/:userId/gym-bookings', async (req, res) => {
  const { userId } = req.params;
  if (!userId || isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid userId, this user does not exist ' });
  }
  try {
      const gymBookings = await prisma.gymBooking.findMany({
          where: { userId: parseInt(userId) }
      });
      if (gymBookings.length === 0) {
          return res.status(404).json({ message: 'Unable to find any gym bookings for this user' });
      }
      res.json(gymBookings);
  } catch (error) {
      res.status(500).json({ error: 'Failed to fetch gym bookings' });
  }
});


    //// SAUNA ROOM ROUTES 

// get all sauna bookings 

app.get('/api/sauna-bookings', async (req, res) => {
      try {
          const bookings = await prisma.saunaBooking.findMany();
          res.json(bookings);
      } catch (error) {
          res.status(500).json({ error: 'Failed to fetch sauna bookings' });
      }
  });

// get sauna booking by userId

app.get('/api/user/:userId/sauna-bookings', async (req, res) => {
  const { userId } = req.params;
  if (!userId || isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid userId, this user does not exist ' });
  }
  try {
      const saunaBookings = await prisma.saunaBooking.findMany({
          where: { userId: parseInt(userId) }
      });
      if (saunaBookings.length === 0) {
          return res.status(404).json({ message: 'Unable to find any sauna bookings for this user' });
      }
      res.json(saunaBookings);
  } catch (error) {
      res.status(500).json({ error: 'Failed to fetch gym bookings' });
  }
});

// sauna bookings by saunaRoomId

app.get('/api/sauna-room/:saunaRoomId/bookings', async (req, res) => {
  const { saunaRoomId } = req.params;
  if (!saunaRoomId || isNaN(saunaRoomId)) {
      return res.status(400).json({ error: 'Invalid saunaRoomId' });
  }
  try {
      const bookings = await prisma.saunaBooking.findMany({
          where: { saunaRoomId: parseInt(saunaRoomId) }
      });
      if (bookings.length === 0) {
          return res.status(404).json({ message: 'No sauna bookings found for this room' });
      }
      res.json(bookings);
  } catch (error) {
      res.status(500).json({ error: 'Failed to fetch sauna bookings' });
  }
});

    //// ORDER ROUTES ////

// get all orders 

app.get('/api/orders', async (req, res) => {
  try {
      const orders = await prisma.order.findMany();
      res.json(orders);
  } catch (error) {
      res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// get order by userId 

app.get('/api/user/:userId/orders', async (req, res) => {
  const { userId } = req.params;
  if (!userId || isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid userId, this user does not exist ' });
  }
  try {
      const userOrders = await prisma.order.findMany({
          where: { userId: parseInt(userId) }
      });
      if (userOrders.length === 0) {
          return res.status(404).json({ message: 'Unable to find any orders for this user' });
      }
      res.json(userOrders);
  } catch (error) {
      res.status(500).json({ error: 'Failed to fetch orders for user' });
  }
});

// create order 

app.post('/api/orders', async (req,res) => {
  const { userId, totalPrice, status, orderItems } = req.body; 
  try{
    const newOrder = await prisma.order.create({
      data: {
        userId, 
        totalPrice, 
        status, 
        orderItems: {
          create: orderItems.map(item => ({
            menuItemId: item.menuItemId, 
            quantity: item.quantity, 
          }))
        }
      }
    });
    res.json(newOrder);
  } catch (error) {
    res.status(500).json({error: "Failed to create order"});
  }
});

    //// MENU ITEMS //// 

// get all menu items 

app.get('/api/menu-items', async (req, res) => {
  try {
      const items = await prisma.menuItem.findMany();
      res.json(items);
  } catch (error) {
      res.status(500).json({ error: 'Failed to fetch menu items' });
  }
});

// get menu item by id 

app.get('/api/menu-items/:id', async (req,res) => {
  const { id } = req.params; 
  try {
    const menuItem = await prisma.menuItem.findUnique({ where: {id:parseInt(id)}});
    if (menuItem) {
      res.json(menuItem);
    } else {
      res.status(404).json({ error: "MenuItem not found"});
    }
  } catch (error) {
    res.status(500).json({error: "Failed to fetch menuItem"});
  }
});

// create menu item 

app.post('/api/menu-items', async (req, res) => {
  const { name, description, price, available } = req.body;
  try {
      const newItem = await prisma.menuItem.create({
          data: { name, description, price, available }
      });
      res.json(newItem);
  } catch (error) {
      res.status(500).json({ error: 'Failed to create menu item' });
  }
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})