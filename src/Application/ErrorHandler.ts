import Settings from '../Settings';
import { AssertionError } from 'chai';
import { NextFunction } from 'express-serve-static-core';
import { Request, Response } from 'express';

export default function(error: Error, request: Request, response: Response, next: NextFunction) {
    if (error instanceof AssertionError) {
        const message = error.message.split(':').shift();
        return response.status(400).json({
            error: message,
            message: message,
        });
    }

    if (error instanceof SyntaxError) {
        return response.status(400).json({
            error: 'SYNTAX_ERROR',
            message: error.message,
        });
    }

    console.error(error.message);

    if (Settings.get('environment') !== 'dev') {
        response
            .status(500)
            .json({
                error: 'Whoops!',
                message: 'Something went wrong',
            })
            .send();

        process.exit(1);
    }

    response.status(500).send();
}
