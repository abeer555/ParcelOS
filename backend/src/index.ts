import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import cron from 'node-cron';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env';
import { swaggerSpec } from './config/swagger';
import { errorHandler } from './middleware/error';
import { generalLimiter } from './middleware/rateLimiter';

import healthRoutes from './routes/health.routes';
import authRoutes from './routes/auth.routes';
import zoneRoutes from './routes/zone.routes';
import areaRoutes from './routes/area.routes';
import rateCardRoutes from './routes/rateCard.routes';
import orderRoutes from './routes/order.routes';
import agentRoutes from './routes/agent.routes';
import trackingRoutes from './routes/tracking.routes';
import adminRoutes from './routes/admin.routes';

const app = express();

// Render sits behind a reverse proxy; trust first hop so req.ip and rate limiting are correct.
app.set('trust proxy', 1);

app.use(helmet());
app.use(cors({ origin: env.FRONTEND_URL || '*' }));
app.use(express.json());
app.use(cookieParser());
app.use(generalLimiter);

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/zones', zoneRoutes);
app.use('/api/areas', areaRoutes);
app.use('/api/rate-cards', rateCardRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/admin', adminRoutes);

app.use(errorHandler);

const PORT = env.PORT;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Swagger docs at http://localhost:${PORT}/api/docs`);
});

// Keep-alive cron for Render
if (env.SELF_URL) {
  cron.schedule('*/5 * * * *', () => {
    console.log('Pinging self to keep alive...');
    fetch(`${env.SELF_URL}/api/health`).catch((err) => {
      console.error('Self ping failed:', err.message);
    });
  });
}
