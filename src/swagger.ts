import swaggerJsdoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import { Express } from 'express'

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'FinAPI - Finance Portfolio API',
      version: '1.0.0',
      description: 'A comprehensive API for managing financial portfolios and assets',
      contact: {
        name: 'API Support',
        email: 'jbyoon@udptechnology.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3313',
        description: 'Development server'
      }
    ],
    components: {
      schemas: {
        Error: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Error message'
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Portfolio',
        description: 'Portfolio management endpoints'
      },
      {
        name: 'Asset',
        description: 'Asset management endpoints'
      },
      {
        name: 'Portfolio Asset Record',
        description: 'Portfolio asset record management endpoints'
      }
    ]
  },
  apis: [
    './src/db/portfolio.api.ts',
    './src/db/asset.api.ts',
    './src/db/assetrecord.api.ts'
  ]
}

const specs = swaggerJsdoc(options)

export const setupSwagger = (app: Express): void => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'FinAPI Documentation'
  }))

  // JSON endpoint for the swagger specification
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json')
    res.send(specs)
  })

  console.log('📚 Swagger documentation available at: http://localhost:3313/api-docs')
}

export default specs
