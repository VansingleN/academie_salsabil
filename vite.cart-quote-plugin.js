import { createCartQuote, CartQuoteError } from './src/server/cartQuote.js'

function sendJson(response, status, body) {
  response.statusCode = status
  response.setHeader('Content-Type', 'application/json; charset=utf-8')
  response.setHeader('Cache-Control', 'no-store')
  response.end(JSON.stringify(body))
}

async function readJsonBody(request) {
  const chunks = []

  for await (const chunk of request) {
    chunks.push(chunk)
  }

  return JSON.parse(Buffer.concat(chunks).toString('utf8'))
}

// Ce middleware reproduit localement la route Netlify avec le même moteur métier.
// Il n’est inclus que par le serveur de développement Vite.
export function cartQuotePlugin() {
  return {
    name: 'academie-salsabil-cart-quote',
    configureServer(server) {
      const handleCartQuote = async (request, response) => {
        if (request.method !== 'POST') {
          sendJson(response, 405, {
            valid: false,
            code: 'METHOD_NOT_ALLOWED',
            message: 'Méthode non autorisée.'
          })
          return
        }

        try {
          const payload = await readJsonBody(request)
          sendJson(response, 200, createCartQuote(payload))
        } catch (error) {
          const status = error instanceof CartQuoteError ? error.status : 400
          sendJson(response, status, {
            valid: false,
            code: error.code ?? 'INVALID_REQUEST',
            message: error.message ?? 'La requête est invalide.'
          })
        }
      }

      // Vite ne préfixe pas les middlewares personnalisés avec config.base.
      server.middlewares.use('/api/cart-quote', handleCartQuote)
      server.middlewares.use(`${server.config.base}api/cart-quote`, handleCartQuote)
    }
  }
}
