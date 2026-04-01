const axios = require("axios")

const res = await axios.post("http://localhost:5000/api/translate/", {
  source,
  target,
  text
})