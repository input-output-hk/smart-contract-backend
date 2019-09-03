const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = 8080

app.use(bodyParser.json())
app.post('/add', (req, res) => res.json({ data: req.body.number1 + req.body.number2 }))
app.get('/schema', (req, res) => {
  const schema = `
    const addArgs = t.type({
      number1: t.number,
      number2: t.number,
    })

    export const add = createEndpoint<typeof addArgs, typeof t.number, t.NullC>('add', addArgs, t.number)
  `

  return res.json({ data: schema })
})

app.listen(port, () => console.log(`Mock contract listening on port ${port}!`))
