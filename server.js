import app from './src/app.js';
import connectDB from './src/config/db.js';

const PORT = process.env.PORT || 8080;

const startServer = async () => {
    try {
        await connectDB();
        console.log('Database connection successful.')

        const server = app.listen(PORT, () => {
            console.log(`Application running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
        });

        process.on('unhandledRejection', (err) => {
            console.error('UNHANDLED PROMISE REJECTION! Shitting down gracefully...');
            console.error(err.name, err.message);

            server.close(() => {
                process.exit(1);
            });
        });
    }
    catch (err) {
        console.error('CRITICAL: Application failed to initialize on startup!');
        console.error(err);
        process.exit(1);
    }
}

startServer();