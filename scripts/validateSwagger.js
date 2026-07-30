import SwaggerParser from '@apidevtools/swagger-parser';

try {
    const api = await SwaggerParser.validate('swagger.json');
    const operationCount = Object.values(api.paths).reduce(
        (count, path) =>
            count
            + Object.keys(path).filter((key) =>
                ['get', 'post', 'put', 'delete', 'patch'].includes(key)
            ).length,
        0
    );

    console.log(
        `Swagger validation passed: ${api.info.title} (${operationCount} operations).`
    );
} catch (error) {
    console.error('Swagger validation failed:', error.message);
    process.exitCode = 1;
}
