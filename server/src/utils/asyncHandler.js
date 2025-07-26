

const asyncHandler = (requestHandler) => {
    return async (req, res, next) => {
        try {
            // Run the async request handler
            await requestHandler(req, res, next);
        } catch (err) {
            // If an error occurs, pass it to the next middleware
            next(err);
        }
    };
};

export { asyncHandler };



