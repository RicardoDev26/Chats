const express = require('express')
const { Pool } = require('pg')
const dotenv = require('dotenv')
const { v4: uuidv4 } = require('uuid')
const cors = require('cors')
const { startClient, sendMessageToTelegram } = require('./telegramService')
const http = require('http')
const { Server } = require('socket.io')

dotenv.config()

const app = express()
app.use(express.json())
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})

const rooms = {}

io.on('connection', (socket) => {
  console.log('Nuevo cliente conectado')

  socket.on('join_room', async (salaId) => {
    socket.join(salaId)

    if (!rooms[salaId]) {
      rooms[salaId] = []
    }
    rooms[salaId].push({ id: socket.id, userId: socket.handshake.query.userId })

    io.to(salaId).emit('update_users', rooms[salaId])

    try {
      const result = await pool.query('SELECT * FROM mensajes WHERE sala_id = $1 ORDER BY timestamp ASC', [salaId])
      socket.emit('old_messages', result.rows)
    } catch (error) {
      console.error('Error al obtener los mensajes:', error)
    }
  })

  socket.on('disconnect', () => {
    console.log('Cliente desconectado')
    for (const salaId in rooms) {
      rooms[salaId] = rooms[salaId].filter(user => user.id !== socket.id)
      io.to(salaId).emit('update_users', rooms[salaId])
    }
  })
})

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}))

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
})

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Error en la conexión a PostgreSQL:', err.stack)
  } else {
    console.log('Conexión exitosa a PostgreSQL:', res.rows[0])
  }
})

app.post('/api/registro', async (req, res) => {
  const { usuario } = req.body

  try {
    const countResult = await pool.query(`
      SELECT COUNT(*) FROM usuarios WHERE usuario LIKE $1
    `, [`${usuario}%`])

    const count = parseInt(countResult.rows[0].count, 10)
    const userHexId = (count + 1).toString(16)
    const usuarioConHex = `${usuario}#${userHexId}`

    const result = await pool.query(`
      INSERT INTO usuarios (usuario)
      VALUES ($1)
      RETURNING TO_HEX(user_id::int) AS user_id, usuario
    `, [usuarioConHex])
    res.status(201).json(result.rows[0])
  } catch (err) {
    console.error('Error al crear usuario:', err.stack)
    res.status(500).send('Error al crear el usuario')
  }
})

app.post('/api/canales/crear', async (req, res) => {
  const salaId = uuidv4()

  try {
    const result = await pool.query(`
      INSERT INTO canales (sala_id)
      VALUES ($1)
      RETURNING sala_id
    `, [salaId])
    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('Error al crear el canal:', error.stack)
    res.status(500).send('Error al crear el canal')
  }
})

app.post('/api/canales/unirse', async (req, res) => {
  const { sala_id, user_id } = req.body

  const parsedUserId = parseInt(user_id, 10)
  if (isNaN(parsedUserId)) {
    return res.status(400).send('Invalid user ID')
  }

  try {
    const result = await pool.query(`
      INSERT INTO miembros_sala (sala_id, user_id)
      VALUES ($1::uuid, $2)
      RETURNING id, sala_id, user_id
    `, [sala_id, parsedUserId])

    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('Error al unirse al canal:', error.stack)
    res.status(500).send('Error al unirse al canal')
  }
})

app.get('/api/canales/:salaId', async (req, res) => {
  const { salaId } = req.params

  try {
    const result = await pool.query(`
      SELECT * FROM canales
      WHERE sala_id = $1::uuid
    `, [salaId])

    res.status(200).json(result.rows[0])
  } catch (error) {
    console.error('Error al obtener información del canal:', error.stack)
    res.status(500).send('Error al obtener información del canal')
  }
})

app.post('/api/mensajes', async (req, res) => {
  const { salaId, userId, mensaje } = req.body
  
  const parsedUserId = parseInt(userId, 10)
  if (isNaN(parsedUserId)) {
    return res.status(400).send('Invalid user ID')
  }

  try {
    const newMessage = {
      sala_id: salaId,
      user_id: parsedUserId,
      mensaje: mensaje,
      timestamp: new Date().toISOString(),
    }

    const result = await pool.query(`
      INSERT INTO mensajes (sala_id, user_id, mensaje, timestamp)
      VALUES ($1::uuid, $2, $3, $4)
      RETURNING id, sala_id, user_id, mensaje, timestamp
    `, [newMessage.sala_id, newMessage.user_id, newMessage.mensaje, newMessage.timestamp])

    io.to(salaId).emit('receive_message', result.rows[0])

    await sendMessageToTelegram(mensaje)

    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('Error al enviar el mensaje:', error.stack)
    res.status(500).send('Error al enviar el mensaje')
  }
})

app.get('/api/mensajes/:salaId', async (req, res) => {
  const { salaId } = req.params

  try {
    const result = await pool.query(`
      SELECT * FROM mensajes
      WHERE sala_id = $1::uuid
    `, [salaId])
    res.status(200).json(result.rows)
  } catch (error) {
    console.error('Error al obtener mensajes:', error.stack)
    res.status(500).send('Error al obtener mensajes')
  }
})

startClient().catch(console.error)

server.listen(3001, () => {
  console.log('Server running on http://localhost:3001')
})
