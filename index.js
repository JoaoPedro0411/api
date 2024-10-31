require("dotenv").config();
const express = require("express");
const cors = require('cors')
const { init, connect } = require("./src/config/db-config.js");
const userRoutes = require("./src/routes/userRoutes.js");
const authRoutes = require("./src/routes/authRoutes.js");
const passport = require("./src/config/passportConfig.js");
const PORT = process.env.PORT;
const app = express();
app.use(cors({
  origin: 'http://localhost:8081', 
  credentials: true 
}));

app.use(express.json());
app.use(passport.initialize());
app.use("/users", userRoutes);
app.use("/auth", authRoutes);

connect()
  .then(() => {
    init();
  })
  .catch((error) => {
    console.error("Erro ao conectar ao banco de dados", error);
  });



app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
