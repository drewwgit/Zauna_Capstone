const express = require('express')
const app = express()
const { PrismaClient } = require('@prisma/client')
const cors = require("cors");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const SECRET_KEY = 'wellness';

app.use(express.json());

app.use(cors());

const prisma = new PrismaClient()
const port = 8080

app.get('/', (req, res) => {
  res.send('Hello World!')
})

// VERIFY TOKEN // 

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  console.log('Authorization Header:', authHeader);

  if (!authHeader) {
    return res.status(403).send({ error: 'No token provided.' });
  }

  const token = authHeader.split(' ')[1];
  console.log('Token:', token);

  if (!token) {
    return res.status(403).send({ error: 'No token provided.' });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      console.log('Token verification error:', err);
      return res.status(500).send({ error: 'Failed to authenticate token.' });
    }

    req.userId = decoded.userId;
    console.log('Decoded User ID:', decoded.userId);
    next();
  });
};

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

app.get('/api/user', verifyToken, async (req, res) => {
  const { userId } = req;
  try {
    const user = await prisma.user.findUnique({ where: { id: parseInt(userId) } });
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// create new user - register 

app.post('/api/users/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await prisma.user.create({
          data: {
              name,
              email,
              password: hashedPassword,
          },
      });

      res.status(201).json(newUser); 
  } catch (error) {
      res.status(500).json({ error: 'Failed to create user' });
  }
});

// login user 

app.post('/api/users/login', async (req, res) => {
  const { email, password } = req.body;
  try {
      const user = await prisma.user.findUnique({
          where: { email },
      });
      if (!user) {
          return res.status(401).json({ error: 'Invalid email or password' });
      }
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
          return res.status(401).json({ error: 'Invalid email or password' });
      }

      const token = jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: '1h' });

      res.json({ token, userId: user.id, name: user.name, email: user.email });
  } catch (error) {
      res.status(500).json({ error: 'Failed to login this user' });
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
  console.log('Received Data:', { userId, date, timeSlot }); // Log received data for debugging

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const newBooking = await prisma.gymBooking.create({
      data: {
        user: {
          connect: { id: userId }
        },
        date: new Date(date),
        timeSlot
      }
    });
    res.json(newBooking);
  } catch (error) {
    console.error('Error creating gym booking:', error);
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


// create sauna booking for a user 

app.post('/api/sauna-bookings', async (req, res) => {
  const { userId, saunaRoomId, date, timeSlot } = req.body;
  try {
    const existingBooking = await prisma.saunaBooking.findFirst({
      where: {
        saunaRoomId,
        date: new Date(date),
        timeSlot
      }
    });

    if (existingBooking) {
      return res.status(400).json({ error: 'Sorry! Unfortunately this time slot is already booked.' });
    }

    // Create new booking if the time slot is available
    const newBooking = await prisma.saunaBooking.create({
      data: { userId, saunaRoomId, date: new Date(date), timeSlot }
    });
    res.json(newBooking);
  } catch (error) {
    console.error('Failed to create sauna booking:', error); // Log the error details
    res.status(500).json({ error: 'Failed to create sauna booking' });
  }
});

// get all sauna rooms 

app.get('/api/sauna-rooms', async (req, res) => {
  try {
    const saunaRooms = await prisma.saunaRoom.findMany();
    res.json(saunaRooms);
  } catch (error) {
    console.error('Failed to fetch sauna rooms:', error);
    res.status(500).json({ error: 'Failed to fetch sauna rooms' });
  }
});

// get all available saunarooms 

app.get('/api/sauna-rooms/available', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); 

    const availableRooms = await prisma.saunaRoom.findMany({
      where: {
        bookings: {
          none: {
            date: {
              gte: today,
            },
          },
        },
      },
    });

    res.json(availableRooms);
  } catch (error) {
    console.error('Error fetching available sauna rooms:', error); 
    res.status(500).json({ error: 'Failed to fetch available sauna rooms' });
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


module.exports = verifyToken;

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})