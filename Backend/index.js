const express = require('express')
const { Pool } = require('pg')
const dotenv = require('dotenv')
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');


dotenv.config()

const app = express();
app.use(express.json());


app.use(cors());

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
  });

  pool.query('SELECT NOW()', (err, res) => {
    if (err) {
      console.error('Error en la conexión a PostgreSQL:', err.stack);
    } else {
      console.log('Conexión exitosa a PostgreSQL:', res.rows[0]);
    }
  });

//   app.get('/test', async (req, res) 7=> {
//     try {
//       const result = await pool.query('SELECT * FROM usuarios');
//       res.json(result.rows);
//     } catch (err) {
//       console.error('Error al consultar la base de datos:', err.stack);
//       res.status(500).send('Error en la base de datos');
//     }
//   });


  // ENDPOINST RICHIX

  app.post('/api/registro', async (req, res)=>{
    const { usuario } = req.body

    try {
        const countResult = await pool.query (`
          SELECT COUNT (*) FROM usuarios WHERE usuario LIKE $1
          `, [`${usuario}%`]);

          const count = parseInt(countResult.rows[0].count, 10)
          const userHexId = (count + 1).toString(16);
          const usuarioConHex = `${usuario}#${userHexId}`;

        const result = await pool.query(`
            INSERT INTO usuarios (usuario)
            VALUES ($1)
            RETURNING TO_HEX(user_id::int) AS user_id, usuario`,[usuarioConHex]);
           res.status(201).json(result.rows[0])
    }   catch (err) {
        console.error('Error al crear usuario:', err.stack)
        res.status(500).send('Error al crear el usuario');
    }
});

app.post('/api/canales/crear',async (req, res)=>{
  const salaId = uuidv4()  
  
    try {
        const result = await pool.query (`
            INSERT INTO canales (sala_id)
            VALUES ($1)
            RETURNING sala_id`, [salaId])
            res.status(201).json(result.rows[0])
    } catch (error) {
        console.error('Error al crear el canal:', error.stack)
        res.status(500).send('ERror al crear el canal')
    }
});

app.post ('/api/canales/unirse', async (req, res)=>{
    const { sala_id, user_id } = req.body

    try {
      const result =  await pool.query (`
        INSERT INTO miembros_sala (sala_id, user_id)
        VALUES ((SELECT id FROM canales WHERE sala_id = $1), $2)
        RETURNING id, sala_id, user_id`, [sala_id, Buffer.from(user_id, 'hex')])
      
        res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('error al unirse al canal:', error.stack)
      res.status(500).send('Error al unirse al cana')
    }
});

app.get('/api/canales/:salaId', async (req, res) => {
  const { salaId } = req.params

  try {
    const result = await pool.query(`
      SELECT * FROM canales
      WHERE sala_id = $1`, [salaId])

    res.status(200).json(result.rows[0])
  } catch (error) {
    console.error('Error al obtener información del canal:', error.stack)
    res.status(500).send('ERror al obtener información del canal')
  }
});

app.post('/api/mensajes', async (req, res) => {
  const { salaId, userId, mensaje } = req.body

  try {
    const result = await pool.query(`
      INSERT INTO mensajes (sala_id, user_id, mensaje)
      VALUES ((SELECT id FROM canales WHERE sala_id = $1), $2, $3)
      RETURNING id, sala_id, user_id, mensaje, timestamp`, [salaId, userId, mensaje])

    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('Error al enviar el mensaje:', error.stack)
    res.status(500).send('Error al enviar el mensaje')
  }
});

app.get('/api/mensajes/:salaId', async (req, res) => {
  const { salaId } = req.params

  try {
    const result = await pool.query(`
      SELECT * FROM mensajes
      WHERE sala_id = (SELECT id FROM canales WHERE sala_id = $1)`, [salaId])

    res.status(200).json(result.rows)
  } catch (error) {
    console.error('Error al obtener mensajes:', error.stack)
    res.status(500).send('Error al obtener mensajes')
  }
});

const PORT = process.env.PORT || 3001;
app.listen( PORT, ()=> console.log(`server corriendo en el puerto ${PORT}`));